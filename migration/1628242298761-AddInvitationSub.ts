import {MigrationInterface, QueryRunner} from "typeorm";

export class AddInvitationSub1628242298761 implements MigrationInterface {
    name = 'AddInvitationSub1628242298761'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `invitation` ADD `sub` varchar(255) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `invitation` DROP COLUMN `sub`");
    }

}
