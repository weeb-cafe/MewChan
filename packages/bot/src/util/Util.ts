import {
  GuildChannel,
  User,
  ClientUser,
  PermissionResolvable,
  GuildMember,
  Message,
  MessageOptions
} from 'discord.js';
import ReikaClient from '../client/ReikaClient';
import { LOGS } from './Constants';

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
    return 'Internal issue';
  }

  if (permission && member.hasPermission(permission)) return null;
  const has = permissionLevel(member);

  return has >= level ? null : 'Permission denied';
};

export const confirm = async (msg: Message, no: string, content?: string, extra?: MessageOptions): Promise<null | string> => {
  await msg.util!.send(content ?? 'Are you absolutely sure you want to do this? [y/n]', extra);
  const responses = await msg.channel.awaitMessages(
    (m: Message) => msg.author.id === m.author.id,
    {
      max: 1,
      time: 10000
    }
  );

  const response = responses.first();

  if (!response) return 'I don\'t have time for this, either reply in time or don\'t run the command';
  if (!/^y(?:e(?:a|s)?)?$/i.test(response.content)) return no;
  return null;
};
