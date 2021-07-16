import {MigrationInterface, QueryRunner} from "typeorm";

export class RemoveUserForeignKey1626436794423 implements MigrationInterface {
    name = 'RemoveUserForeignKey1626436794423'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `FK_60328bf27019ff5498c4b977421` ON `account`");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `accounts_id`");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` ADD `accounts_id` text NULL");
        await queryRunner.query("CREATE INDEX `FK_60328bf27019ff5498c4b977421` ON `account` (`user_id`)");
    }

}
