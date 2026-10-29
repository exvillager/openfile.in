import { Resend } from "resend";
import { CONFIG } from "../config";
import { transporter, hostEmail } from "../config/mail.config";
import { IMailer, MailPayload } from "../interface/mailer.interface";
import { assert } from "console";

export class NodemailerService implements IMailer {
  private transporter;
  private hostEmail;
  private static instance: NodemailerService;

  private constructor() {
    this.transporter = transporter;
    this.hostEmail = hostEmail;
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new NodemailerService();
    }
    return this.instance;
  }

  async sendMail({ to, subject, html }: MailPayload): Promise<boolean> {
    try {
      const result = await this.transporter.sendMail({
        from: this.hostEmail,
        to,
        subject,
        html,
      });
      if (!result) throw new Error("Failed to send email");
      console.log(`Email sent successfully to: ${to}`);
      return true;
    } catch (err) {
      return false;
    }
  }
}

export class ResendMailService implements IMailer {
  private resend: Resend;
  constructor() {
    this.resend = new Resend(CONFIG.RESEND_API_KEY);
  }

  async sendMail({ to, subject, html, text }: MailPayload): Promise<boolean> {
    if (!CONFIG.MAIL_USER) {
      console.error("Resend send error: MAIL_USER is not configured");
      return false;
    }

    const content = html ? { html } : text ? { text } : null;
    if (!content) {
      console.error("Resend send error: missing html or text content");
      return false;
    }

    try {
      await this.resend.emails.send({
        from: CONFIG.MAIL_USER,
        to,
        subject,
        ...content,
      });
      console.log(`Resend email sent successfully to: ${to}`);
      return true;
    } catch (error) {
      console.error("Resend send error:", error);
      return false;
    }
  }
}
