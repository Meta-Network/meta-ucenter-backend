export interface AccountsVerifer {
  (accountDto: { account: string }): Promise<void>;
}
