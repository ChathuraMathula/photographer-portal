import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovedTestFieldToReservation1784906089328 implements MigrationInterface {
    name = 'RemovedTestFieldToReservation1784906089328'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservations" DROP COLUMN "testField"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservations" ADD "testField" character varying`);
    }

}
