import { URL } from 'url';
import { IInteractionGroups, IInteractionStep } from './IInteractions';
import IInteractionsHelper from './IInteractionsHelper';
import IPoint from './IPoint';
import IDnsSettings from './IDnsSettings';
import ITcpSettings from './ITcpSettings';
import ITlsSettings from './ITlsSettings';
import IHttpResourceLoadDetails from './IHttpResourceLoadDetails';
import { IPage } from './IPage';
import { IWorker } from './IWorker';
import IHttp2ConnectSettings from './IHttp2ConnectSettings';
import IDevtoolsSession from './IDevtoolsSession';
import IHttpSocketAgent from './IHttpSocketAgent';
import IBrowserContext from './IBrowserContext';
import IBrowserLaunchArgs from './IBrowserLaunchArgs';
import IBrowser from './IBrowser';

export type IHooksProvider = IInteractHooks & IBrowserHooks & IBrowserContextHooks & INetworkHooks;

export interface IInteractHooks {
  playInteractions?(
    interactions: IInteractionGroups,
    runFn: (interaction: IInteractionStep) => Promise<void>,
    helper?: IInteractionsHelper,
  ): Promise<void>;

  beforeEachInteractionStep?(
    interactionStep: IInteractionStep,
    isMouseCommand: boolean,
  ): Promise<void> | void;
  afterInteractionGroups?(): Promise<void> | void;

  adjustStartingMousePoint?(point: IPoint, helper?: IInteractionsHelper): Promise<void> | void;
}

export interface IBrowserHooks {
  onNewBrowser?(browser: IBrowser, options: IBrowserLaunchArgs): void;
  onNewBrowserContext?(context: IBrowserContext): Promise<any>;
  onDevtoolsPanelAttached?(devtoolsSession: IDevtoolsSession): Promise<any>;
}

export interface IBrowserContextHooks {
  onNewPage?(page: IPage): Promise<any>;
  onNewWorker?(worker: IWorker): Promise<any>;

  onDevtoolsPanelAttached?(devtoolsSession: IDevtoolsSession): Promise<any>;
  onDevtoolsPanelDetached?(devtoolsSession: IDevtoolsSession): Promise<any>;
}

export interface INetworkHooks {
  onDnsConfiguration?(settings: IDnsSettings): void;

  onTcpConfiguration?(settings: ITcpSettings): void;

  onTlsConfiguration?(settings: ITlsSettings): void;

  onHttpAgentInitialized?(agent: IHttpSocketAgent): Promise<any> | void;

  onHttp2SessionConnect?(
    request: IHttpResourceLoadDetails,
    settings: IHttp2ConnectSettings,
  ): Promise<any> | void;

  beforeHttpRequest?(request: IHttpResourceLoadDetails): Promise<any> | void;
  beforeHttpResponse?(resource: IHttpResourceLoadDetails): Promise<any> | void;
  websiteHasFirstPartyInteraction?(url: URL): Promise<any> | void; // needed for implementing first-party cookies
}
