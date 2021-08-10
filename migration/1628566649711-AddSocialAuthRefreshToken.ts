import {MigrationInterface, QueryRunner} from "typeorm";

export class AddSocialAuthRefreshToken1628566649711 implements MigrationInterface {
    name = 'AddSocialAuthRefreshToken1628566649711'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `social_auth` ADD `refresh_token` varchar(255) NOT NULL DEFAULT ''");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `social_auth` DROP COLUMN `refresh_token`");
    }

}
