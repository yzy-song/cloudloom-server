import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateResponseTable1756899204052 implements MigrationInterface {
    name = 'UpdateResponseTable1756899204052'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "responses" ADD "phone" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "responses" ADD "city" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "responses" DROP COLUMN "city"`);
        await queryRunner.query(`ALTER TABLE "responses" DROP COLUMN "phone"`);
    }

}
