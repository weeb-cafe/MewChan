import { Command } from 'discord-akairo';
import { can, Permissions } from '../../../util/Util';
import { MESSAGES } from '../../../util/Constants';
import { Message, TextChannel, GuildEmoji, Role } from 'discord.js';
import { Reaction } from '@mewchan/common';

export default class CreateReactionRoleCommand extends Command {
  public constructor() {
    super('createReactionRole', {
      aliases: ['createReactionRole'],
      category: 'config',
      channel: 'guild',
      userPermissions: msg => can(msg, Permissions.ADMIN, 'MANAGE_ROLES')
    });
  }

  public *args() {
    const emoji = yield {
      index: 0,
      type: (msg: Message, phrase: string) => {
        const emojiId = phrase.includes('<') &&
          phrase.includes(':') &&
          phrase.includes('>') &&
          phrase.split(':')[2].replace('>', '');

        return (emojiId && msg.guild!.emojis.cache.get(emojiId)) || phrase;
      },
      prompt: MESSAGES.COMMANDS.PROMPTS.CREATE_REACTION_ROLE_EMOJI
    };

    const role = yield {
      index: 1,
      type: 'role',
      prompt: MESSAGES.COMMANDS.PROMPTS.CREATE_REACTION_ROLE_ROLE
    };

    const channel: TextChannel = yield {
      'index': 3,
      'type': 'textChannel',
      'default': (msg: Message) => msg.channel
    };

    const message = yield {
      index: 2,
      type: (_: Message, phrase: string) => channel.messages.fetch(phrase).catch(() => null),
      prompt: MESSAGES.COMMANDS.PROMPTS.CREATE_REACTION_ROLE_MESSAGE
    };

    return { emoji, role, message };
  }

  public async exec(
    msg: Message,
    {
      emoji,
      role,
      message
    }: { emoji: GuildEmoji | string; role: Role; message: Message }
  ) {
    console.log(emoji);
    let react;

    try {
      react = await message.react(emoji);
    } catch {
      return msg.util!.send('Invalid emoji, please provide a valid one.');
    }

    const reaction = new Reaction();
    reaction.message = message.id;
    reaction.guildID = msg.guild!.id;
    reaction.role = role.id;
    reaction.identifier = react.emoji.toString();

    await this.client.reactions.save(reaction);

    return msg.util!.send(`Sure, the ${reaction.identifier} reaction to the given message will add/remove the \`${role.name}\` role`);
  }
}
