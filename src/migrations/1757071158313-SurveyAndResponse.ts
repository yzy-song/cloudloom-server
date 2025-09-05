import { MigrationInterface, QueryRunner } from "typeorm";

export class SurveyAndResponse1757071158313 implements MigrationInterface {
    name = 'SurveyAndResponse1757071158313'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "responses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "survey_id" integer NOT NULL, "user_id" character varying(255), "email" character varying(255), "name" character varying(255), "phone" character varying(255), "city" character varying(255), "submitted_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "answers" jsonb NOT NULL, CONSTRAINT "PK_be3bdac59bd243dff421ad7bf70" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "surveys" ("id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "description" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1b5e3d4aaeb2321ffa98498c971" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "responses" ADD CONSTRAINT "FK_b99501033ebe885b4496945ee16" FOREIGN KEY ("survey_id") REFERENCES "surveys"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "responses" DROP CONSTRAINT "FK_b99501033ebe885b4496945ee16"`);
        await queryRunner.query(`DROP TABLE "surveys"`);
        await queryRunner.query(`DROP TABLE "responses"`);
    }

}
