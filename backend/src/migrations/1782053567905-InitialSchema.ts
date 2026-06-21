import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1782053567905 implements MigrationInterface {
    name = 'InitialSchema1782053567905'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "photographer_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "bookingSlug" character varying NOT NULL, "bio" text, "specializations" text NOT NULL DEFAULT '', "portfolioUrl" character varying, "profileImageUrl" character varying, "baseLocation" character varying, "isAvailableForBooking" boolean NOT NULL DEFAULT true, "userId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_64573c26c884d028c8d8b258a6d" UNIQUE ("bookingSlug"), CONSTRAINT "REL_435a65b63fb1a5bf1c4fc3c7d8" UNIQUE ("userId"), CONSTRAINT "PK_092565244905d812964ad92328f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "packages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "photographerId" uuid NOT NULL, "name" character varying NOT NULL, "description" text, "priceInCents" integer NOT NULL, "durationHours" integer NOT NULL, "includes" text NOT NULL DEFAULT '', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_020801f620e21f943ead9311c98" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "customers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying NOT NULL, "address" text, "notes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_8536b8b85c06969f84f0c098b03" UNIQUE ("email"), CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reservationId" uuid NOT NULL, "sender" character varying NOT NULL, "senderName" character varying NOT NULL, "content" text NOT NULL, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."reservations_status_enum" AS ENUM('PENDING', 'PROPOSED', 'REJECTED', 'CONFIRMED', 'CANCELLED', 'COMPLETED')`);
        await queryRunner.query(`CREATE TABLE "reservations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "customerId" uuid NOT NULL, "photographerId" uuid NOT NULL, "date" date NOT NULL, "startTime" character varying NOT NULL, "endTime" character varying NOT NULL, "eventType" character varying NOT NULL, "location" character varying, "customerNotes" text, "adminNotes" text, "totalAmountInCents" integer, "status" "public"."reservations_status_enum" NOT NULL DEFAULT 'PENDING', "reservationToken" character varying NOT NULL, "paymentDeadline" TIMESTAMP, "advancePaymentPriceInCents" integer, "quotationNotes" text, "clientSelectedPackageId" character varying, "selectedPackages" jsonb, "rejectionReason" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_17eed85d058d770b80629290adc" UNIQUE ("reservationToken"), CONSTRAINT "PK_da95cef71b617ac35dc5bcda243" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('SUPER_ADMIN', 'ADMIN', 'PHOTOGRAPHER')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "phone" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "photographer_profiles" ADD CONSTRAINT "FK_435a65b63fb1a5bf1c4fc3c7d84" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "packages" ADD CONSTRAINT "FK_31adbecaebc397ff29974046697" FOREIGN KEY ("photographerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_67e15c5af6d3ada76fbf98b0728" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservations" ADD CONSTRAINT "FK_487ec4ed757eed0d34c7ddee79b" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservations" ADD CONSTRAINT "FK_32e4d9a247db21bd30fee2bff11" FOREIGN KEY ("photographerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservations" DROP CONSTRAINT "FK_32e4d9a247db21bd30fee2bff11"`);
        await queryRunner.query(`ALTER TABLE "reservations" DROP CONSTRAINT "FK_487ec4ed757eed0d34c7ddee79b"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_67e15c5af6d3ada76fbf98b0728"`);
        await queryRunner.query(`ALTER TABLE "packages" DROP CONSTRAINT "FK_31adbecaebc397ff29974046697"`);
        await queryRunner.query(`ALTER TABLE "photographer_profiles" DROP CONSTRAINT "FK_435a65b63fb1a5bf1c4fc3c7d84"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "reservations"`);
        await queryRunner.query(`DROP TYPE "public"."reservations_status_enum"`);
        await queryRunner.query(`DROP TABLE "messages"`);
        await queryRunner.query(`DROP TABLE "customers"`);
        await queryRunner.query(`DROP TABLE "packages"`);
        await queryRunner.query(`DROP TABLE "photographer_profiles"`);
    }

}
