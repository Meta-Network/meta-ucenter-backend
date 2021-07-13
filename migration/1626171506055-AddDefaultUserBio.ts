import {MigrationInterface, QueryRunner} from "typeorm";

export class AddDefaultUserBio1626171506055 implements MigrationInterface {
    name = 'AddDefaultUserBio1626171506055'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` CHANGE `avatar` `avatar` varchar(255) NOT NULL DEFAULT 'https://i.loli.net/2021/05/13/CiEFPgWJzuk5prZ.png'");
        await queryRunner.query("ALTER TABLE `user` CHANGE `bio` `bio` varchar(255) NOT NULL DEFAULT ''");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` CHANGE `bio` `bio` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `user` CHANGE `avatar` `avatar` varchar(255) NOT NULL");
    }

}
