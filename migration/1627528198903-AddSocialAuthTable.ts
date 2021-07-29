import {MigrationInterface, QueryRunner} from "typeorm";

export class AddSocialAuthTable1627528198903 implements MigrationInterface {
    name = 'AddSocialAuthTable1627528198903'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `social_auth` (`id` int NOT NULL AUTO_INCREMENT, `user_id` int NOT NULL, `type` varchar(255) NOT NULL, `platform` varchar(255) NOT NULL, `access_token` varchar(255) NOT NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE `social_auth`");
    }

}
