import * as nodemailer from 'nodemailer';
import { config } from '../env';

export class EmailService {
  private static transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.email.emailId,
      pass: config.email.pass,
    },
  });

  static async sendAlert(message: string) {
    try {
      await this.transporter.sendMail({
        from: config.email.emailId,
        to: config.email.emailId,
        subject: ' Acrarium Middleware Alert',
        text: message,
        html: `<h2>Alert</h2><p>${message}</p><p>Time: ${new Date().toISOString()}</p>`,
      });
      console.log(`📧 Alert sent: ${message}`);
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }
}