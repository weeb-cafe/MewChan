import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { Reminder, ms } from '@mewchan/common';
import { COLORS } from '../../../util/Constants';

export default class ListReminderCommand extends Command {
  public constructor() {
    super('reminder-list', {
      category: 'util'
    });
  }

  public async exec(msg: Message) {
    const reminders: Reminder[] = await this.client.reminders.find({
      where: {
        userID: msg.author.id
      }
    }).catch(() => []);

    if (!reminders.length) return msg.util!.send('You don\'t have any active reminders!');

    return msg.util!.send(
      this.client.util.embed()
        .setColor(COLORS.BRAND.BLUE)
        .setTimestamp()
        .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
        .setDescription(
          reminders
            .map(reminder => `In ${ms(reminder.remindAt.valueOf() - Date.now(), true)}: ${reminder.content}`)
            .join('\n')
        )
    );
  }
}
