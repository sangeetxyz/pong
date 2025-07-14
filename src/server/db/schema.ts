import { relations, sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  integer,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `pong_${name}`);

export const referrals = createTable(
  "referral",
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    referrerAddress: varchar("referrer_address", { length: 42 })
      .notNull()
      .references(() => leaderboard.walletAddress),
    refereeAddress: varchar("referee_address", { length: 42 })
      .notNull()
      .unique(),
    isFirstGamePlayed: boolean("is_first_game_played").notNull().default(false),
    referrerRewardGiven: boolean("referrer_reward_given")
      .notNull()
      .default(false),
    refereeRewardGiven: boolean("referee_reward_given")
      .notNull()
      .default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    referrerIdx: index("referral_referrer_idx").on(table.referrerAddress),
    refereeIdx: index("referral_referee_idx").on(table.refereeAddress),
  }),
);

export const leaderboard = createTable("leaderboard", {
  walletAddress: varchar("wallet_address", { length: 42 })
    .notNull()
    .primaryKey(),
  highScore: bigint("high_score", { mode: "number" }).notNull(),
  longestSurvival: bigint("longest_survival", { mode: "number" }).notNull(),
  pongTokenCount: bigint("pong_token_count", { mode: "number" }).notNull(),
  totalReferrals: bigint("total_referrals", { mode: "number" })
    .notNull()
    .default(0),
  hasPlayedFirstGame: boolean("has_played_first_game").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(leaderboard, {
    fields: [referrals.referrerAddress],
    references: [leaderboard.walletAddress],
  }),
}));

export const leaderboardRelations = relations(leaderboard, ({ many }) => ({
  referrals: many(referrals),
}));
