import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('autoroles')
export class Autorole {
  @PrimaryColumn('bigint')
  public guildID!: string;

  @PrimaryColumn('bigint')
  public roleID!: string;

  @Column('integer', { nullable: true })
  public removeAfter!: number | null;
}
