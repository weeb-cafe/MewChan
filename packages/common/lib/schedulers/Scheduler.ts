import { Task } from './Task';
import { readdirRecursive, resolveFromESModule } from '../util';

export interface SchedulerOptions {
  directory?: string | null;
}

export class Scheduler implements Required<SchedulerOptions> {
  public readonly tasks = new Map<string, Task>();
  public readonly directory: string | null;
  public interval: NodeJS.Timeout | null = null;

  public constructor(
    public readonly parameters: any[],
    {
      directory
    }: SchedulerOptions = {}
  ) {
    this.directory = directory ?? null;
  }

  private readonly _callback = async () => {
    for (const [id, task] of this.tasks) {
      if (task.runAt < Date.now()) continue;

      if (!task.once) task.runAt = Date.now() + task.period;
      else this.tasks.delete(id);

      task.exec(...this.parameters);
    }
  };

  public load(task: Task) {
    if (task.period) {
      const period = task.period / 1000 / 60;
      if (
        period < 1 ||
        period.toString().includes('.')
      ) console.warn(`Imperfect value passed for Task<${task.id}>#period.`);
    }

    this.tasks.set(task.id, task);
  }

  public async loadAll() {
    if (this.directory == null) throw new Error('Scheduler#loadAll called with no directory set');

    const files = readdirRecursive(this.directory);
    const tasks = files
      .map(f => import(f)
        .then(resolveFromESModule));

    for await (const task of tasks) this.load(new task());
  }

  public refresh(id: string) {
    const task = this.tasks.get(id);
    if (!task?.once) {
      throw new Error(`Failed to refresh Task${task?.id ? `<${task.id}>` : ''}, it either does not exist or it's not a timeout`);
    }

    task.runAt = Date.now() + task.period;
  }

  public async init() {
    await this.loadAll();
    this.interval = setInterval(this._callback, 60000);
  }
}
