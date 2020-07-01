import { Listener } from 'discord-akairo';
import { MessageReaction, User } from 'discord.js';

export default class MessageReactionAddListener extends Listener {
  public constructor() {
    super('messageReactionAdd', {
      emitter: 'client',
      event: 'messageReactionAdd',
      category: 'client'
    });
  }

  public async exec(reaction: MessageReaction, user: User) {
    const { message } = reaction;

    if (!message.guild) return;

    const identifier = reaction.emoji.toString();
    const guildID = message.guild.id;

    const reactions = await this.client.reactions.find({
      where: {
        guildID,
        message: message.id
      }
    });

    const react = reactions.find(r => r.identifier === identifier);

    if (react) {
      try {
        const unique = await this.client.reactionMessages.findOne(message.id).then(d => d?.unique ?? false);
        const member = await message.guild.members.fetch(user.id);

        if (unique && reactions.some(r => r.role !== react.role && member.roles.cache.has(r.role))) {
          return member.user.send('You can only get one role from that message');
        }

        await member.roles.add(react.role);
      } catch {}
    }
  }
}
