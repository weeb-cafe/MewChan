import { Command } from 'discord-akairo';
import fetch from 'node-fetch';
import { Message } from 'discord.js';
import { inspect } from 'util';
import { stripIndents } from 'common-tags';

export default class EvalCommand extends Command {
  public constructor() {
    super('eval', {
      aliases: ['eval', 'evaluate'],
      category: 'dev',
      ownerOnly: true,
      args: [
        {
          id: 'code',
          match: 'content',
          type: 'string',
          prompt: {
            start: 'What do you wanna run?'
          }
        }
      ]
    });
  }

  private async _clean(text: any) {
    if (text && text.then && text.catch) text = await text;
    if (typeof text !== 'string') text = inspect(text, { depth: 0 });

    return (text as string)
      .replace(/`/g, `\`${String.fromCharCode(8203)}`)
      .replace(/@/g, `@${String.fromCharCode(8203)}`)
      .replace(process.env.DISCORD_TOKEN!, 'this is supposed to be the bot\'s token')
      .replace(process.env.DB_URL!.split('@')[0].split(':')[2], 'this was the database password');
  }

  private _tooLong(body: string): Promise<string> {
    return fetch('https://paste.discord.land/documents', { method: 'POST', body })
      .then(d => d.json()
        .then(v => v.key));
  }

  public async exec(msg: Message, { code }: { code: string }) {
    const codeblock = (content: string) => `\`\`\`js\n${content}\`\`\``;
    try {
      const evaled = eval(code); // eslint-disable-line no-eval
      const clean = await this._clean(evaled);
      const final = stripIndents`📥 **Input**
        ${codeblock(code)}
        📤 **Output**
        ${codeblock(clean)}
      `;

      if (final.length > 2000) {
        const key = await this._tooLong(clean);
        return msg.util!.send(`Output exceeded 2000 characters (${final.length}). https://paste.discord.land/${key}.js`);
      }

      await msg.util!.send(final);
    } catch (e) {
      const clean = await this._clean(e);
      const final = stripIndents`📥 **Input**
      ${codeblock(code)}
      📤 **Error**
      ${codeblock(clean)}
      `;

      if (final.length > 2000) {
        const key = await this._tooLong(clean);
        return msg.util!.send(`Error exceeded 2000 characters (${final.length}). https://paste.discord.land/${key}.js`);
      }

      await msg.util!.send(final);
    }
  }
}
