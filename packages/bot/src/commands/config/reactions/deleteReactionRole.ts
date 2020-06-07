import { Command } from 'discord-akairo';
import { can, Permissions } from '../../../util/Util';
import { MESSAGES } from '../../../util/Constants';
import { Message, TextChannel } from 'discord.js';

export default class DeleteReactionRoleCommand extends Command {
  public constructor() {
    super('deleteReactionRole', {
      aliases: ['deleteReactionRole'],
      category: 'config',
      channel: 'guild',
      userPermissions: can(Permissions.ADMIN, 'MANAGE_ROLES')
    });
  }

  public *args() {
    const channel: TextChannel = yield {
      'index': 2,
      'type': 'textChannel',
      'default': (msg: Message) => msg.channel
    };

    const message: Message = yield {
      index: 1,
      type: (_: Message, phrase: string) => channel.messages.fetch(phrase).catch(() => null),
      prompt: MESSAGES.COMMANDS.PROMPTS.DELETE_REACTION_ROLE_MESSAGE
    };

    const emoji = yield {
      index: 0,
      type: (_: Message, phrase: string) => {
        const reaction = message.reactions.cache.find(e => e.emoji.toString() === phrase);

        return reaction?.emoji.toString() ?? null;
      },
      prompt: MESSAGES.COMMANDS.PROMPTS.DELETE_REACTION_ROLE_EMOJI
    };

    return { emoji, message };
  }

  public async exec(
    msg: Message,
    {
      emoji,
      message
    }: { emoji: string; message: Message }
  ) {
    const deleted = await this.client.reactions.delete({
      guildID: msg.guild!.id,
      message: message.id,
      identifier: emoji
    }).then(d => (d.affected ?? 0) > 0);

    if (!deleted) return msg.util!.send('Uh... something went wrong, I guess I couldn\'t find the data? You sure it exists?');

    return msg.util!.send(`Okay, done.`);
  }
}
