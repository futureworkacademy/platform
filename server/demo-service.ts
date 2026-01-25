import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { 
  organizations, 
  organizationMembers, 
  users,
  simulations,
  teams,
  ROLES,
  DEMO_ACCESS,
  SIMULATION_STATUS,
} from "@shared/models/auth";
import { defaultCompanyState } from "@shared/schema";
import { organizationStorage } from "./organization-storage";
import { randomUUID } from "crypto";

const DEMO_ORG_CODE = "DEMO2025";
const DEMO_ORG_NAME = "Sandbox University - Demo Experience";
const DEMO_EVALUATOR_EXPIRATION_DAYS = 30;

const FAKE_STUDENTS = [
  { firstName: "Alex", lastName: "Chen", email: "demo.student1@sandbox-university.edu" },
  { firstName: "Jordan", lastName: "Williams", email: "demo.student2@sandbox-university.edu" },
  { firstName: "Taylor", lastName: "Martinez", email: "demo.student3@sandbox-university.edu" },
  { firstName: "Morgan", lastName: "Johnson", email: "demo.student4@sandbox-university.edu" },
  { firstName: "Casey", lastName: "Brown", email: "demo.student5@sandbox-university.edu" },
  { firstName: "Riley", lastName: "Davis", email: "demo.student6@sandbox-university.edu" },
];

const FAKE_TEAMS = [
  { name: "Team Alpha", members: ["demo.student1@sandbox-university.edu", "demo.student2@sandbox-university.edu"] },
  { name: "Team Beta", members: ["demo.student3@sandbox-university.edu", "demo.student4@sandbox-university.edu"] },
  { name: "Team Gamma", members: ["demo.student5@sandbox-university.edu", "demo.student6@sandbox-university.edu"] },
];

class DemoService {
  async ensureDemoOrganizationExists(): Promise<string> {
    const existingOrg = await organizationStorage.getOrganizationByCode(DEMO_ORG_CODE);
    if (existingOrg) {
      return existingOrg.id;
    }

    const systemUserId = await this.getOrCreateSystemUser();
    
    const org = await organizationStorage.createOrganization({
      code: DEMO_ORG_CODE,
      name: DEMO_ORG_NAME,
      description: "Demo sandbox for prospective faculty to evaluate the simulation platform. All data is fictional.",
      ownerId: systemUserId,
      status: "active",
      maxMembers: 50,
      notifyOnSignup: false,
      isDemo: true,
    });

    await this.seedDemoData(org.id);
    
    return org.id;
  }

  private async getOrCreateSystemUser(): Promise<string> {
    const [existingUser] = await db.select().from(users)
      .where(eq(users.email, "system@futureworkacademy.com"));
    
    if (existingUser) {
      return existingUser.id;
    }

    const [systemUser] = await db.insert(users).values({
      id: randomUUID(),
      email: "system@futureworkacademy.com",
      firstName: "System",
      lastName: "Admin",
      isAdmin: "super_admin",
    }).returning();

    return systemUser.id;
  }

  private async seedDemoData(orgId: string): Promise<void> {
    const fakeStudentIds: Record<string, string> = {};
    for (const student of FAKE_STUDENTS) {
      const [existingUser] = await db.select().from(users)
        .where(eq(users.email, student.email));
      
      let userId: string;
      if (existingUser) {
        userId = existingUser.id;
      } else {
        const [newUser] = await db.insert(users).values({
          id: randomUUID(),
          email: student.email,
          firstName: student.firstName,
          lastName: student.lastName,
          isTestStudent: true,
          demoAccess: DEMO_ACCESS.NONE,
        }).returning();
        userId = newUser.id;
      }
      
      fakeStudentIds[student.email] = userId;

      const existingMember = await organizationStorage.getMember(userId, orgId);
      if (!existingMember) {
        await organizationStorage.addMember({
          userId,
          organizationId: orgId,
          role: ROLES.STUDENT,
          status: "active",
          approvedAt: new Date(),
        });
      }
    }

    for (const teamData of FAKE_TEAMS) {
      const memberIds = teamData.members.map(email => fakeStudentIds[email]);
      
      const [existingTeam] = await db.select().from(teams)
        .where(and(
          eq(teams.name, teamData.name),
          eq(teams.organizationId, orgId)
        ));

      if (!existingTeam) {
        const [newTeam] = await db.insert(teams).values({
          id: randomUUID(),
          name: teamData.name,
          organizationId: orgId,
          currentWeek: 3,
          totalWeeks: 8,
          setupComplete: true,
          researchComplete: true,
          members: memberIds.map(id => ({ id, role: "member" })),
          companyState: {
            ...defaultCompanyState,
            revenue: 125000000 + Math.floor(Math.random() * 10000000),
            employees: 2400 + Math.floor(Math.random() * 200),
            morale: 68 + Math.floor(Math.random() * 15),
          },
          decisions: [],
          decisionRecords: [
            { weekNumber: 1, option: "cautious_approach", submittedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
            { weekNumber: 2, option: "pilot_program", submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
          ],
          weeklyHistory: [],
          viewedReportIds: [],
        }).returning();

        for (const memberId of memberIds) {
          await db.update(users)
            .set({ teamId: newTeam.id })
            .where(eq(users.id, memberId));
        }
      }
    }

    const [existingSim] = await db.select().from(simulations)
      .where(eq(simulations.organizationId, orgId));
    
    if (!existingSim) {
      await db.insert(simulations).values({
        id: randomUUID(),
        organizationId: orgId,
        status: SIMULATION_STATUS.ACTIVE,
        difficultyLevel: "standard",
        totalWeeks: 8,
        currentWeek: 3,
        startedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      });
    }
  }

  async provisionEvaluator(email: string, name: string, institution?: string): Promise<{ userId: string; orgId: string; expiresAt: Date }> {
    const demoOrgId = await this.ensureDemoOrganizationExists();
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + DEMO_EVALUATOR_EXPIRATION_DAYS);

    const [existingUser] = await db.select().from(users)
      .where(eq(users.email, email));
    
    let userId: string;
    const nameParts = name.split(" ");
    const firstName = nameParts[0] || "Evaluator";
    const lastName = nameParts.slice(1).join(" ") || "";

    if (existingUser) {
      if (existingUser.demoAccess !== DEMO_ACCESS.EVALUATOR) {
        await db.update(users)
          .set({
            demoAccess: DEMO_ACCESS.EVALUATOR,
            demoExpiresAt: expiresAt,
            institution: institution || existingUser.institution,
          })
          .where(eq(users.id, existingUser.id));
      }
      userId = existingUser.id;
    } else {
      const [newUser] = await db.insert(users).values({
        id: randomUUID(),
        email,
        firstName,
        lastName,
        institution,
        demoAccess: DEMO_ACCESS.EVALUATOR,
        demoExpiresAt: expiresAt,
      }).returning();
      userId = newUser.id;
    }

    const existingMember = await organizationStorage.getMember(userId, demoOrgId);
    if (!existingMember) {
      await organizationStorage.addMember({
        userId,
        organizationId: demoOrgId,
        role: ROLES.CLASS_ADMIN,
        status: "active",
        approvedAt: new Date(),
      });
    }

    return { userId, orgId: demoOrgId, expiresAt };
  }

  async isEvaluator(userId: string): Promise<boolean> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return false;
    
    if (user.demoAccess !== DEMO_ACCESS.EVALUATOR) return false;
    
    if (user.demoExpiresAt && new Date(user.demoExpiresAt) < new Date()) {
      return false;
    }
    
    return true;
  }

  async isDemoOrganization(orgId: string): Promise<boolean> {
    const org = await organizationStorage.getOrganization(orgId);
    return org?.isDemo === true;
  }

  async getUserAllowedOrganizations(userId: string): Promise<string[]> {
    const isEvaluator = await this.isEvaluator(userId);
    const memberships = await organizationStorage.getMembershipsByUser(userId);
    
    const allowedOrgIds: string[] = [];
    
    for (const membership of memberships) {
      const org = await organizationStorage.getOrganization(membership.organizationId);
      if (!org) continue;
      
      if (isEvaluator) {
        if (org.isDemo) {
          allowedOrgIds.push(org.id);
        }
      } else {
        allowedOrgIds.push(org.id);
      }
    }
    
    return allowedOrgIds;
  }

  getDemoOrgCode(): string {
    return DEMO_ORG_CODE;
  }
}

export const demoService = new DemoService();
