import { Injectable } from '@nestjs/common';
import { GiteeStrategy } from './gitee/gitee.strategy';
import { GithubStrategy } from './github/github.strategy';
import { MatatakiStrategy } from './matataki/matataki.strategy';

@Injectable()
export class SocialAuthStrategyFactory {
  constructor(
    private githubStrategy: GithubStrategy,
    private giteeStrategy: GiteeStrategy,
    private matatakiStrategy: MatatakiStrategy,
  ) {}

  public getService(context: string) {
    switch (context) {
      case 'github':
        return this.githubStrategy;
      case 'gitee':
        return this.giteeStrategy;
      case 'matataki':
        return this.matatakiStrategy;
      default:
        throw new Error(`No service defined for the context: "${context}"`);
    }
  }
}
