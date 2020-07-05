import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('reminders')
export class Reminder {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column('bigint')
  public userID!: string;

  @Column()
  public content!: string;

  @Column('timestamptz', { 'default': () => 'now()' })
  public createdAt!: Date;

  @Column('timestamptz')
  public remindAt!: Date;

  @Column({ 'default': false })
  public done!: boolean;
}
