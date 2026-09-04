import { db } from './index.ts';
import { users, gameSaves, tacticalLogs } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, displayName?: string, photoUrl?: string) {
  try {
    const result = await db.insert(users)
      .values({
        uid,
        email,
        displayName: displayName || '',
        photoUrl: photoUrl || '',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName: displayName || '',
          photoUrl: photoUrl || '',
          lastLoginAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("Database user upsert failed:", error);
    throw new Error("Database query failed. Please try again later.", { cause: error });
  }
}

export async function getUserByUid(uid: string) {
  try {
    const result = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("Database getUserByUid failed:", error);
    throw new Error("Database query failed. Please try again later.", { cause: error });
  }
}

export async function saveGameProgress(userId: number, data: {
  currentStage?: number;
  level?: number;
  nanites?: number;
  exp?: number;
  skillPoints?: number;
  inventoryJson?: string;
  equippedJson?: string;
  skillTreeJson?: string;
  companionsJson?: string;
  loadoutsJson?: string;
  attributesJson?: string;
  achievementsJson?: string;
  statsJson?: string;
}) {
  try {
    const existing = await db.select().from(gameSaves).where(eq(gameSaves.userId, userId)).limit(1);
    if (existing.length > 0) {
      const updated = await db.update(gameSaves)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(gameSaves.id, existing[0].id))
        .returning();
      return updated[0];
    } else {
      const created = await db.insert(gameSaves)
        .values({
          userId,
          ...data,
        })
        .returning();
      return created[0];
    }
  } catch (error) {
    console.error("Database saveGameProgress failed:", error);
    throw new Error("Database query failed. Please try again later.", { cause: error });
  }
}

export async function getGameProgress(userId: number) {
  try {
    const existing = await db.select().from(gameSaves).where(eq(gameSaves.userId, userId)).limit(1);
    return existing[0] || null;
  } catch (error) {
    console.error("Database getGameProgress failed:", error);
    throw new Error("Database query failed. Please try again later.", { cause: error });
  }
}

export async function addTacticalLog(userId: number, sender: string, message: string, source?: string) {
  try {
    const created = await db.insert(tacticalLogs)
      .values({
        userId,
        sender,
        message,
        source: source || 'ollama',
      })
      .returning();
    return created[0];
  } catch (error) {
    console.error("Database addTacticalLog failed:", error);
    throw new Error("Database query failed. Please try again later.", { cause: error });
  }
}

export async function getTacticalLogs(userId: number, limitCount: number = 20) {
  try {
    return await db.select()
      .from(tacticalLogs)
      .where(eq(tacticalLogs.userId, userId))
      .orderBy(desc(tacticalLogs.createdAt))
      .limit(limitCount);
  } catch (error) {
    console.error("Database getTacticalLogs failed:", error);
    throw new Error("Database query failed. Please try again later.", { cause: error });
  }
}
