/**
 * Player Repository — Drizzle ORM queries
 */

import { getDb, schema } from "./client";
import { eq, desc } from "drizzle-orm";
import { UUID } from "crypto";

export interface PlayerCreateInput {
  firebaseUid: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
}

export interface PlayerUpdateInput {
  level?: number;
  exp?: bigint;
  nanites?: bigint;
  skillPoints?: number;
  healthCurrent?: number;
  healthMax?: number;
  psiCurrent?: number;
  psiMax?: number;
  currentStage?: string;
  currentDifficulty?: number;
  equipmentJson?: Record<string, any>;
  skillTreeJson?: Record<string, any>;
  companionsJson?: Record<string, any>;
  aspectsJson?: Record<string, any>;
  lastPlayedAt?: Date;
}

export async function createPlayer(input: PlayerCreateInput) {
  const db = getDb();
  const [player] = await db
    .insert(schema.players)
    .values(input)
    .returning();
  return player;
}

export async function getPlayerById(id: string) {
  const db = getDb();
  const [player] = await db
    .select()
    .from(schema.players)
    .where(eq(schema.players.id, id as any));
  return player;
}

export async function getPlayerByFirebaseUid(firebaseUid: string) {
  const db = getDb();
  const [player] = await db
    .select()
    .from(schema.players)
    .where(eq(schema.players.firebaseUid, firebaseUid));
  return player;
}

export async function updatePlayer(id: string, input: PlayerUpdateInput) {
  const db = getDb();
  const [updated] = await db
    .update(schema.players)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(schema.players.id, id as any))
    .returning();
  return updated;
}

export async function getLeaderboard(limit: number = 100) {
  const db = getDb();
  const leaders = await db
    .select({
      displayName: schema.players.displayName,
      level: schema.players.level,
      nanites: schema.players.nanites,
      exp: schema.players.exp,
    })
    .from(schema.players)
    .orderBy(desc(schema.players.level), desc(schema.players.nanites))
    .limit(limit);
  return leaders;
}
