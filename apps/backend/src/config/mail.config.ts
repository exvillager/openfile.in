import * as nodemailer from "nodemailer";
import { CONFIG } from ".";

const transporter = nodemailer.createTransport({
  service: CONFIG.MAIL_SERVICE,
  auth: {
    user: CONFIG.MAIL_USER,
    pass: CONFIG.MAIL_PASS,
  },
});

const hostEmail = CONFIG.MAIL_USER;

export { transporter, hostEmail };
