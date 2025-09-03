import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSurveyResponseTable1756895959204 implements MigrationInterface {
  name = 'AddSurveyResponseTable1756895959204';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "FK_products_subcategory"`);
    await queryRunner.query(`ALTER TABLE "subcategories" DROP CONSTRAINT "FK_subcategories_category"`);
    await queryRunner.query(`COMMENT ON TABLE "subcategories" IS NULL`);
    await queryRunner.query(
      `CREATE TABLE "responses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "survey_id" character varying(255) NOT NULL, "user_id" character varying(255), "email" character varying(255), "name" character varying(255), "submitted_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "answers" jsonb NOT NULL, CONSTRAINT "PK_be3bdac59bd243dff421ad7bf70" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "surveys" ("id" character varying(255) NOT NULL, "title" character varying(255) NOT NULL, "description" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1b5e3d4aaeb2321ffa98498c971" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`COMMENT ON COLUMN "products"."subcategory_id" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "subcategories"."name" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "subcategories"."description" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "subcategories"."image_url" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "subcategories"."created_at" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "subcategories"."updated_at" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "subcategories"."is_active" IS NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "subcategories"."category_id" IS NULL`);
    await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_c9de3a8edea9269ca774c919b9a" FOREIGN KEY ("subcategory_id") REFERENCES "subcategories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "subcategories" ADD CONSTRAINT "FK_f7b015bc580ae5179ba5a4f42ec" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "responses" ADD CONSTRAINT "FK_b99501033ebe885b4496945ee16" FOREIGN KEY ("survey_id") REFERENCES "surveys"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "responses" DROP CONSTRAINT "FK_b99501033ebe885b4496945ee16"`);
    await queryRunner.query(`ALTER TABLE "subcategories" DROP CONSTRAINT "FK_f7b015bc580ae5179ba5a4f42ec"`);
    await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_c9de3a8edea9269ca774c919b9a"`);
    await queryRunner.query(`COMMENT ON COLUMN "subcategories"."category_id" IS '父分类 ID（关联 public.categories 表的 id 字段）'`);
    await queryRunner.query(`COMMENT ON COLUMN "subcategories"."is_active" IS '是否启用该子分类（TRUE=启用，FALSE=禁用，默认启用）'`);
    await queryRunner.query(`COMMENT ON COLUMN "subcategories"."updated_at" IS '记录最后更新时间（自动填充为当前时间）'`);
    await queryRunner.query(`COMMENT ON COLUMN "subcategories"."created_at" IS '记录创建时间（自动填充为当前时间）'`);
    await queryRunner.query(`COMMENT ON COLUMN "subcategories"."image_url" IS '子分类图片的 URL 地址（可选，用于前端展示）'`);
    await queryRunner.query(`COMMENT ON COLUMN "subcategories"."description" IS '子分类详细描述（可选，如"传统汉服的一种，多用于婚礼或正式场合"）'`);
    await queryRunner.query(`COMMENT ON COLUMN "subcategories"."name" IS '子分类名称（唯一，如"马面裙"）'`);
    await queryRunner.query(`COMMENT ON COLUMN "products"."subcategory_id" IS 'Foreign key linking to the specific subcategory (e.g., 对襟襦裙).'`);
    await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "subcategory_id" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "gender" SET DEFAULT 'unisex'`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "description"`);
    await queryRunner.query(`DROP TABLE "surveys"`);
    await queryRunner.query(`DROP TABLE "responses"`);
    await queryRunner.query(`COMMENT ON TABLE "subcategories" IS 'Stores specific product sub-categories, such as "马面裙" or "对襟襦裙".'`);
    await queryRunner.query(`ALTER TABLE "subcategories" ADD CONSTRAINT "FK_subcategories_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_products_subcategory" FOREIGN KEY ("subcategory_id") REFERENCES "subcategories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
  }
}
