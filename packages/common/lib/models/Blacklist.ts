import { Entity, PrimaryColumn, Column } from 'typeorm';

export enum BlacklistType {
  USER,
  GUILD
}

@Entity('blacklist')
export class Blacklist {
  @PrimaryColumn('bigint')
  public id!: string;

  @Column('tinyint')
  public type!: BlacklistType;
}
