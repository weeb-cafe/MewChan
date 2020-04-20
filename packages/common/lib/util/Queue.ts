import { Logger } from 'winston';

export type PromiseFn = () => Promise<any>;

export class Queue {
  private readonly _queue: PromiseFn[] = [];
  private _processing = false;

  public constructor(private readonly _logger: Logger) {}

  public get length() {
    return this._queue.length;
  }

  private _process() {
    this._processing = true;
    const promiseFunc = this._queue.shift();

    if (!promiseFunc) {
      this._processing = false;
	  } else {
      promiseFunc()
        .catch(err => this._logger.error(err, { 'topic': 'QUEUE ERROR', 'function': promiseFunc.toString() }))
        .finally(() => this._process());
    }
  }

  public add(promiseFn: PromiseFn, now?: boolean) {
    this._queue[now ? 'unshift' : 'push'](promiseFn);
    if (!this._processing) this._process();
  }
}
