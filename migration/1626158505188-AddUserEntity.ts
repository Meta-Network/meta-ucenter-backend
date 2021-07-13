import {MigrationInterface, QueryRunner} from "typeorm";

export class AddUserEntity1626158505188 implements MigrationInterface {
    name = 'AddUserEntity1626158505188'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `user` (`id` int NOT NULL AUTO_INCREMENT, `nickname` varchar(255) NOT NULL, `username` varchar(255) NOT NULL, `avatar` varchar(255) NOT NULL DEFAULT 'https://i.loli.net/2021/05/13/CiEFPgWJzuk5prZ.png', `bio` varchar(255) NOT NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE `user`");
    }

}
