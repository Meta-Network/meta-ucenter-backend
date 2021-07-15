export interface IEmailSender {
  send({ from, fromName, to, templateInvokeName }, placeholders);
}
