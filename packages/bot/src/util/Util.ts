import {
  GuildChannel,
  User,
  Guild,
  ClientUser,
  PermissionResolvable,
  GuildMember,
  Message,
  MessageEmbed
} from 'discord.js';
import ReikaClient from '../client/ReikaClient';
import { Actions } from '@reika/common';
import { LOGS } from './Constants';
// import Action from '../struct/actions/Action';

export enum Permissions {
  NONE,
  MOD,
  ADMIN,
  OWNER,
  DEV
}

/**
 * Props to https://1Computer1/hoshi
 */
export const missingPermissions = (
  channel: GuildChannel,
  user: User | ClientUser,
  permissions: PermissionResolvable | PermissionResolvable[]
) => {
  const missingPerms = channel.permissionsFor(user)!.missing(permissions)
    .map(str => {
      if (str === 'VIEW_CHANNEL') return '`Read Messages`';
      if (str === 'SEND_TTS_MESSAGES') return '`Send TTS Messages`';
      if (str === 'USE_VAD') return '`Use VAD`';
      return `\`${str.replace(/_/g, ' ').toLowerCase().replace(new RegExp('/\b(\w)/g'), char => char.toUpperCase())}\``;
    });

  return missingPerms.length > 1
    ? `${missingPerms.slice(0, -1).join(', ')} and ${missingPerms.slice(-1)[0]}`
    : missingPerms[0];
};

export const userHistory = async (target: User, guild: Guild) => {
  const history = new MessageEmbed();

  const cases = await (target.client as ReikaClient).cases.find({
    where: {
      guildID: guild.id,
      targetID: target.id
    }
  });

  let severity = 0;
  const actions = [0, 0, 0, 0, 0];

  for (const cs of cases) {
    switch (cs.action) {
      case Actions.WARN:
        severity += 0.25;
        break;
      case Actions.KICK:
        severity += 0.5;
        break;
      case Actions.SOFTBAN:
        severity += 0.5;
        break;
      case Actions.MUTE:
        severity += 1;
        break;
      case Actions.BAN:
        severity += 2;
        break;
    }

    actions[cs.action]++;
  }

  severity = Math.round(severity);
  if (severity > 4) severity = 4;

  return history
    // .setColor(Action.SEVERITY[severity])
    .setFooter(`Warns ${actions[0]} | Kicks ${actions[1]} | Softbans ${actions[2]} | Mutes ${actions[3]} | Bans ${actions[4]}`);
};

export const permissionLevel = (member: GuildMember) => {
  const client = member.client as ReikaClient;
  if (client.isOwner(member)) return Permissions.DEV;

  const settings = client.settings.get(member.guild.id);
  const { adminRole, modRole } = settings || {};

  if (member.guild.ownerID === member.id) return Permissions.OWNER;
  if ((adminRole && member.roles.cache.has(adminRole)) || member.hasPermission('ADMINISTRATOR')) return Permissions.ADMIN;
  if (modRole && member.roles.cache.has(modRole)) return Permissions.MOD;
  return Permissions.NONE;
};

export const can = (
  msgOrMember: Message | GuildMember,
  level: Permissions,
  permission?: PermissionResolvable | PermissionResolvable[]
) => {
  const member = msgOrMember instanceof Message ? msgOrMember.member : msgOrMember;
  if (!member) {
    (msgOrMember.client as ReikaClient).logger.warn(...LOGS.WEIRD_CAN({ msg: msgOrMember as Message, level, permission }));
    return false;
  }

  if (permission && member.hasPermission(permission)) return true;
  const has = permissionLevel(member);

  return has >= level;
};
