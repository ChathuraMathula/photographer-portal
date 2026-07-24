import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTestFieldToReservation1784904296794 implements MigrationInterface {
    name = 'AddTestFieldToReservation1784904296794'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservations" ADD "testField" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservations" DROP COLUMN "testField"`);
    }

}
