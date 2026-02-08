import { sql } from "drizzle-orm";
import { boolean, index, integer, jsonb, pgTable, timestamp, varchar, text } from "drizzle-orm/pg-core";

// Role enum values
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  CLASS_ADMIN: "class_admin", 
  STUDENT: "student",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Organization status enum values
export const ORG_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ARCHIVED: "archived",
} as const;

// Demo/Evaluator access levels
export const DEMO_ACCESS = {
  NONE: "none",           // Regular user - no demo restrictions
  EVALUATOR: "evaluator", // Demo-only access for prospective faculty
  STUDENT_TRIAL: "student_trial", // 7-day trial for students who discover the platform
} as const;

export type DemoAccess = typeof DEMO_ACCESS[keyof typeof DEMO_ACCESS];

export type OrgStatus = typeof ORG_STATUS[keyof typeof ORG_STATUS];

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  teamId: varchar("team_id"),
  isAdmin: varchar("is_admin").default("false"),
  jobTitle: varchar("job_title"),
  company: varchar("company"),
  institution: varchar("institution"),
  department: varchar("department"),
  schoolEmail: varchar("school_email"),
  schoolEmailVerified: varchar("school_email_verified").default("false"),
  verificationCode: varchar("verification_code"),
  verificationCodeExpires: timestamp("verification_code_expires"),
  notifyPhone: varchar("notify_phone"),
  smsEnabled: boolean("sms_enabled").default(true),
  isTestStudent: boolean("is_test_student").default(false),
  testStudentOwnerId: varchar("test_student_owner_id"),
  testStudentOwnerOrgId: varchar("test_student_owner_org_id"),
  inStudentPreview: boolean("in_student_preview").default(false),
  previewModeOrgId: varchar("preview_mode_org_id"),
  inInstructorPreview: boolean("in_instructor_preview").default(false),
  instructorPreviewOrgId: varchar("instructor_preview_org_id"),
  inDemoPreview: boolean("in_demo_preview").default(false), // Super admin viewing as evaluator
  demoPreviewOrgId: varchar("demo_preview_org_id"), // Demo org being previewed
  demoAccess: varchar("demo_access").default("none"), // none, evaluator - restricts to demo orgs only
  demoExpiresAt: timestamp("demo_expires_at"), // When evaluator access expires
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Teams table for persistent game state
export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  organizationId: varchar("organization_id"), // Links team to organization/class
  currentWeek: integer("current_week").notNull().default(1),
  totalWeeks: integer("total_weeks").notNull().default(8),
  setupComplete: boolean("setup_complete").notNull().default(false),
  researchComplete: boolean("research_complete").notNull().default(false),
  
  // Phone-a-Friend advisor credits (3 per simulation by default)
  advisorCreditsRemaining: integer("advisor_credits_remaining").notNull().default(3),
  
  // JSONB for complex nested game state
  members: jsonb("members").notNull().default([]),
  companyState: jsonb("company_state").notNull(),
  decisions: jsonb("decisions").notNull().default([]),
  decisionRecords: jsonb("decision_records").notNull().default([]),
  weeklyHistory: jsonb("weekly_history").notNull().default([]),
  viewedReportIds: jsonb("viewed_report_ids").notNull().default([]),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type DbTeam = typeof teams.$inferSelect;
export type InsertDbTeam = typeof teams.$inferInsert;

// Organizations table - represents a class/cohort managed by a Class Admin
export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code").notNull().unique(), // The "team code" professors give to students
  name: varchar("name").notNull(),
  description: text("description"),
  ownerId: varchar("owner_id").notNull(), // The Class Admin who owns this org
  status: varchar("status").notNull().default("active"), // active, inactive, archived
  maxMembers: integer("max_members").default(100),
  notifyOnSignup: boolean("notify_on_signup").default(true),
  notifyEmail: varchar("notify_email"),
  notifyPhone: varchar("notify_phone"),
  isDemo: boolean("is_demo").default(false), // Demo organizations are sandboxed for evaluators
  // Privacy Mode: Enables anonymous enrollment without PII collection
  privacyMode: boolean("privacy_mode").default(false),
  // When privacy mode is on, all notifications are disabled
  privacyModeNotificationsDisabled: boolean("privacy_mode_notifications_disabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

// Organization members - links users to organizations with roles
export const organizationMembers = pgTable("organization_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  organizationId: varchar("organization_id").notNull(),
  role: varchar("role").notNull().default("student"), // super_admin, class_admin, student
  status: varchar("status").notNull().default("pending"), // pending, active, suspended, deactivated
  joinedAt: timestamp("joined_at").defaultNow(),
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
  deactivatedAt: timestamp("deactivated_at"),
  deactivatedBy: varchar("deactivated_by"),
});

export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type InsertOrganizationMember = typeof organizationMembers.$inferInsert;

// Organization invites - team codes with usage tracking and expiration
export const organizationInvites = pgTable("organization_invites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull(),
  code: varchar("code").notNull().unique(), // Same as org code, or additional invite codes
  maxUses: integer("max_uses").default(100),
  usedCount: integer("used_count").notNull().default(0),
  expiresAt: timestamp("expires_at"),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
});

export type OrganizationInvite = typeof organizationInvites.$inferSelect;
export type InsertOrganizationInvite = typeof organizationInvites.$inferInsert;

// Notifications table - for dashboard alerts
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // Who should see this notification
  type: varchar("type").notNull(), // signup, team_assignment, week_advanced, etc.
  title: varchar("title").notNull(),
  message: text("message"),
  data: jsonb("data"), // Additional context data
  read: boolean("read").notNull().default(false),
  emailSent: boolean("email_sent").default(false),
  smsSent: boolean("sms_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// Educator inquiries - contact form submissions from "For Educators" page
export const educatorInquiries = pgTable("educator_inquiries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  institution: varchar("institution"),
  inquiryType: varchar("inquiry_type").notNull().default("general"), // general, demo_request, pricing, partnership
  message: text("message").notNull(),
  status: varchar("status").notNull().default("new"), // new, contacted, resolved
  notes: text("notes"), // Admin notes
  referralSource: varchar("referral_source"), // e.g. "student_trial_abc123" for student referrals
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type EducatorInquiry = typeof educatorInquiries.$inferSelect;
export type InsertEducatorInquiry = typeof educatorInquiries.$inferInsert;

// Platform settings - global configuration managed by Super Admin
export const platformSettings = pgTable("platform_settings", {
  id: varchar("id").primaryKey().default("default"),
  requireEduEmail: boolean("require_edu_email").notNull().default(true),
  requireTeamCode: boolean("require_team_code").notNull().default(true),
  competitionMode: varchar("competition_mode").notNull().default("individual"), // individual, team
  totalWeeks: integer("total_weeks").notNull().default(8),
  scoringWeightFinancial: integer("scoring_weight_financial").notNull().default(50),
  scoringWeightCultural: integer("scoring_weight_cultural").notNull().default(50),
  easterEggBonusEnabled: boolean("easter_egg_bonus_enabled").notNull().default(true),
  easterEggBonusPercentage: integer("easter_egg_bonus_percentage").notNull().default(5),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by"),
});

export type PlatformSettingsDb = typeof platformSettings.$inferSelect;
export type InsertPlatformSettingsDb = typeof platformSettings.$inferInsert;

// About page content - editable by super admins
export const aboutPageContent = pgTable("about_page_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  photoUrl: text("photo_url"),
  content: text("content"), // HTML or markdown content
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by"),
});

export type AboutPageContentDb = typeof aboutPageContent.$inferSelect;
export type InsertAboutPageContentDb = typeof aboutPageContent.$inferInsert;

// Email templates - editable by super admins
export const EMAIL_TEMPLATE_TYPES = {
  INVITATION: "invitation",
  REMINDER: "reminder",
  WELCOME: "welcome",
  SIMULATION_START: "simulation_start",
} as const;

export type EmailTemplateType = typeof EMAIL_TEMPLATE_TYPES[keyof typeof EMAIL_TEMPLATE_TYPES];

export const emailTemplates = pgTable("email_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateType: varchar("template_type").notNull().unique(), // invitation, reminder, welcome, simulation_start
  name: varchar("name").notNull(), // Display name
  subject: text("subject").notNull(), // Email subject line
  htmlContent: text("html_content").notNull(), // HTML body with placeholders like {{studentName}}, {{className}}
  textContent: text("text_content").notNull(), // Plain text version
  isActive: boolean("is_active").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: varchar("updated_by"),
});

export type EmailTemplateDb = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplateDb = typeof emailTemplates.$inferInsert;

// Simulation status enum
export const SIMULATION_STATUS = {
  SETUP: "setup",
  ACTIVE: "active",
  PAUSED: "paused",
  COMPLETED: "completed",
} as const;

export type SimulationStatus = typeof SIMULATION_STATUS[keyof typeof SIMULATION_STATUS];

// Difficulty level presets - Introductory (Undergraduate), Standard (Corporate), Advanced (MBA)
export const DIFFICULTY_LEVELS = {
  INTRODUCTORY: "introductory",
  STANDARD: "standard",
  ADVANCED: "advanced",
} as const;

export type DifficultyLevel = typeof DIFFICULTY_LEVELS[keyof typeof DIFFICULTY_LEVELS];

// Simulations - tracks the lifecycle of each class simulation
export const simulations = pgTable("simulations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().unique(),
  moduleId: varchar("module_id"), // Links to simulation_modules - which scenario to use
  status: varchar("status").notNull().default("setup"), // setup, active, paused, completed
  difficultyLevel: varchar("difficulty_level").notNull().default("advanced"), // introductory, standard, advanced
  totalWeeks: integer("total_weeks").notNull().default(8),
  currentWeek: integer("current_week").notNull().default(0),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  startedAt: timestamp("started_at"),
  startedBy: varchar("started_by"),
  completedAt: timestamp("completed_at"),
  completedBy: varchar("completed_by"),
  feedbackFormUrl: text("feedback_form_url"), // Google Form embed URL for post-simulation survey
  // Difficulty overrides - JSON field for per-simulation factor customization
  difficultyOverrides: text("difficulty_overrides"), // JSON: {phoneAFriendUses: 4, eventProbability: 0.25, ...}
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Simulation = typeof simulations.$inferSelect;
export type InsertSimulation = typeof simulations.$inferInsert;

// Reminder template types
export const REMINDER_TEMPLATES = {
  WELCOME: "welcome",
  NO_SUBMISSION_WARNING: "no_submission_warning",
  SCORE_UPDATE: "score_update",
  THANK_YOU: "thank_you",
  CUSTOM: "custom",
} as const;

export type ReminderTemplateType = typeof REMINDER_TEMPLATES[keyof typeof REMINDER_TEMPLATES];

// Scheduled reminders - email queue for simulation notifications
export const scheduledReminders = pgTable("scheduled_reminders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull(),
  simulationId: varchar("simulation_id"),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  audience: varchar("audience").notNull().default("all_students"), // all_students, instructors, specific_team, no_submission
  teamId: varchar("team_id"), // If audience is specific_team
  scheduledFor: timestamp("scheduled_for").notNull(),
  relativeToWeek: integer("relative_to_week"), // Optional: which simulation week this relates to
  templateType: varchar("template_type").default("custom"), // welcome, no_submission_warning, score_update, thank_you, custom
  sendSms: boolean("send_sms").default(false), // Whether to also send SMS
  status: varchar("status").notNull().default("pending"), // pending, sent, failed, cancelled
  sentAt: timestamp("sent_at"),
  sendCount: integer("send_count").default(0),
  failCount: integer("fail_count").default(0),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type ScheduledReminder = typeof scheduledReminders.$inferSelect;
export type InsertScheduledReminder = typeof scheduledReminders.$inferInsert;

// Simulation Modules - different simulation scenarios (AI, Supply Chain, etc.)
export const simulationModules = pgTable("simulation_modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(), // e.g., "AI Workplace Transformation", "Supply Chain Disruption"
  description: text("description"),
  slug: varchar("slug").notNull().unique(), // URL-friendly identifier
  isDefault: boolean("is_default").notNull().default(false), // One module is the default
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type SimulationModule = typeof simulationModules.$inferSelect;
export type InsertSimulationModule = typeof simulationModules.$inferInsert;

// Content types for simulation content items
export const CONTENT_TYPES = {
  TEXT: "text",
  VIDEO: "video", // YouTube, Vimeo embed
  AUDIO: "audio", // Podcast-style audio content
  GOOGLE_DOC: "google_doc", // Google Docs/Slides embed
  LINK: "link", // External resource link
  FILE: "file", // Uploaded file (future)
  MEDIA: "media", // Uploaded media (video/audio) stored in object storage
} as const;

export type ContentType = typeof CONTENT_TYPES[keyof typeof CONTENT_TYPES];

// Simulation Content - per-week content items for each module
export const simulationContent = pgTable("simulation_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  moduleId: varchar("module_id").notNull(), // Which simulation module this belongs to
  weekNumber: integer("week_number").notNull(), // Which week (1-12)
  title: varchar("title").notNull(),
  contentType: varchar("content_type").notNull().default("text"), // text, video, audio, google_doc, link, media
  content: text("content"), // Rich text content OR embed URL depending on type
  embedUrl: text("embed_url"), // For video/google doc embeds
  resourceUrl: text("resource_url"), // For external links
  thumbnailUrl: text("thumbnail_url"), // Optional preview image
  order: integer("order").notNull().default(0), // Sort order within the week
  isActive: boolean("is_active").notNull().default(true),
  // Media-specific fields for uploaded video/audio content
  mediaUrl: text("media_url"), // Object storage path for uploaded media
  mediaDurationSeconds: integer("media_duration_seconds"), // Duration for progress tracking
  transcript: text("transcript"), // Full transcript for accessibility & LLM reference
  transcriptTimestamps: jsonb("transcript_timestamps"), // Array of {time: number, text: string} for synced display
  // Category for intel content (optional)
  category: varchar("category"), // industry, company, workforce, technology, etc.
  isIntelContent: boolean("is_intel_content").default(false), // Whether this counts for Intel Bonus
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by"),
  updatedBy: varchar("updated_by"),
});

export type SimulationContentDb = typeof simulationContent.$inferSelect;
export type InsertSimulationContentDb = typeof simulationContent.$inferInsert;

// Content views tracking - records which content items users have viewed
export const contentViews = pgTable("content_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  teamId: varchar("team_id"),
  contentType: varchar("content_type").notNull(), // 'research_report', 'briefing_section', 'simulation_content'
  contentId: varchar("content_id").notNull(), // ID of the specific content item
  weekNumber: integer("week_number"), // Which week the view occurred (for briefing content)
  viewedAt: timestamp("viewed_at").defaultNow(),
  timeSpentSeconds: integer("time_spent_seconds"), // Optional: how long they spent viewing
});

export type ContentViewDb = typeof contentViews.$inferSelect;
export type InsertContentViewDb = typeof contentViews.$inferInsert;

// Media engagement tracking - detailed progress for video/audio content
export const mediaEngagement = pgTable("media_engagement", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  teamId: varchar("team_id"),
  contentId: varchar("content_id").notNull(), // simulation_content ID
  weekNumber: integer("week_number"),
  // Engagement milestones
  started: boolean("started").default(false), // User clicked play
  percentWatched: integer("percent_watched").default(0), // 0-100
  completed: boolean("completed").default(false), // 75%+ watched = completed
  // Detailed progress data
  lastPositionSeconds: integer("last_position_seconds").default(0), // Resume position
  totalWatchTimeSeconds: integer("total_watch_time_seconds").default(0), // Accumulated watch time
  completedAt: timestamp("completed_at"), // When they reached 75%+
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type MediaEngagementDb = typeof mediaEngagement.$inferSelect;
export type InsertMediaEngagementDb = typeof mediaEngagement.$inferInsert;

// Character Profiles - AI-generated personas for immersive simulation
export const characterProfiles = pgTable("character_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  moduleId: varchar("module_id"), // null = global character, otherwise module-specific
  name: varchar("name").notNull(),
  role: varchar("role").notNull(), // e.g., "CEO", "Union Leader", "HR Director"
  title: varchar("title"), // e.g., "Chief Executive Officer"
  company: varchar("company"), // e.g., "Apex Manufacturing"
  // AI-generated headshot stored in object storage
  headshotUrl: text("headshot_url"),
  headshotPrompt: text("headshot_prompt"), // Prompt used to generate the headshot
  // Rich bio and personality
  bio: text("bio"), // Full backstory
  personality: text("personality"), // Personality traits description
  communicationStyle: text("communication_style"), // How they speak/write
  motivations: text("motivations"), // What drives them
  fears: text("fears"), // What concerns them
  // Relationships with other characters
  relationships: jsonb("relationships"), // Array of {characterId, relationshipType, description}
  // Voice/audio settings for triggered voicemails
  voiceDescription: text("voice_description"), // Description for AI voice synthesis
  voiceId: varchar("voice_id"), // External voice ID if using voice synthesis
  // Structured voice profile for external voice synthesis tools (ElevenLabs, etc.)
  voiceProfile: jsonb("voice_profile"), // {pitch, pace, accent, tone, ageRange, emotionalBaseline, distinctiveQualities}
  // Content generation prompts
  speakingStyleExamples: jsonb("speaking_style_examples"), // Array of example quotes
  // Social media profile content (LinkedIn-style simulated profile)
  socialProfile: jsonb("social_profile"), // {headline, about, experience, education, skills, connections}
  // Quantifiable traits for simulation mechanics (1-10 scale)
  influence: integer("influence").default(5), // How much sway they have over decisions
  hostility: integer("hostility").default(5), // How antagonistic they are
  flexibility: integer("flexibility").default(5), // How open they are to change
  riskTolerance: integer("risk_tolerance").default(5), // How comfortable with uncertainty
  // Categories this character impacts (used for decision difficulty modifiers)
  impactCategories: jsonb("impact_categories"), // Array of category strings: ["labor", "finance", "technology", "culture"]
  // Metadata
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by"),
});

export type CharacterProfileDb = typeof characterProfiles.$inferSelect;
export type InsertCharacterProfileDb = typeof characterProfiles.$inferInsert;

// Triggered Voicemails - immersive notifications from characters
export const triggeredVoicemails = pgTable("triggered_voicemails", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  moduleId: varchar("module_id").notNull(),
  characterId: varchar("character_id").notNull(), // Which character sends this voicemail
  weekNumber: integer("week_number"), // null = any week
  title: varchar("title").notNull(),
  // Trigger conditions
  triggerType: varchar("trigger_type").notNull(), // time_window, decision_made, content_viewed, week_started, score_threshold, random
  triggerCondition: jsonb("trigger_condition"), // Condition details based on triggerType
  // Content
  audioUrl: text("audio_url"), // Pre-recorded or AI-generated audio
  transcript: text("transcript").notNull(), // Text transcript for accessibility
  duration: integer("duration"), // Duration in seconds
  // Display settings
  urgency: varchar("urgency").default("medium"), // low, medium, high, critical
  expiresAfterMinutes: integer("expires_after_minutes"), // How long before voicemail dismisses
  // Metadata
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type TriggeredVoicemailDb = typeof triggeredVoicemails.$inferSelect;
export type InsertTriggeredVoicemailDb = typeof triggeredVoicemails.$inferInsert;

// Phone-a-Friend Advisors - specialized advisors students can consult
export const phoneAFriendAdvisors = pgTable("phone_a_friend_advisors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  characterId: varchar("character_id").notNull(), // Links to character profile
  moduleId: varchar("module_id"), // null = available in all modules
  specialty: varchar("specialty").notNull(), // finance, hr, operations, legal, union, technology, marketing, strategy, ethics
  // AI prompt context for generating advice
  expertiseDescription: text("expertise_description").notNull(), // What they know about
  adviceStyle: text("advice_style"), // How they give advice
  biases: text("biases"), // Their professional biases
  // Display settings
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type PhoneAFriendAdvisorDb = typeof phoneAFriendAdvisors.$inferSelect;
export type InsertPhoneAFriendAdvisorDb = typeof phoneAFriendAdvisors.$inferInsert;

// Phone-a-Friend Usage tracking - 3 lifelines per student per simulation
export const phoneAFriendUsage = pgTable("phone_a_friend_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  teamId: varchar("team_id"),
  simulationId: varchar("simulation_id").notNull(), // Which simulation run
  advisorId: varchar("advisor_id").notNull(), // Which advisor was consulted
  weekNumber: integer("week_number").notNull(),
  // The question asked and advice received
  question: text("question").notNull(),
  context: text("context"), // Current situation context
  advice: text("advice").notNull(), // AI-generated response
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
});

export type PhoneAFriendUsageDb = typeof phoneAFriendUsage.$inferSelect;
export type InsertPhoneAFriendUsageDb = typeof phoneAFriendUsage.$inferInsert;

// Voicemail delivery tracking - which voicemails have been shown to users
export const voicemailDeliveries = pgTable("voicemail_deliveries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  voicemailId: varchar("voicemail_id").notNull(),
  // Status
  deliveredAt: timestamp("delivered_at").defaultNow(),
  viewedAt: timestamp("viewed_at"),
  dismissedAt: timestamp("dismissed_at"),
  listenedFully: boolean("listened_fully").default(false),
});

export type VoicemailDeliveryDb = typeof voicemailDeliveries.$inferSelect;
export type InsertVoicemailDeliveryDb = typeof voicemailDeliveries.$inferInsert;

// Difficulty Presets - configurable difficulty factor combinations for different audiences
export const difficultyPresets = pgTable("difficulty_presets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(), // e.g., "Introductory", "Standard", "Advanced", or custom names
  description: text("description"), // Explanation of target audience
  isSystemPreset: boolean("is_system_preset").notNull().default(false), // Built-in presets (Intro/Standard/Advanced)
  // Difficulty factors - all configurable per preset
  simulationWeeks: integer("simulation_weeks").notNull().default(8), // 4, 6, or 8
  requiredResearchReports: integer("required_research_reports").notNull().default(6), // 3, 5, or 6
  decisionsPerWeek: integer("decisions_per_week").notNull().default(3), // 2, 3, or 4
  activeStakeholderCount: integer("active_stakeholder_count").notNull().default(17), // 8, 12, or 17+
  rubricCriteriaCount: integer("rubric_criteria_count").notNull().default(4), // 2, 3, or 4
  phoneAFriendUses: integer("phone_a_friend_uses").notNull().default(3), // 3, 4, or 5
  eventProbability: integer("event_probability").notNull().default(30), // 15, 25, or 30 (percentage)
  // Scoring thresholds
  optimalScoreThreshold: integer("optimal_score_threshold").notNull().default(80), // >80, >75, >65
  goodScoreThreshold: integer("good_score_threshold").notNull().default(60), // >60, >55, >50
  failureScoreThreshold: integer("failure_score_threshold").notNull().default(40), // <40, <40, <35
  // Crisis triggers
  unionTriggerThreshold: integer("union_trigger_threshold").notNull().default(75), // 75, 80, or 85 (percentage)
  moraleCrisisThreshold: integer("morale_crisis_threshold").notNull().default(30), // 30, 25, or 20 (percentage)
  managerVacancyCrisis: integer("manager_vacancy_crisis").notNull().default(15), // 15, 18, or 20
  // LLM grading adjustment
  gradingStrictness: varchar("grading_strictness").notNull().default("rigorous"), // encouraging, balanced, rigorous
  targetScoreMin: integer("target_score_min").notNull().default(50), // Target score distribution lower bound
  targetScoreMax: integer("target_score_max").notNull().default(70), // Target score distribution upper bound
  // Intel engagement bonus
  intelBonusPerArticle: integer("intel_bonus_per_article").notNull().default(15), // 10, 12, or 15 (percentage points)
  maxIntelBonus: integer("max_intel_bonus").notNull().default(50), // 30, 40, or 50 (percentage points)
  // Metadata
  createdBy: varchar("created_by"), // null for system presets
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type DifficultyPreset = typeof difficultyPresets.$inferSelect;
export type InsertDifficultyPreset = typeof difficultyPresets.$inferInsert;

// Pre-recorded advisors with audio guidance for Phone-a-Friend feature
export const advisors = pgTable("advisors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  category: varchar("category").notNull(), // consultant, industry_expert, thought_leader
  title: varchar("title").notNull(),
  organization: varchar("organization").notNull(),
  specialty: varchar("specialty").notNull(),
  bio: text("bio").notNull(),
  transcript: text("transcript").notNull(), // Pre-recorded guidance transcript
  audioUrl: text("audio_url"), // ElevenLabs-generated audio file
  voiceId: varchar("voice_id"), // ElevenLabs voice ID used
  voiceName: varchar("voice_name"), // ElevenLabs voice name
  keyInsights: jsonb("key_insights").default([]), // Array of key insight strings
  headshotUrl: text("headshot_url"), // Optional headshot image
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type AdvisorDb = typeof advisors.$inferSelect;
export type InsertAdvisorDb = typeof advisors.$inferInsert;

// Advisor calls tracking - which advisors have been called by teams
export const advisorCalls = pgTable("advisor_calls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull(),
  advisorId: varchar("advisor_id").notNull(),
  weekNumber: integer("week_number").notNull(),
  calledAt: timestamp("called_at").defaultNow(),
});

export type AdvisorCallDb = typeof advisorCalls.$inferSelect;
export type InsertAdvisorCallDb = typeof advisorCalls.$inferInsert;
