CREATE TABLE IF NOT EXISTS "league_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"admin_event_id" text NOT NULL,
	"status" text DEFAULT 'pending_payment' NOT NULL,
	"waiver_accepted_at" timestamp with time zone,
	"stripe_checkout_session_id" text,
	"stripe_payment_intent_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "league_registrations" ADD CONSTRAINT "league_registrations_account_id_player_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."player_accounts"("id") ON DELETE cascade ON UPDATE no action;

CREATE UNIQUE INDEX IF NOT EXISTS "league_registrations_account_event_uidx" ON "league_registrations" USING btree ("account_id","admin_event_id");
CREATE INDEX IF NOT EXISTS "league_registrations_admin_event_id_idx" ON "league_registrations" USING btree ("admin_event_id");
CREATE INDEX IF NOT EXISTS "league_registrations_stripe_checkout_session_id_idx" ON "league_registrations" USING btree ("stripe_checkout_session_id");
