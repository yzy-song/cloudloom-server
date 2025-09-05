import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateResponsTable1757073921739 implements MigrationInterface {
    name = 'UpdateResponsTable1757073921739'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "responses" ADD "age" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "responses" ADD "gender" character varying(50)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "responses" DROP COLUMN "gender"`);
        await queryRunner.query(`ALTER TABLE "responses" DROP COLUMN "age"`);
    }

}
