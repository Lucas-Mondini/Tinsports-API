import nodeMailer, {Transporter} from "nodemailer";
import logger from "../utils/logger";

interface MailType {
  from?: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

interface ConnectionType {
  host: string;
  service: string;
  port: number;
  secure: boolean;
  auth: AuthType;
}

interface AuthType {
  user: string;
  pass: string;
}

interface MailerType {
  sendMail(): boolean | void;
}

export default class Mailer implements MailerType {
  private mailInfo: MailType;
  private connection: ConnectionType;

  constructor({to, subject, html, text}: MailType)
  {
    this.mailInfo = {to, from: process.env.MAIL_HOST || "", subject, html, text}
    this.connection = {
      host: process.env.MAIL_HOST || "",
      service: process.env.MAIL_HOST || "",
      secure: true,
      port: Number(process.env.MAIL_PORT) || 0,
      auth: {
        user: process.env.MAIL || "",
        pass: process.env.MAIL_PASS || ""
      }
    }
  }

  private createTransport(): boolean | Transporter
  {
    if (!this.validateMailConfig()) {
      return false;
    }

    return nodeMailer
            .createTransport(this.connection);
  }

  public sendMail(): boolean | void
  {
    const sender = this.createTransport();

    if (typeof sender != 'object') {
      logger.error("Mail couldn't be sent");
      return false;
    }

    sender.sendMail(this.mailInfo, (error) => {
      if (error) {
        console.log(error)
        logger.error(error);
      }
    });
  }

  private validateMailConfig(): boolean
  {
    let errorCount = 0;
    const connectionInfo: any = this.connection;

    for (const config in connectionInfo) {
      if (
        connectionInfo[config] == "" || connectionInfo[config] == 0 ||
        connectionInfo[config]['user'] == "" || connectionInfo[config]['pass'] == ""
      ) {
        errorCount++
      }
    }

    if (errorCount > 0) {
      logger.error("Mail is not configured properly");
      return false;
    }

    return true;
  }
}