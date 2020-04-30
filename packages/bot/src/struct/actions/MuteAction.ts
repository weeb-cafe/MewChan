import Action, { OptionalData } from './Action';
import { Actions } from '@reika/common';
import { Message, GuildMember } from 'discord.js';

export default class MuteAction extends Action<Actions.MUTE> {
  public constructor(
    msg: Message,
    target: GuildMember,
    optional?: OptionalData
  ) {
    super(Actions.MUTE, msg, target, optional);
  }

  public get muteRole() {
    return this.client.settings.get(this.guild.id, 'muteRole');
  }

  protected async prepare() {
    if (!this.muteRole) return 'There is no mute role set for this server.';
    if (!(this.target as GuildMember).manageable) return 'I cannot mute this user.';

    return super.prepare();
  }

  protected async run() {
    const msg = await this.msg.channel.send(`Muting ${this.targetUser.tag}.. please wait.`);

    return (this.target as GuildMember).roles
      .set([this.muteRole!])
      .then(() => msg.edit(`Successfully muted ${this.targetUser.tag}`));
  }
}
