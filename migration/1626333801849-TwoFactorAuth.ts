import {MigrationInterface, QueryRunner} from "typeorm";

export class TwoFactorAuth1626333801849 implements MigrationInterface {
    name = 'TwoFactorAuth1626333801849'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `two_factor_auth` (`id` int NOT NULL AUTO_INCREMENT, `secret` varchar(255) NULL, `type` enum ('TOTP', 'EmailCode') NOT NULL, `isEnabled` tinyint NOT NULL DEFAULT 0, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `userId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `two_factor_auth` ADD CONSTRAINT `FK_ceebe2fe995d01aeff8cb013f53` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `two_factor_auth` DROP FOREIGN KEY `FK_ceebe2fe995d01aeff8cb013f53`");
        await queryRunner.query("DROP TABLE `two_factor_auth`");
    }

}
