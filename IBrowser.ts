import IBrowserContext from './IBrowserContext';
import IBrowserEngine from './IBrowserEngine';
import { IBrowserHooks } from './IHooks';
import type ITypedEventEmitter from '@ulixee/commons/interfaces/ITypedEventEmitter';
import IDevtoolsSession from './IDevtoolsSession';

export default interface IBrowser extends ITypedEventEmitter<IBrowserEvents> {
  id: string;
  name: string;
  fullVersion: string;
  majorVersion: number;
  engine: IBrowserEngine;
  devtoolsSession: IDevtoolsSession;
  browserContextsById: Map<string, IBrowserContext>;
  close(): Promise<void | Error>;
  hook(hooks: IBrowserHooks): void;
}

export interface IBrowserEvents {
  close: void;
}
