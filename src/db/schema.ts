/**
 * Database Schema — Drizzle ORM + PostgreSQL
 * Persistence layer for players, inventory, achievements
 */

import { pgTable, uuid, serial, text, integer, bigint, timestamp, json, varchar, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================================
// CORE USERS & GAME SAVES TABLES (PostgreSQL)
// ============================================================================
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID or Guest UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow(),
  lastLoginAt: timestamp('last_login_at').defaultNow(),
});

export const gameSaves = pgTable('game_saves', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  currentStage: integer('current_stage').default(1),
  level: integer('level').default(1),
  nanites: integer('nanites').default(150),
  exp: integer('exp').default(0),
  skillPoints: integer('skill_points').default(0),
  inventoryJson: text('inventory_json'),
  equippedJson: text('equipped_json'),
  skillTreeJson: text('skill_tree_json'),
  companionsJson: text('companions_json'),
  loadoutsJson: text('loadouts_json'),
  attributesJson: text('attributes_json'),
  achievementsJson: text('achievements_json'),
  statsJson: text('stats_json'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const tacticalLogs = pgTable('tactical_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  sender: text('sender').notNull(),
  message: text('message').notNull(),
  source: text('source'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  gameSaves: many(gameSaves),
  tacticalLogs: many(tacticalLogs),
}));

export const gameSavesRelations = relations(gameSaves, ({ one }) => ({
  user: one(users, {
    fields: [gameSaves.userId],
    references: [users.id],
  }),
}));

export const tacticalLogsRelations = relations(tacticalLogs, ({ one }) => ({
  user: one(users, {
    fields: [tacticalLogs.userId],
    references: [users.id],
  }),
}));

// Players table
export const players = pgTable(
  "players",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    firebaseUid: varchar("firebase_uid", { length: 255 }).unique().notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    displayName: varchar("display_name", { length: 255 }).notNull(),
    avatarUrl: text("avatar_url"),

    // Game progression
    level: integer("level").default(1).notNull(),
    exp: bigint("exp", { mode: "bigint" }).default(0n).notNull(),
    nanites: bigint("nanites", { mode: "bigint" }).default(0n).notNull(), // Currency
    skillPoints: integer("skill_points").default(0).notNull(),
    healthCurrent: integer("health_current").default(100).notNull(),
    healthMax: integer("health_max").default(100).notNull(),
    psiCurrent: integer("psi_current").default(50).notNull(),
    psiMax: integer("psi_max").default(100).notNull(),

    // Current stage/location
    currentStage: varchar("current_stage", { length: 100 }).default("tutorial"),
    currentDifficulty: integer("current_difficulty").default(1),

    // JSON fields for complex data
    equipmentJson: json("equipment_json").$type<Record<string, any>>(),
    skillTreeJson: json("skill_tree_json").$type<Record<string, any>>(),
    companionsJson: json("companions_json").$type<Record<string, any>>(),
    aspectsJson: json("aspects_json").$type<Record<string, any>>(), // Extracted Aspects

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow(),
    lastPlayedAt: timestamp("last_played_at"),
  },
  (table) => ({
    firebaseUidIdx: index("players_firebase_uid_idx").on(table.firebaseUid),
    levelIdx: index("players_level_idx").on(table.level),
  })
);

// Inventory items table
export const inventoryItems = pgTable(
  "inventory_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),

    // Item data
    itemId: varchar("item_id", { length: 50 }).notNull(), // Unique item ID
    name: varchar("name", { length: 255 }).notNull(),
    type: varchar("type", { length: 50 }).notNull(), // weapon, armor, ring, etc.
    rarity: varchar("rarity", { length: 20 }).notNull(), // common, rare, epic, legendary
    itemPower: integer("item_power").notNull(),

    // Stats as JSON
    statsJson: json("stats_json").$type<Record<string, number>>(),
    affixesJson: json("affixes_json").$type<any[]>(),
    aspectJson: json("aspect_json").$type<any>(), // If it has an aspect

    // Inventory slot (-1 = stash, 0+ = equipment slot)
    slotIndex: integer("slot_index").default(-1),

    quantity: integer("quantity").default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    playerIdIdx: index("inventory_items_player_id_idx").on(table.playerId),
    itemIdIdx: index("inventory_items_item_id_idx").on(table.itemId),
  })
);

// Achievements table
export const achievements = pgTable(
  "achievements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),

    achievementKey: varchar("achievement_key", { length: 100 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
    rarity: varchar("rarity", { length: 20 }).default("common"), // common, rare, legendary
  },
  (table) => ({
    playerIdIdx: index("achievements_player_id_idx").on(table.playerId),
    achievementKeyIdx: index("achievements_achievement_key_idx").on(table.achievementKey),
  })
);

// Combat logs table (for analytics)
export const combatLogs = pgTable(
  "combat_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),

    stageName: varchar("stage_name", { length: 100 }).notNull(),
    enemyName: varchar("enemy_name", { length: 255 }).notNull(),
    durationSeconds: integer("duration_seconds"),
    playerHealthLost: integer("player_health_lost"),
    damageDealt: bigint("damage_dealt", { mode: "bigint" }),
    lootDropped: json("loot_dropped").$type<any[]>(),
    isVictory: boolean("is_victory").default(false),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    playerIdIdx: index("combat_logs_player_id_idx").on(table.playerId),
  })
);

// World events / Events table
export const worldEvents = pgTable(
  "world_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),

    eventType: varchar("event_type", { length: 50 }).notNull(), // "elite_spawn", "trader", "ambush", etc.
    eventData: json("event_data").$type<Record<string, any>>(),
    completed: boolean("completed").default(false),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => ({
    playerIdIdx: index("world_events_player_id_idx").on(table.playerId),
  })
);

// Leaderboard view (computed from players table)
export const leaderboard = pgTable("leaderboard", {
  id: serial("id").primaryKey(),
  playerId: uuid("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  level: integer("level").notNull(),
  nanites: bigint("nanites", { mode: "bigint" }).notNull(),
  lastUpdatedAt: timestamp("last_updated_at").defaultNow(),
});

// Relations
export const playersRelations = relations(players, ({ many }) => ({
  inventory: many(inventoryItems),
  achievements: many(achievements),
  combatLogs: many(combatLogs),
  worldEvents: many(worldEvents),
}));

export const inventoryItemsRelations = relations(inventoryItems, ({ one }) => ({
  player: one(players, {
    fields: [inventoryItems.playerId],
    references: [players.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ one }) => ({
  player: one(players, {
    fields: [achievements.playerId],
    references: [players.id],
  }),
}));

export const combatLogsRelations = relations(combatLogs, ({ one }) => ({
  player: one(players, {
    fields: [combatLogs.playerId],
    references: [players.id],
  }),
}));

export const worldEventsRelations = relations(worldEvents, ({ one }) => ({
  player: one(players, {
    fields: [worldEvents.playerId],
    references: [players.id],
  }),
}));
