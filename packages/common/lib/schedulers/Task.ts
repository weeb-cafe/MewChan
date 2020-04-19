export interface TaskOptions {
  period?: number;
  category?: string | null;
  once?: boolean;
}

export abstract class Task implements Required<TaskOptions> {
  public readonly period: number;
  public readonly category: string | null;
  public readonly once: boolean;

  public runAt: number;

  public constructor(
    public readonly id: string,
    {
      period = 60000,
      category = null,
      once = false
    }: TaskOptions = {}
  ) {
    this.period = period;
    this.category = category;
    this.once = once;

    this.runAt = Date.now() + period;
  }

  public abstract exec(...args: any[]): any;
}
