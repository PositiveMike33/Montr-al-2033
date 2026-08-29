import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Define the 'users' table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow(),
  lastLoginAt: timestamp('last_login_at').defaultNow(),
});

// Define the 'game_saves' table
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
  skillTreeJson: text('skill_tree_json'),
  companionsJson: text('companions_json'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define the 'tactical_logs' table
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

// Define relationships
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
