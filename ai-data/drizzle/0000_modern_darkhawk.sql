CREATE TYPE "public"."market_data_source" AS ENUM('kamis', 'cooperative', 'verified_sales', 'historical', 'international');--> statement-breakpoint
CREATE TYPE "public"."market_price_type" AS ENUM('farm_gate', 'wholesale', 'retail', 'export');--> statement-breakpoint
CREATE TYPE "public"."notification_channel" AS ENUM('sms', 'whatsapp');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('pending', 'sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."transaction_channel" AS ENUM('local_broker', 'export');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('reported', 'pending_verification', 'verified', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."visual_assessment_status" AS ENUM('passes_visual_check', 'needs_review', 'insufficient_image');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "export_assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"crop" text NOT NULL,
	"standards_profile_id" text NOT NULL,
	"standards_profile_version" text NOT NULL,
	"model" text NOT NULL,
	"visual_status" "visual_assessment_status" NOT NULL,
	"requires_human_review" boolean DEFAULT true NOT NULL,
	"confidence" numeric(4, 3) NOT NULL,
	"quality_issues" text[] NOT NULL,
	"observations" text[] NOT NULL,
	"limitations" text[] NOT NULL,
	"image_mime_type" text NOT NULL,
	"image_sha256" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "market_data_points" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" "market_data_source" NOT NULL,
	"source_record_id" text NOT NULL,
	"crop" text NOT NULL,
	"variety" text,
	"grade" text,
	"county" text,
	"country" text DEFAULT 'Kenya' NOT NULL,
	"market" text,
	"price_type" "market_price_type" NOT NULL,
	"price_per_kg" numeric(14, 2) NOT NULL,
	"currency" text DEFAULT 'KES' NOT NULL,
	"unit" text DEFAULT 'kg' NOT NULL,
	"source_url" text,
	"source_published_at" timestamp with time zone NOT NULL,
	"ingested_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channel" "notification_channel" NOT NULL,
	"recipient" text NOT NULL,
	"message" text NOT NULL,
	"status" "notification_status" DEFAULT 'pending' NOT NULL,
	"provider_message_id" text,
	"provider_response" text,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"crop" text NOT NULL,
	"variety" text,
	"county" text NOT NULL,
	"grade" text,
	"quantity_kg" numeric(14, 3) NOT NULL,
	"price_per_kg" numeric(14, 2) NOT NULL,
	"currency" text DEFAULT 'KES' NOT NULL,
	"channel" "transaction_channel" NOT NULL,
	"status" "transaction_status" DEFAULT 'reported' NOT NULL,
	"buyer_reference" text,
	"evidence_url" text,
	"reported_by" text,
	"verified_at" timestamp with time zone,
	"verified_by" text,
	"rejection_reason" text,
	"occurred_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "export_assessments_image_hash_idx" ON "export_assessments" USING btree ("image_sha256");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "market_data_source_record_unique" ON "market_data_points" USING btree ("source","source_record_id","price_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "market_data_evidence_lookup_idx" ON "market_data_points" USING btree ("crop","county","source_published_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notification_status_created_idx" ON "notification_deliveries" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "transactions_crop_county_status_idx" ON "transactions" USING btree ("crop","county","status");