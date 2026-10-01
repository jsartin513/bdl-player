import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const playerAccounts = pgTable('player_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const playerProfiles = pgTable('player_profiles', {
  accountId: uuid('account_id')
    .primaryKey()
    .references(() => playerAccounts.id, { onDelete: 'cascade' }),
  firstName: text('first_name'),
  lastName: text('last_name'),
  /** beginner | intermediate | advanced | highly_advanced */
  selfReportedSkill: text('self_reported_skill'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
