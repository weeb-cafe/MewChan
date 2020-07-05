import { Task } from '@mewchan/common';
import MewchanClient from '../client/MewchanClient';
import { createReminderEmbed } from '../util/Util';

export default class CycleRemindersTask extends Task {
  public constructor() {
    super('cycleReminders', {
      period: 60000,
      once: false
    });
  }

  public async exec(client: MewchanClient) {
    const reminders = await client.reminders.find({ where: { done: false } });

    for (const reminder of reminders) {
      if (reminder.remindAt > new Date()) continue;

      const user = await client.users.fetch(reminder.userID).catch(() => null);
      if (user) {
        await user.send(
          `Hi! You asked me to remind you about this.`,
          { embed: await createReminderEmbed(user, reminder, true) }
        ).catch(() => null);
      }

      reminder.done = true;
      await client.reminders.save(reminder);
    }
  }
}
