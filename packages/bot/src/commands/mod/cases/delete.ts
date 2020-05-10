import { Command } from 'discord-akairo';
import { MESSAGES } from '../../../util/Constants';
import { Message, TextChannel } from 'discord.js';
import { Case, Actions } from '@mewchan/common';
import Action from '../../../struct/actions/Action';
import { confirm } from '../../../util/Util';

export default class CaseShowCommand extends Command {
  public constructor() {
    super('case-delete', {
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

    let str = '';
    if (!embed) str += `Case data not found, here's the raw data:\`\`\`js\n${JSON.stringify(cs, null, 2)}\`\`\`\n`;
    str += 'Are you sure you want to delete this case? [y/n]';

    const confirmation = await confirm(msg, 'Changed your mind? Very well', str, { embed });
    if (confirmation !== null) return msg.util!.send(confirmation);

    const member = await msg.guild!.members.fetch(cs.targetID).catch(() => null);

    let failure = false;
    let reverted = true;

    try {
      switch (cs.action) {
        case Actions.MUTE:
          // eslint-disable-next-line no-case-declarations
          const muteRole = this.client.settings.get(msg.guild!.id, 'muteRole');
          if (muteRole && member?.roles.cache.has(muteRole)) await member.roles.set(cs.unmuteRoles!);
          break;
        case Actions.BAN:
          // eslint-disable-next-line no-case-declarations
          const bans = await msg.guild!.fetchBans();
          if (bans.has(cs.targetID)) await msg.guild!.members.unban(cs.targetID);
          break;
        default:
          reverted = false;
          break;
      }
    } catch {
      failure = true;
    }

    await this.client.cases.delete(cs);

    let out = 'Okay, case was deleted';
    if (reverted) {
      out += `, ${failure ? 'I did fail to revert the action though, might wanna do that manually' : 'I also reverted the action'}`;
    }

    return msg.util!.send(out);
  }
}
