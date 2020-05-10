import { Task } from './Task';
import { readdirRecursive, resolveFromESModule } from '../util';

export interface SchedulerOptions {
  directory?: string | null;
}

export class Scheduler implements Required<SchedulerOptions> {
  public readonly directory: string | null;
  public readonly tasks = new Map<string, Task>();
  public interval: NodeJS.Timeout | null = null;

  public constructor(
    public readonly parameters: any[],
    {
      directory
    }: SchedulerOptions = {}
  ) {
    this.directory = directory ?? null;
  }

  private readonly _timeouts = new Map<string, NodeJS.Timeout>();
  private readonly _intervals = new Map<string, NodeJS.Timeout>();

  public registerTimeout(label: string, time: number, cb: Function) {
    this._timeouts.set(label, setTimeout(() => {
      cb(...this.parameters);
      this.clearTimeout(label);
    }, time));
  }

  public clearTimeout(label: string) {
    const timeout = this._timeouts.get(label);
    if (timeout) clearTimeout(timeout);
    return this._timeouts.delete(label);
  }

  public refreshTimeout(label: string) {
    const timeout = this._timeouts.get(label);
    timeout?.refresh();
  }

  public registerInterval(label: string, time: number, cb: Function) {
    this._intervals.set(label, setInterval(() => cb(...this.parameters), time));
  }

  public clearInterval(label: string) {
    const interval = this._intervals.get(label);
    if (interval) clearInterval(interval);
    return this._intervals.delete(label);
  }

  public load(task: Task) {
    this.tasks.set(task.id, task);
    this[task.once ? 'registerTimeout' : 'registerInterval'](task.id, task.period, task.exec.bind(task));
  }

  public async loadAll() {
    if (this.directory == null) throw new Error('Scheduler#loadAll called with no directory set');

    const files = readdirRecursive(this.directory);
    const tasks = files
      .map(f => import(f)
        .then(resolveFromESModule));

    for await (const task of tasks) this.load(new task());
  }
}
