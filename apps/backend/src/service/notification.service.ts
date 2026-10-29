import { IMailer } from "../interface/mailer.interface";
import { INotification } from "../interface/notification.interface";

export default class NotificationService implements INotification {
  private static instance: NotificationService;
  constructor(private mailer: IMailer) {}

  static getInstance(mailer: IMailer) {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService(mailer);
    }
    return NotificationService.instance;
  }

  async sendWelcomeEmail(email: string): Promise<void> {
    const subject = `👋 Welcome`;
    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; padding: 20px; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <p style="font-size: 16px; line-height: 1.5;">
              Welcome to <strong>OpenFile.in</strong> — your anonymous file sharing platform!
            </p>
            <p style="font-size: 14px;">Cheers,<br><strong>The OpenFile Team</strong></p>
          </div>
        </div>
      `;
    const isSuccessfull = await this.mailer.sendMail({ to: email, subject, html });
    if (!isSuccessfull) false;
  }

  // send email to user who bough our paid pro subscription
  async sendSubscriptionSuccessEmail(
    email: string,
    amount: number,
    currency: string,
  ): Promise<boolean> {
    const subject = `Subscription Activated - Welcome to Pro Plan`;
    const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; padding: 20px; background-color: #f9f9f9;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <h2 style="color: #4CAF50;">Your subscription is now active! 🚀</h2>
        <p style="font-size: 16px;">Hi there,</p>
        <p style="font-size: 16px; line-height: 1.5;">
          Thank you for subscribing to the <strong>Pro Plan</strong> on <strong>OpenFile.in</strong>.
        </p>
        <p style="font-size: 14px;">We have successfully received your payment of <strong>${amount} ${currency}</strong>.</p>
        <p style="font-size: 14px;">Enjoy faster uploads, larger storage, and premium features.</p>
        <br>
        <p style="font-size: 14px;">Cheers,<br><strong>The OpenFile Team</strong></p>
      </div>
    </div>
  `;

    const isSuccessfull = await this.mailer.sendMail({ to: email, subject, html });
    if (!isSuccessfull) return false;
    return true;
  }
}
