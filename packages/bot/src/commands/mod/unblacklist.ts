import { Command } from 'discord-akairo';
import { can, Permissions } from '../../util/Util';
import { Message, User } from 'discord.js';
import { MESSAGES } from '../../util/Constants';

export default class UnblacklistCommand extends Command {
  public constructor() {
    super('unblacklist', {
      aliases: ['unblacklist'],
      category: 'mod',
      channel: 'guild',
      userPermissions: msg => can(msg, Permissions.MOD),
      args: [
        {
          id: 'user',
          type: 'user',
          match: 'content',
          prompt: MESSAGES.COMMANDS.PROMPTS.BLACKLIST
        }
      ]
    });
  }

  public async exec(msg: Message, { user }: { user: User }) {
    const res = await this.client.blacklistManager.deleteEntry(`${msg.guild!.id}-${user.id}`);

    if (!res) return msg.util!.send('That user does not seem to be blacklisted.');

    return msg.util!.send(`${user.tag} can once again use commands in this server`);
  }
}
