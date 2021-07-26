import {MigrationInterface, QueryRunner} from "typeorm";

export class InvitationTable1627269035810 implements MigrationInterface {
    name = 'InvitationTable1627269035810'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `invitation` (`id` int NOT NULL AUTO_INCREMENT, `signature` varchar(255) NOT NULL, `salt` varchar(255) NOT NULL, `issuer` varchar(255) NOT NULL, `message` varchar(255) NOT NULL, `invitee_user_id` int NOT NULL DEFAULT '0', `inviter_user_id` int NOT NULL DEFAULT '0', `matataki_user_id` int NOT NULL DEFAULT '0', `expired_at` datetime NOT NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE `invitation`");
    }

}
