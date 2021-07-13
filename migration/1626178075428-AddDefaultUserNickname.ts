import {MigrationInterface, QueryRunner} from "typeorm";

export class AddDefaultUserNickname1626178075428 implements MigrationInterface {
    name = 'AddDefaultUserNickname1626178075428'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` CHANGE `nickname` `nickname` varchar(255) NOT NULL DEFAULT ''");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` CHANGE `nickname` `nickname` varchar(255) NOT NULL");
    }

}
