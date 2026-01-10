import { teams, type DbTeam, type InsertDbTeam } from "@shared/models/auth";
import { db } from "./db";
import { eq } from "drizzle-orm";
import type { Team, InsertTeam, CompanyState, Decision, DecisionRecord, WeeklyHistoryEntry } from "@shared/schema";
import { defaultCompanyState } from "@shared/schema";
import { randomUUID } from "crypto";

function dbTeamToTeam(dbTeam: DbTeam): Team {
  return {
    id: dbTeam.id,
    name: dbTeam.name,
    currentWeek: dbTeam.currentWeek,
    totalWeeks: dbTeam.totalWeeks,
    setupComplete: dbTeam.setupComplete,
    researchComplete: dbTeam.researchComplete,
    members: dbTeam.members as string[],
    companyState: dbTeam.companyState as CompanyState,
    decisions: dbTeam.decisions as Decision[],
    decisionRecords: dbTeam.decisionRecords as DecisionRecord[],
    weeklyHistory: dbTeam.weeklyHistory as WeeklyHistoryEntry[],
    viewedReportIds: dbTeam.viewedReportIds as string[],
    createdAt: dbTeam.createdAt?.toISOString(),
  };
}

export interface ITeamStorage {
  getTeam(id: string): Promise<Team | undefined>;
  getAllTeams(): Promise<Team[]>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: string, updates: Partial<Team>): Promise<Team | undefined>;
  deleteTeam(id: string): Promise<boolean>;
  hasActiveTeam(): Promise<boolean>;
}

class TeamStorage implements ITeamStorage {
  async getTeam(id: string): Promise<Team | undefined> {
    const [dbTeam] = await db.select().from(teams).where(eq(teams.id, id));
    if (!dbTeam) return undefined;
    return dbTeamToTeam(dbTeam);
  }

  async getAllTeams(): Promise<Team[]> {
    const dbTeams = await db.select().from(teams);
    return dbTeams.map(dbTeamToTeam);
  }

  async createTeam(input: InsertTeam): Promise<Team> {
    const id = randomUUID();
    const now = new Date();
    
    const initialHistory: WeeklyHistoryEntry = {
      week: 1,
      revenue: defaultCompanyState.revenue,
      employees: defaultCompanyState.employees,
      morale: defaultCompanyState.morale,
      financialScore: Math.round((defaultCompanyState.revenue / 1000000) * (defaultCompanyState.employees / 100)),
      culturalScore: defaultCompanyState.morale,
      debt: defaultCompanyState.debt,
      automationLevel: defaultCompanyState.automationLevel,
      unionSentiment: defaultCompanyState.unionSentiment,
      managementBench: defaultCompanyState.managementBenchStrength,
      decisionsThisWeek: [],
    };

    const [dbTeam] = await db
      .insert(teams)
      .values({
        id,
        name: input.name,
        totalWeeks: input.totalWeeks || 8,
        currentWeek: 1,
        setupComplete: false,
        researchComplete: false,
        members: input.members,
        companyState: defaultCompanyState,
        decisions: [],
        decisionRecords: [],
        weeklyHistory: [initialHistory],
        viewedReportIds: [],
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return dbTeamToTeam(dbTeam);
  }

  async updateTeam(id: string, updates: Partial<Team>): Promise<Team | undefined> {
    const updateData: Partial<InsertDbTeam> = {
      updatedAt: new Date(),
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.currentWeek !== undefined) updateData.currentWeek = updates.currentWeek;
    if (updates.totalWeeks !== undefined) updateData.totalWeeks = updates.totalWeeks;
    if (updates.setupComplete !== undefined) updateData.setupComplete = updates.setupComplete;
    if (updates.researchComplete !== undefined) updateData.researchComplete = updates.researchComplete;
    if (updates.members !== undefined) updateData.members = updates.members;
    if (updates.companyState !== undefined) updateData.companyState = updates.companyState;
    if (updates.decisions !== undefined) updateData.decisions = updates.decisions;
    if (updates.decisionRecords !== undefined) updateData.decisionRecords = updates.decisionRecords;
    if (updates.weeklyHistory !== undefined) updateData.weeklyHistory = updates.weeklyHistory;
    if (updates.viewedReportIds !== undefined) updateData.viewedReportIds = updates.viewedReportIds;

    const [dbTeam] = await db
      .update(teams)
      .set(updateData)
      .where(eq(teams.id, id))
      .returning();

    if (!dbTeam) return undefined;
    return dbTeamToTeam(dbTeam);
  }

  async deleteTeam(id: string): Promise<boolean> {
    const result = await db.delete(teams).where(eq(teams.id, id)).returning();
    return result.length > 0;
  }

  async hasActiveTeam(): Promise<boolean> {
    const allTeams = await db.select().from(teams);
    return allTeams.length > 0;
  }
}

export const teamStorage = new TeamStorage();
