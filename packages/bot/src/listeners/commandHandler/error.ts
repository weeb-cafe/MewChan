import { Listener, Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class ErrorEvent extends Listener {
  public constructor() {
    super('error', {
      emitter: 'commandHandler',
      event: 'error',
      category: 'commandHandler'
    });
  }

  public exec(error: Error, msg: Message, command?: Command) {
    if (command) {
      return msg.util!.send(`Unexpected error: ${error.message}.\nPlease bring this error to a developer`);
    }
  }
}
