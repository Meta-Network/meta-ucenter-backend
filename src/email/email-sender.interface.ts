export interface IEmailSender {
  send(to: string, placeholders: { [key: string]: string });
}
