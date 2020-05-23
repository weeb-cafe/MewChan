import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { MESSAGES, COLORS } from '../../util/Constants';
import MewchanClient from '../../client/MewchanClient';

export default class HelpCommand extends Command {
  public constructor() {
    super('help', {
      aliases: ['help'],
      category: 'info',
      args: [
        {
          id: 'command',
          type: (msg, phrase) =>
            (msg.client as MewchanClient).commandHandler.modules.find(e => [e.id.toLowerCase(), e.id].includes(phrase))
        }
      ]
    });
  }

  public async exec(msg: Message, { command }: { command: Command }) {
    let embed: MessageEmbed;

    if (!command) {
      const prefix = msg.guild
        ? this.client.settings.get(msg.guild.id, 'prefix', process.env.COMMAND_PREFIX!)
        : process.env.COMMAND_PREFIX!;

      embed = new MessageEmbed()
        .setColor(COLORS.BLUE)
        .addField('Commands', `This is, but a simple list of commands, for more details on a single one use \`${prefix}help <command>\``);

      for (const category of this.handler.categories.values()) {
        embed.addField(
          category.id.replace(/(\b\w)/gi, lc => lc.toUpperCase()),
          category.filter(cmd => cmd.aliases.length > 0).map(cmd => `\`${cmd.aliases[0]}\``).join(' ')
        );
      }
    } else {
      let id = '';
      for (const token of command.id.replace(/-/g, '_')) {
        const upper = token.toUpperCase();
        id += upper === token ? `_${upper}` : upper;
      }

      id = id.replace(/__+/g, '_');

      console.log(id);

      const data = MESSAGES.COMMANDS.HELP[id];
      const name = `${data.parent ? `${data.parent} ` : ''}${data.parent ? command.id.split('-')[1] : command.id}`;

      embed = new MessageEmbed()
        .setColor(3447003)
        .setTitle(`\`${name}${data.usage ? ` ${data.usage}` : ''}\``)
        .addField('Description', data.content);

      if (command.aliases.length > 1) embed.addField('Aliases', `\`${command.aliases.join('` `')}\``, true);
      if (data.examples?.length) embed.addField('Examples', `\`${command.id} ${data.examples.join(`\`\n\`${name} `)}\``, true);
    }

    return msg.util!.send(embed);
  }
}
