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
    try {
      const mailMessage = {
        to: email,
        subject: 'Registro exitoso',
        html: `
        <div style="background-color: #04C3C6; padding: .5rem 1.5rem;">
          <h2 style="text-align: center;">
            Bienvenido <span style="color: #04C3C6;">${fullName}</span> a My Social Media
          </h2>
        </div>
        <div style="background-color: #020202; padding: .5rem 1rem; color: #FFFFFF;">
          <p>
            Ya eres parte de nuestra comunidad. Te invitamos a realizar tus primeras 
            publicaciones y comparte con tus amigos cada suceso o pensamiento. 
          </p>
          <p>
            Con cada publicación, tendrás la posibilidad de crecer aún más tu círculo 
            de amistades y lograr tus metas con My Social Media.
          </p>
          <p>
            En algún momento si lo deseas te podrás desvincular de nosotros. Por el momento 
            te digo que disfrutes mucho de este espacio.
          </p>
          <p>
            Cordialmente.
          </p>
          <h4 style="color: #30C604;">
            My Social App
          </h4>
        </div>
        `,
      };
    
      return await this.mailTransporter.sendMail({
        from: '"My Social Media" <faykris28@gmail.com>',
        to: mailMessage.to,
        subject: mailMessage.subject,
        html: mailMessage.html,
      });
    } catch (error) {
      console.error('Error al enviar correo electrónico:', error);
    }
  }

}