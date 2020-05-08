export interface TaskOptions {
  period?: number;
  once?: boolean;
}

export abstract class Task implements Required<TaskOptions> {
  public readonly period: number;
  public readonly once: boolean;

  public constructor(
    public readonly id: string,
    {
      period = 60000,
      once = false
    }: TaskOptions = {}
  ) {
    this.period = period;
    this.once = once;
  }

  public abstract exec(...args: any[]): any;
}
