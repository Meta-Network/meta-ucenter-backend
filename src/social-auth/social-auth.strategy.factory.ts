import { Injectable } from '@nestjs/common';
import { GithubStrategy } from './github/github.strategy';

@Injectable()
export class SocialAuthStrategyFactory {
  constructor(private githubStrategy: GithubStrategy) {}

  public getService(context: string) {
    switch (context) {
      case 'github':
        return this.githubStrategy;
      default:
        throw new Error(`No service defined for the context: "${context}"`);
    }
  }
}
