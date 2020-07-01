import { Command } from 'discord-akairo';
import { can, Permissions } from '../../../util/Util';
import { MESSAGES } from '../../../util/Constants';
import { Message, TextChannel } from 'discord.js';
import { ReactionMessage } from '@mewchan/common';

export default class MarkReactionGroupCommand extends Command {
  public constructor() {
    super('markReactionGroup', {
      aliases: ['markReactionGroup'],
      category: 'config',
      channel: 'guild',
      userPermissions: msg => can(msg, Permissions.ADMIN, 'MANAGE_ROLES')
    });
  }

  public *args() {
    const channel: TextChannel = yield {
      'type': 'textChannel',
      'index': 1,
      'default': (msg: Message) => msg.channel
    };

    const message = yield {
      type: (_: Message, phrase: string) => {
        if (!phrase) return null;
        return channel.messages.fetch(phrase).catch(() => null);
      },
      index: 0,
      prompt: MESSAGES.COMMANDS.PROMPTS.MARK_REACTION_GROUP
    };

    return { message };
  }

  public async exec(msg: Message, { message }: { message: Message }) {
    const existing = await this.client.reactionMessages.findOne(message.id);
    const unique = existing?.unique ? !existing.unique : true;

    const entry = existing ?? new ReactionMessage();

    entry.id = message.id;
    entry.unique = unique;

    await this.client.reactionMessages.save(entry);

    return msg.util!.send(
      unique
        ? 'Okay, from now on people are only gonna be able to grab one role from that message'
        : 'Okay, people can grab as many roles as they want from that message'
    );
  }
}
