// src/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Ctx, MessagePattern, Payload } from '@nestjs/microservices';

@Injectable()
export class MailService {
  private mailTransporter;

  constructor() {
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
      console.error('Error al enviar correo electrónico:', error);
    }
  }

  @MessagePattern('send_mail')
  async handleSendMail(@Payload()data: {to: string, fullName: string}, @Ctx() context) {

    const { to, fullName } = data;
    await this.sendWelcomeEmail(to, fullName);
  }
}