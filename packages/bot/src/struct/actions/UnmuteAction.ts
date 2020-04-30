import Action, { OptionalData } from './Action';
import { Actions, Case } from '@reika/common';
import { Message, GuildMember } from 'discord.js';
import CyclePunishments from '../../tasks/CyclePunishments';

export default class UnmuteAction extends Action<Actions.UNMUTE> {
  public constructor(
    msg: Message,
    target: GuildMember,
    optional?: OptionalData
  ) {
    super(Actions.UNMUTE, msg, target, optional);
  }

  protected async prepare() {
    if (!(this.target as GuildMember).manageable) return 'I cannot unmute this user.';

    return super.prepare();
  }

  protected async run() {
    const punishments = this.client.scheduler.tasks.get('cyclePunishments') as CyclePunishments;
    const ref = await this.client.cases.findOne({
      where: {
        guildID: this.guild.id,
        targetID: this.target.id,
        action: Actions.MUTE,
        resolved: false
      },
      order: {
        id: 'ASC'
      }
    });

    const refCase = (ref ?? this.case) as Case<Actions.MUTE>;
    if (refCase.caseID !== this.case.id) this.case.refID = refCase.caseID;

    const res = await punishments.handleMute(this.guild, refCase);
    if (typeof res === 'string') return this.msg.channel.send(res);
  }
}
