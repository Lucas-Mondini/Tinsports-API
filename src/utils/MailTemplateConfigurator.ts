
import ejs from 'ejs';

interface Data {
  name?: string;
  code?: number;
}

interface MailTemplate {
  renderTemplate(): Promise<string>
}

export default class MailTemplateConfigurator implements MailTemplate
{
  private data: Data;
  private template: string;

  constructor(data: Data, template: string)
  {
    this.data = data;
    this.template = template;
  }

  async renderTemplate(): Promise<string>
  {
    return await ejs.renderFile(`${__dirname}/../mail/${this.template}.ejs`, this.data);
  }
}