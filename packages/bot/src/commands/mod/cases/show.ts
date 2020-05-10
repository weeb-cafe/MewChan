import { Command } from 'discord-akairo';
import { MESSAGES } from '../../../util/Constants';
import { Message, TextChannel } from 'discord.js';
import { Case, Actions } from '@mewchan/common';
import Action from '../../../struct/actions/Action';
import { oneLine, stripIndents } from 'common-tags';

export default class CaseShowCommand extends Command {
  public constructor() {
    super('case-show', {
      category: 'mod',
      args: [
        {
          id: 'cs',
          type: async (msg, phrase) => {
            if (!phrase) return null;

            const caseID = ['l', 'last', 'latest'].includes(phrase) ? msg.guild!.lastCase : parseInt(phrase);
            if (isNaN(caseID)) return null;

            const cs = await this.client.cases.findOne({ where: { guildID: msg.guild!.id, caseID } });
            return cs ?? null;
          },
          prompt: MESSAGES.COMMANDS.PROMPTS.CASE_SHOW
        }
      ]
    });
  }

  public async exec(msg: Message, { cs }: { cs: Case<Actions> }) {
    let embed;

    if (cs.message) {
      const id = this.client.settings.get(msg.guild!.id, 'modLogsChannel');
      const channel = (id ? msg.guild!.channels.cache.get(id) ?? null : null) as TextChannel | null;
      const message = await channel?.messages.fetch(cs.message)?.catch(() => null);
      const foundEmbed = message?.embeds[0];

      if (foundEmbed) embed = foundEmbed;
    } else {
      const target = await this.client.users.fetch(cs.targetID).catch(() => null);
      const mod = cs.modID ? await msg.guild!.members.fetch(cs.modID).catch(() => null) : null;
      const duration = cs.actionExpires ? cs.actionExpires.getTime() - cs.createdAt.getTime() : null;
      if (target) embed = await Action.logCase(target, msg.guild!, cs, mod, false, duration);
    }

    if (!embed) {
      let str = oneLine`Failed to get necessary data for an embed
        (this is because the mod log could not be accessed and the user does not exist anymore). Here is the raw data:\n`;
      str += stripIndents`\`\`\`json
        ${JSON.stringify(cs, null, 2)}
      \`\`\``;

      return msg.util!.send(str);
    }

    return msg.util!.send(embed);
  }
}
