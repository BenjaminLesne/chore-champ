-- Add invite_code column as nullable first
ALTER TABLE "chore-champ_household" ADD COLUMN "invite_code" varchar(8);--> statement-breakpoint

-- Backfill existing rows with random 8-char codes
UPDATE "chore-champ_household"
SET "invite_code" = upper(substr(md5(random()::text), 1, 8))
WHERE "invite_code" IS NULL;--> statement-breakpoint

-- Make column NOT NULL and add unique constraint
ALTER TABLE "chore-champ_household" ALTER COLUMN "invite_code" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "chore-champ_household" ADD CONSTRAINT "chore-champ_household_invite_code_unique" UNIQUE("invite_code");
