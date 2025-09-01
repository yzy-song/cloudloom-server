import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSubcategoriesTable1756746681010 implements MigrationInterface {
    name = 'AddSubcategoriesTable1756746681010'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_products_subcategory"`);
        await queryRunner.query(`ALTER TABLE "subcategories" DROP CONSTRAINT "FK_subcategories_category"`);
        await queryRunner.query(`COMMENT ON TABLE "subcategories" IS NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "description" text`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "gender" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "subcategory_id" SET NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "products"."subcategory_id" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "subcategories"."image_url" IS NULL`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_c9de3a8edea9269ca774c919b9a" FOREIGN KEY ("subcategory_id") REFERENCES "subcategories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subcategories" ADD CONSTRAINT "FK_f7b015bc580ae5179ba5a4f42ec" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subcategories" DROP CONSTRAINT "FK_f7b015bc580ae5179ba5a4f42ec"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_c9de3a8edea9269ca774c919b9a"`);
        await queryRunner.query(`COMMENT ON COLUMN "subcategories"."image_url" IS 'URL for the subcategory image.'`);
        await queryRunner.query(`COMMENT ON COLUMN "products"."subcategory_id" IS 'Foreign key linking to the specific subcategory (e.g., 对襟襦裙).'`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "subcategory_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "gender" SET DEFAULT 'unisex'`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "description"`);
        await queryRunner.query(`COMMENT ON TABLE "subcategories" IS 'Stores specific product sub-categories, such as "马面裙" or "对襟襦裙".'`);
        await queryRunner.query(`ALTER TABLE "subcategories" ADD CONSTRAINT "FK_subcategories_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_products_subcategory" FOREIGN KEY ("subcategory_id") REFERENCES "subcategories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
