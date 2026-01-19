import { db } from "../db";
import { scheduledReminders, users, teams, organizationMembers, organizations, simulations } from "@shared/models/auth";
import { eq, and, lte, inArray } from "drizzle-orm";
import { sendReminderEmail } from "./email";
import { sendCustomSms, isTwilioConfigured } from "../twilio-service";

const PROCESS_INTERVAL_MS = 60000; // Check every minute

async function getStudentsForReminder(
  organizationId: string, 
  audience: string,
  teamId?: string | null
): Promise<Array<{ userId: string; email: string; firstName: string; smsEnabled: boolean; notifyPhone?: string }>> {
  if (audience === "instructors") {
    const instructorMembers = await db.select({
      userId: organizationMembers.userId,
      email: users.email,
      firstName: users.firstName,
      smsEnabled: users.smsEnabled,
      notifyPhone: users.notifyPhone,
    })
      .from(organizationMembers)
      .innerJoin(users, eq(users.id, organizationMembers.userId))
      .where(and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.status, "active"),
        inArray(organizationMembers.role, ["class_admin", "super_admin"])
      ));
    return instructorMembers.map(m => ({
      userId: m.userId,
      email: m.email || "",
      firstName: m.firstName || "Instructor",
      smsEnabled: m.smsEnabled ?? true,
      notifyPhone: m.notifyPhone || undefined,
    }));
  }

  if (audience === "specific_team" && teamId) {
    const teamMembers = await db.select({
      userId: users.id,
      email: users.email,
      firstName: users.firstName,
      smsEnabled: users.smsEnabled,
      notifyPhone: users.notifyPhone,
    })
      .from(users)
      .where(eq(users.teamId, teamId));
    return teamMembers.map(m => ({
      userId: m.userId,
      email: m.email || "",
      firstName: m.firstName || "Student",
      smsEnabled: m.smsEnabled ?? true,
      notifyPhone: m.notifyPhone || undefined,
    }));
  }

  if (audience === "no_submission") {
    // Get the active simulation for this organization to know current week
    const [activeSimulation] = await db.select().from(simulations)
      .where(and(
        eq(simulations.organizationId, organizationId),
        eq(simulations.status, "active")
      ));
    
    const currentSimulationWeek = activeSimulation?.currentWeek || 1;

    // Get all teams in the organization
    const orgTeams = await db.select().from(teams)
      .where(eq(teams.organizationId, organizationId));
    
    // Filter teams that haven't submitted for the CURRENT simulation week
    const teamsWithNoDecisions = orgTeams.filter(team => {
      const decisions = team.decisions as any[] || [];
      // Check if there's a submitted decision for the current simulation week
      const hasCurrentWeekDecision = decisions.some(
        (d: any) => d.week === currentSimulationWeek && d.submitted === true
      );
      return !hasCurrentWeekDecision;
    });

    if (teamsWithNoDecisions.length === 0) {
      return [];
    }

    const teamIds = teamsWithNoDecisions.map(t => t.id);
    const studentsWithNoSubmission = await db.select({
      userId: users.id,
      email: users.email,
      firstName: users.firstName,
      smsEnabled: users.smsEnabled,
      notifyPhone: users.notifyPhone,
    })
      .from(users)
      .where(inArray(users.teamId, teamIds));

    return studentsWithNoSubmission.map(m => ({
      userId: m.userId,
      email: m.email || "",
      firstName: m.firstName || "Student",
      smsEnabled: m.smsEnabled ?? true,
      notifyPhone: m.notifyPhone || undefined,
    }));
  }

  // Default: all students in the organization
  const allStudents = await db.select({
    userId: organizationMembers.userId,
    email: users.email,
    firstName: users.firstName,
    smsEnabled: users.smsEnabled,
    notifyPhone: users.notifyPhone,
  })
    .from(organizationMembers)
    .innerJoin(users, eq(users.id, organizationMembers.userId))
    .where(and(
      eq(organizationMembers.organizationId, organizationId),
      eq(organizationMembers.status, "active"),
      eq(organizationMembers.role, "student")
    ));

  return allStudents.map(m => ({
    userId: m.userId,
    email: m.email || "",
    firstName: m.firstName || "Student",
    smsEnabled: m.smsEnabled ?? true,
    notifyPhone: m.notifyPhone || undefined,
  }));
}

async function processReminder(reminder: typeof scheduledReminders.$inferSelect) {
  console.log(`[ReminderProcessor] Processing reminder: ${reminder.id} - ${reminder.title}`);

  try {
    const [org] = await db.select().from(organizations)
      .where(eq(organizations.id, reminder.organizationId));

    if (!org) {
      console.error(`[ReminderProcessor] Organization not found for reminder ${reminder.id}`);
      await db.update(scheduledReminders)
        .set({ status: "failed", updatedAt: new Date() })
        .where(eq(scheduledReminders.id, reminder.id));
      return;
    }

    const recipients = await getStudentsForReminder(
      reminder.organizationId,
      reminder.audience,
      reminder.teamId
    );

    if (recipients.length === 0) {
      console.log(`[ReminderProcessor] No recipients for reminder ${reminder.id} (audience: ${reminder.audience})`);
      await db.update(scheduledReminders)
        .set({ 
          status: "sent", 
          sentAt: new Date(), 
          sendCount: 0,
          updatedAt: new Date() 
        })
        .where(eq(scheduledReminders.id, reminder.id));
      return;
    }

    let sendCount = 0;
    let failCount = 0;
    const twilioEnabled = reminder.sendSms && await isTwilioConfigured();

    for (const recipient of recipients) {
      try {
        await sendReminderEmail({
          toEmail: recipient.email,
          studentName: recipient.firstName,
          className: org.name,
          subject: reminder.title,
          message: reminder.message,
        });
        sendCount++;

        // Send SMS with the actual reminder content
        if (twilioEnabled && recipient.smsEnabled && recipient.notifyPhone) {
          try {
            // Build SMS message from reminder content
            const smsMessage = `${reminder.title}: ${reminder.message.substring(0, 140)}${reminder.message.length > 140 ? '...' : ''}`;
            await sendCustomSms(recipient.notifyPhone, smsMessage);
          } catch (smsError) {
            console.error(`[ReminderProcessor] SMS failed for ${recipient.email}:`, smsError);
          }
        }
      } catch (emailError) {
        console.error(`[ReminderProcessor] Email failed for ${recipient.email}:`, emailError);
        failCount++;
      }
    }

    await db.update(scheduledReminders)
      .set({
        status: failCount === recipients.length ? "failed" : "sent",
        sentAt: new Date(),
        sendCount,
        failCount,
        updatedAt: new Date(),
      })
      .where(eq(scheduledReminders.id, reminder.id));

    console.log(`[ReminderProcessor] Reminder ${reminder.id} processed: ${sendCount} sent, ${failCount} failed`);
  } catch (error) {
    console.error(`[ReminderProcessor] Error processing reminder ${reminder.id}:`, error);
    await db.update(scheduledReminders)
      .set({ 
        status: "failed", 
        failCount: (reminder.failCount || 0) + 1,
        updatedAt: new Date() 
      })
      .where(eq(scheduledReminders.id, reminder.id));
  }
}

async function processPendingReminders() {
  const now = new Date();
  
  const pendingReminders = await db.select().from(scheduledReminders)
    .where(and(
      eq(scheduledReminders.status, "pending"),
      lte(scheduledReminders.scheduledFor, now)
    ));

  if (pendingReminders.length === 0) {
    return;
  }

  console.log(`[ReminderProcessor] Found ${pendingReminders.length} pending reminders to process`);

  for (const reminder of pendingReminders) {
    await processReminder(reminder);
  }
}

let processorInterval: NodeJS.Timeout | null = null;
let isStarted = false;

export function startReminderProcessor() {
  // Prevent multiple starts across hot reloads
  if (isStarted || processorInterval) {
    console.log("[ReminderProcessor] Already running, skipping start");
    return;
  }

  isStarted = true;
  console.log("[ReminderProcessor] Starting reminder processor (checking every minute)");
  
  // Run initial check
  processPendingReminders().catch(err => 
    console.error("[ReminderProcessor] Error in initial check:", err)
  );

  processorInterval = setInterval(async () => {
    try {
      await processPendingReminders();
    } catch (error) {
      console.error("[ReminderProcessor] Error processing reminders:", error);
    }
  }, PROCESS_INTERVAL_MS);

  // Register cleanup handlers for graceful shutdown
  const cleanup = () => {
    stopReminderProcessor();
  };

  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);
  process.on('beforeExit', cleanup);
}

export function stopReminderProcessor() {
  if (processorInterval) {
    clearInterval(processorInterval);
    processorInterval = null;
    isStarted = false;
    console.log("[ReminderProcessor] Stopped reminder processor");
  }
}
