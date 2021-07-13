import {MigrationInterface, QueryRunner} from "typeorm";

export class try1626151331220 implements MigrationInterface {
    name = 'try1626151331220'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `user` (`id` int NOT NULL AUTO_INCREMENT, `address` varchar(255) NOT NULL, `username` varchar(255) NOT NULL, `avatar` varchar(255) NOT NULL DEFAULT 'https://i.loli.net/2021/05/13/CiEFPgWJzuk5prZ.png', `nickname` varchar(255) NOT NULL, `description` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE `user`");
    }

}
