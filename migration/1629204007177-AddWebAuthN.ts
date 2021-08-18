import {MigrationInterface, QueryRunner} from "typeorm";

export class AddWebAuthN1629204007177 implements MigrationInterface {
    name = 'AddWebAuthN1629204007177'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `web_auth_n` (`id` int NOT NULL AUTO_INCREMENT, `username` varchar(255) NOT NULL, `credential_id` varchar(255) NOT NULL, `public_key` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `account` CHANGE `user_id` `user_id` int NOT NULL COMMENT '账号对应的用户 id'");
        await queryRunner.query("ALTER TABLE `account` CHANGE `account_id` `account_id` varchar(255) NOT NULL COMMENT '账号名称，例如邮箱'");
        await queryRunner.query("ALTER TABLE `account` CHANGE `platform` `platform` varchar(255) NOT NULL COMMENT '账户的登录方式'");
        await queryRunner.query("CREATE INDEX `IDX_9cdce43fa0043c794281aa0905` ON `user` (`updated_at`)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `IDX_9cdce43fa0043c794281aa0905` ON `user`");
        await queryRunner.query("ALTER TABLE `account` CHANGE `platform` `platform` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `account` CHANGE `account_id` `account_id` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `account` CHANGE `user_id` `user_id` int NOT NULL");
        await queryRunner.query("DROP TABLE `web_auth_n`");
    }

}
