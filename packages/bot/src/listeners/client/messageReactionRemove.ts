import { Listener } from 'discord-akairo';
import { MessageReaction, User } from 'discord.js';

export default class MessageReactionRemoveListener extends Listener {
  public constructor() {
    super('messageReactionRemove', {
      emitter: 'client',
      event: 'messageReactionRemove',
      category: 'client'
    });
  }

  public async exec(reaction: MessageReaction, user: User) {
    const { message } = reaction;

    if (!message.guild) return;

    const identifier = reaction.emoji.toString();
    const guildID = message.guild.id;

    const react = await this.client.reactions.findOne({
      where: {
        guildID,
        message: message.id,
        identifier
      }
    });

    if (react) {
      if (react.unremoveable) return;

      try {
        const member = await message.guild.members.fetch(user.id);
        await member.roles.remove(react.role);
      } catch {}
    }
  }
}
