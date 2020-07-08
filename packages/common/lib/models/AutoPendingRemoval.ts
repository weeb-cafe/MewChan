import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('autorole_pending_removals')
export class AutoPendingRemoval {
  @PrimaryColumn('bigint')
  public guildID!: string;

  @PrimaryColumn('bigint')
  public roleID!: string;

  @PrimaryColumn('bigint')
  public memberID!: string;

  @Column('timestamp')
  public createdAt!: Date;

  @Column('timestamptz')
  public removeAt!: Date;
}
