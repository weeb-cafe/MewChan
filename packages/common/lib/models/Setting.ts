import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('settings')
export class Setting {
  @PrimaryColumn('bigint')
  public id!: string;

  @Column({ 'default': process.env.COMMAND_PREFIX ?? 'c!' })
  public prefix!: string;

  @Column({ 'default': false })
  public autodel!: boolean;

  @Column({ 'default': 3 })
  public starThreshold!: number;

  @Column('bigint', { nullable: true })
  public starChannel!: string | null;

  @Column('bigint', { nullable: true })
  public modLogsChannel!: string | null;

  @Column('bigint', { nullable: true })
  public adminRole!: string | null;

  @Column('bigint', { nullable: true })
  public modRole!: string | null;

  @Column('bigint', { nullable: true })
  public muteRole!: string | null;
}
