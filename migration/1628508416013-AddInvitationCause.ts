import {MigrationInterface, QueryRunner} from "typeorm";

export class AddInvitationCause1628508416013 implements MigrationInterface {
    name = 'AddInvitationCause1628508416013'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `invitation` ADD `cause` varchar(255) NOT NULL COMMENT '邀请被创建的原因，用以区分创建邀请的多种方式' DEFAULT ''");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `invitation` DROP COLUMN `cause`");
    }

}
