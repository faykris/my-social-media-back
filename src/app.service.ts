import { Injectable } from '@nestjs/common';
import { MailService } from './mail/mail.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AppService {
  private mailTransporter;
  constructor(private mailService: MailService) {
    this.mailTransporter = nodemailer.createTransport({
      host: 'in-v3.mailjet.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAILJET_API_KEY,
        pass: process.env.MAILJET_API_SECRET,
      },
    });
  }

  getHello(): string {
    return 'Hello My Social Media!';
  }

  async sendWelcomeEmail(email: string, fullName: string) {
    const mailMessage = {
      to: email,
      subject: 'Registro exitoso',
      html: `
      <h1>Bienvenido <span>${fullName}<span> a Mi Red Social</h1>
      <p>Ya podrás inciar sesión y compartir tus publicaciones con la comunidad.</p>
      `,
    };


    try {
      await this.mailTransporter.sendMail({
        from: '"My Social Media" <faykris28@gmail.com>',
        to: mailMessage.to,
        subject: mailMessage.subject,
        html: mailMessage.html,
      });
    } catch (error) {
      console.error('Error sending email', error);
    }
  }
}
