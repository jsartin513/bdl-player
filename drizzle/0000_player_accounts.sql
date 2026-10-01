CREATE TABLE IF NOT EXISTS "player_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "player_accounts_email_unique" UNIQUE("email")
);

CREATE TABLE IF NOT EXISTS "player_profiles" (
	"account_id" uuid PRIMARY KEY NOT NULL,
	"first_name" text,
	"last_name" text,
	"self_reported_skill" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "player_profiles" ADD CONSTRAINT "player_profiles_account_id_player_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."player_accounts"("id") ON DELETE cascade ON UPDATE no action;
