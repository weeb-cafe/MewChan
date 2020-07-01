import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('afks')
export class Afk {
  @PrimaryColumn('bigint')
  public userID!: string;

  @PrimaryColumn('bigint')
  public guildID!: string;

  @Column('text', { nullable: true })
  public reason!: string | null;
}
