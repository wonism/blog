import nodemailer from 'nodemailer';
import smtpPool from 'nodemailer-smtp-pool';
import config from '../config/config.json';

const transporter = nodemailer.createTransport(
  smtpPool({
    service: config.mailer.service,
    host: config.mailer.host,
    port: config.mailer.port,
    auth: {
      user: config.mailer.user,
      pass: config.mailer.password
    },
    tls: {
      rejectUnauthorize: false
    },
    maxConnections: 5,
    maxMessages: 10
  })
);

export default transporter;
// module.export = transporter;

