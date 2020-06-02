import MewchanClient from '../client/MewchanClient';
import { Ticket, TicketStatus } from '@mewchan/common';
import { Guild, CategoryChannel, MessageEmbed, User, Message, TextChannel } from 'discord.js';
import { confirm } from '../util/Util';
import { COLORS } from '../util/Constants';

export default class TicketHandler {
  public static getStatusColor(status: TicketStatus) {
    switch (status) {
      case TicketStatus.PENDING: return COLORS.MODMAIL.YELLOW;
      case TicketStatus.DENIED: return COLORS.MODMAIL.RED;
      case TicketStatus.RESOLVED: return COLORS.MODMAIL.GREEN;
    }
  }

  public static makeTicketEmbed(id: number, user: User | { id: string }, data: Ticket) {
    return new MessageEmbed()
      .setDescription(data.issue)
      .setAuthor(user instanceof User ? `${user.tag} (${user.id})` : user.id, user instanceof User ? user.displayAvatarURL() : undefined)
      .setFooter(`Ticket ${id}`)
      .setColor(TicketHandler.getStatusColor(data.status))
      .setTimestamp();
  }

  public constructor(
    public readonly client: MewchanClient
  ) {}

  public async submit(guild: Guild, msg: Message, data: Ticket) {
    const id = await this.client.tickets.findOne({
      order: {
        id: 'DESC'
      }
    }).then(d => (d?.id ?? 0) + 1);

    data.guildID = guild.id;
    data.status = TicketStatus.PENDING;

    const modMailCategory = this.client.settings.get(guild.id, 'modMailCategory');
    const category = (modMailCategory ? (guild.channels.cache.get(modMailCategory) ?? null) : null) as CategoryChannel | null;

    if (!category) return 'No mod mail category has been set for this server';
    const embed = TicketHandler.makeTicketEmbed(id, msg.author, data);

    const confirmation = await confirm(msg, 'You should be more decisive', 'Do you really want to submit this ticket? [y/n]', embed);
    if (confirmation) return confirmation;

    try {
      const channel = await guild.channels.create(`ticket-${id}`, {
        parent: category,
        type: 'text',
        permissionOverwrites: [{
          id: msg.author.id,
          allow: 'VIEW_CHANNEL'
        }]
      });

      data = await this.client.tickets.save(data);
      await channel.send(embed);
      await msg.channel.send(`Done, submitted ticket with ID ${id}, you may talk with staff in ${channel}`);
      return null;
    } catch (e) {
      return `Failed to send ticket, please tell staff about this:\n${e}`;
    }
  }

  public async close(guild: Guild, msg: Message, data: Ticket, resolved: boolean) {
    data.status = resolved ? TicketStatus.RESOLVED : TicketStatus.DENIED;

    const modMailCategory = this.client.settings.get(guild.id, 'modMailCategory');
    const category = (modMailCategory ? (guild.channels.cache.get(modMailCategory) ?? null) : null) as CategoryChannel | null;

    if (!category) return 'Boop, mod mail category no longer configured, hello?';

    try {
      await msg.util!.send('Okay... lemme do my magic and I\'ll delete the channel.');

      const channel = category.children.find(c => c.name === `ticket-${data.id}`) as TextChannel | undefined;
      if (!channel) return `Uh, is the channel gone? I'm looking for \`ticket-${data.id}\` but I can't quite find it.`;

      let archivesChannel = (category.children.find(c => c.name === 'archives') ?? null) as TextChannel | null;
      if (!archivesChannel) {
        archivesChannel = await guild.channels.create('archives', {
          parent: category,
          type: 'text'
        }).catch(() => null);
      }

      if (!archivesChannel) return `Uh-oh, couldn't find an archives channel & couldn't create one either.`;

      let messages = channel.messages.cache.filter(m => !m.author.bot);
      const confirmation = await confirm(msg, 'Okay... hold on.', `I have ${messages.size} messages, looks good?`);

      let shouldContinue = true;

      if (confirmation) {
        messages = await channel.messages.fetch({ limit: 100 }).then(m => m.filter(mes => !mes.author.bot));
        const secondConfirmation = await confirm(
          msg,
          'Okay, I\'ll continue doing my thing then.',
          `I now have ${messages.size} messages, like it or not, I can't get more! Would you like manual intervention?`
        );

        // ? To refresh on tired brains, if the variable is null it means the user replied with yes (would like manual intervention)
        // ? In which case, we shouldn't continue with the archiving, just save the ticket data and exit the function
        if (!secondConfirmation) shouldContinue = false;
        await msg.util!.send(secondConfirmation);
      }

      await this.client.tickets.save(data);

      if (shouldContinue) {
        let contents = `Ticket ${data.id}\n`;

        for (const message of messages.values()) {
          contents +=
            `${message.author.tag} (${message.author.id})[${message.author.id === data.authorID ? 'OP' : 'STAFF'}]:${message.content}\n`;
        }

        await archivesChannel.send({ files: [{ name: `ticket-${data.id}.txt`, attachment: Buffer.from(contents) }] });
        await channel.delete();
      }

      await msg.util!.sendNew(`Done, ticket ${data.id} was closed!`);
      return null;
    } catch (e) {
      return `Failed to close ticket:\n${e}`;
    }
  }
}
