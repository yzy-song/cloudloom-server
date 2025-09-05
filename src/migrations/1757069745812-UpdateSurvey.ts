import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSurvey1757069745812 implements MigrationInterface {
    name = 'UpdateSurvey1757069745812'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_favorites" DROP CONSTRAINT "user_favorites_user_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "user_favorites" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "user_favorites" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "responses" DROP CONSTRAINT "FK_b99501033ebe885b4496945ee16"`);
        await queryRunner.query(`ALTER TABLE "responses" DROP COLUMN "survey_id"`);
        await queryRunner.query(`ALTER TABLE "responses" ADD "survey_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "surveys" DROP CONSTRAINT "PK_1b5e3d4aaeb2321ffa98498c971"`);
        await queryRunner.query(`ALTER TABLE "surveys" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "surveys" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "surveys" ADD CONSTRAINT "PK_1b5e3d4aaeb2321ffa98498c971" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "user_favorites" ADD CONSTRAINT "FK_5238ce0a21cc77dc16c8efe3d36" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_favorites" ADD CONSTRAINT "FK_450f345c2e8eb1b4b38a6bc6be4" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "responses" ADD CONSTRAINT "FK_b99501033ebe885b4496945ee16" FOREIGN KEY ("survey_id") REFERENCES "surveys"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "responses" DROP CONSTRAINT "FK_b99501033ebe885b4496945ee16"`);
        await queryRunner.query(`ALTER TABLE "user_favorites" DROP CONSTRAINT "FK_450f345c2e8eb1b4b38a6bc6be4"`);
        await queryRunner.query(`ALTER TABLE "user_favorites" DROP CONSTRAINT "FK_5238ce0a21cc77dc16c8efe3d36"`);
        await queryRunner.query(`ALTER TABLE "surveys" DROP CONSTRAINT "PK_1b5e3d4aaeb2321ffa98498c971"`);
        await queryRunner.query(`ALTER TABLE "surveys" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "surveys" ADD "id" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "surveys" ADD CONSTRAINT "PK_1b5e3d4aaeb2321ffa98498c971" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "responses" DROP COLUMN "survey_id"`);
        await queryRunner.query(`ALTER TABLE "responses" ADD "survey_id" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "responses" ADD CONSTRAINT "FK_b99501033ebe885b4496945ee16" FOREIGN KEY ("survey_id") REFERENCES "surveys"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_favorites" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "user_favorites" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
