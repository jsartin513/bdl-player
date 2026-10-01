import { index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

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
  selfReportedSkill: text('self_reported_skill'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const leagueRegistrations = pgTable(
  'league_registrations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    accountId: uuid('account_id')
      .notNull()
      .references(() => playerAccounts.id, { onDelete: 'cascade' }),
    adminEventId: text('admin_event_id').notNull(),
    status: text('status').notNull().default('pending_payment'),
    waiverAcceptedAt: timestamp('waiver_accepted_at', { withTimezone: true }),
    stripeCheckoutSessionId: text('stripe_checkout_session_id'),
    stripePaymentIntentId: text('stripe_payment_intent_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('league_registrations_account_event_uidx').on(
      table.accountId,
      table.adminEventId
    ),
    index('league_registrations_admin_event_id_idx').on(table.adminEventId),
    index('league_registrations_stripe_checkout_session_id_idx').on(
      table.stripeCheckoutSessionId
    ),
  ]
)
