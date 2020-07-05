import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { ms, Reminder } from '@mewchan/common';
import { MESSAGES } from '../../../util/Constants';
import { createReminderEmbed } from '../../../util/Util';

export default class ReminderCreateCommand extends Command {
  public constructor() {
    super('reminder-create', {
      category: 'util',
      args: [
        {
          id: 'time',
          type: (_, phrase) => {
            if (!phrase) return null;

            const duration = ms(phrase);
            if (duration && duration >= 300000 && !isNaN(duration)) return duration;
            return null;
          },
          prompt: MESSAGES.COMMANDS.PROMPTS.REMINDER_CREATE_TIME
        },
        {
          id: 'content',
          type: 'string',
          match: 'rest',
          prompt: MESSAGES.COMMANDS.PROMPTS.REMINDER_CREATE_REMINDER
        }
      ]
    });
  }

  public async exec(msg: Message, { time, content }: { time: number; content: string }) {
    const reminder = new Reminder();

    reminder.userID = msg.author.id;
    reminder.content = content;
    reminder.createdAt = new Date();
    reminder.remindAt = new Date(Date.now() + time);
    reminder.done = false;

    const res = await this.client.reminders.save(reminder);

    return msg.util!.send(
      'Successfully created your reminder. Please keep in mind if your DMs are not open at the time it will simply be dismissed.',
      { embed: await createReminderEmbed(msg.author, res) }
    );
  }
}
