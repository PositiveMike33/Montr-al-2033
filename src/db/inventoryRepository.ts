/**
 * Inventory Repository — Manage player items
 */

import { getDb, schema } from "./client";
import { eq } from "drizzle-orm";

export interface InventoryItemInput {
  playerId: string;
  itemId: string;
  name: string;
  type: string;
  rarity: string;
  itemPower: number;
  statsJson?: Record<string, number>;
  affixesJson?: any[];
  aspectJson?: any;
  slotIndex?: number;
  quantity?: number;
}

export async function addInventoryItem(input: InventoryItemInput) {
  const db = getDb();
  const [item] = await db
    .insert(schema.inventoryItems)
    .values({
      playerId: input.playerId as any,
      itemId: input.itemId,
      name: input.name,
      type: input.type,
      rarity: input.rarity,
      itemPower: input.itemPower,
      statsJson: input.statsJson,
      affixesJson: input.affixesJson,
      aspectJson: input.aspectJson,
      slotIndex: input.slotIndex ?? -1,
      quantity: input.quantity ?? 1,
    })
    .returning();
  return item;
}

export async function getPlayerInventory(playerId: string) {
  const db = getDb();
  const items = await db
    .select()
    .from(schema.inventoryItems)
    .where(eq(schema.inventoryItems.playerId, playerId as any));
  return items;
}

export async function updateInventoryItem(itemId: string, updates: Partial<InventoryItemInput>) {
  const db = getDb();
  const [updated] = await db
    .update(schema.inventoryItems)
    .set(updates)
    .where(eq(schema.inventoryItems.id, itemId as any))
    .returning();
  return updated;
}

export async function deleteInventoryItem(itemId: string) {
  const db = getDb();
  await db
    .delete(schema.inventoryItems)
    .where(eq(schema.inventoryItems.id, itemId as any));
}
