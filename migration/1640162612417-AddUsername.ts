import {MigrationInterface, QueryRunner} from "typeorm";

export class AddUsername1640162612417 implements MigrationInterface {
    name = 'AddUsername1640162612417'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `social_auth` ADD `username` varchar(255) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `social_auth` DROP COLUMN `username`");
    }

}
