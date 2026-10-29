import { MailPayload } from "../../type";

export interface INotification {
  // sendMail({ to, subject, html }: MailPayload): Promise<boolean>
  sendWelcomeEmail(email: string): Promise<void>;
  sendSubscriptionSuccessEmail(email: string, amount: number, currency: string): Promise<boolean>;
}
