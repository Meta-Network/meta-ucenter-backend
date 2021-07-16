import {MigrationInterface, QueryRunner} from "typeorm";

export class RemoveForeignKeyOfAccount1626427574404 implements MigrationInterface {
    name = 'RemoveForeignKeyOfAccount1626427574404'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `account` DROP FOREIGN KEY `FK_60328bf27019ff5498c4b977421`");
        await queryRunner.query("ALTER TABLE `account` CHANGE `userId` `user_id` int NULL");
        await queryRunner.query("ALTER TABLE `user` ADD `accounts_id` text NULL");
        await queryRunner.query("ALTER TABLE `account` CHANGE `user_id` `user_id` int NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `account` CHANGE `user_id` `user_id` int NULL");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `accounts_id`");
        await queryRunner.query("ALTER TABLE `account` CHANGE `user_id` `userId` int NULL");
        await queryRunner.query("ALTER TABLE `account` ADD CONSTRAINT `FK_60328bf27019ff5498c4b977421` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

}
