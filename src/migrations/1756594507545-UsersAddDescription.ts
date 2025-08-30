import { MigrationInterface, QueryRunner } from "typeorm";

export class UsersAddDescription1756594507545 implements MigrationInterface {
    name = 'UsersAddDescription1756594507545'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "description" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "description"`);
    }

}
