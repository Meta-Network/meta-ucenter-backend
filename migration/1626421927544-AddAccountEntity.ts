import {MigrationInterface, QueryRunner} from "typeorm";

export class AddAccountEntity1626421927544 implements MigrationInterface {
    name = 'AddAccountEntity1626421927544'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `account` (`id` int NOT NULL AUTO_INCREMENT, `account_id` varchar(255) NOT NULL, `platform` varchar(255) NOT NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `userId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `user` CHANGE `username` `username` varchar(255) NOT NULL DEFAULT ''");
        await queryRunner.query("ALTER TABLE `account` ADD CONSTRAINT `FK_60328bf27019ff5498c4b977421` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `account` DROP FOREIGN KEY `FK_60328bf27019ff5498c4b977421`");
        await queryRunner.query("ALTER TABLE `user` CHANGE `username` `username` varchar(255) NOT NULL");
        await queryRunner.query("DROP TABLE `account`");
    }

}
