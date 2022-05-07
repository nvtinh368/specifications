import { URL } from 'url';
import type ITypedEventEmitter from '@ulixee/commons/interfaces/ITypedEventEmitter';
import { ICookie } from './ICookie';
import { IPage } from './IPage';
import { IWorker } from './IWorker';
import IBrowser from './IBrowser';
import { IBrowserContextHooks, IInteractHooks } from './IHooks';

export default interface IBrowserContext extends ITypedEventEmitter<IBrowserContextEvents> {
  id: string;
  browserId: string;
  browser: IBrowser;
  isIncognito: boolean;
  pagesById: Map<string, IPage>;
  workersById: Map<string, IWorker>;
  defaultPageInitializationFn: (page: IPage) => Promise<any>;
  hooks: (IBrowserContextHooks | IInteractHooks)[];

  newPage(): Promise<IPage>;
  close(): Promise<void>;

  getCookies(url?: URL): Promise<ICookie[]>;
  addCookies(
    cookies: (Omit<ICookie, 'expires'> & { expires?: string | Date | number })[],
    origins?: string[],
  ): Promise<void>;

  hook(hooks: IBrowserContextHooks | IInteractHooks): void;
}

export interface IBrowserContextEvents {
  page: { page: IPage };
  worker: { worker: IWorker };
  close: void;
  'all-pages-closed': void;
}
