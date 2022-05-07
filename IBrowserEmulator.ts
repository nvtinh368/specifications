import { EmulatorTypes } from './IEmulatorTypes';
import IUserAgentOption, { IVersion } from './browser/IUserAgentOption';
import IDeviceProfile from './browser/IDeviceProfile';
import ILogger from './ILogger';
import IBrowserEngine from './browser/IBrowserEngine';
import IBrowserHooks, { IBrowserContextHooks } from './hooks/IBrowserHooks';
import INetworkHooks from './hooks/INetworkHooks';
import IViewport from './browser/IViewport';
import IGeolocation from './browser/IGeolocation';

export interface IBrowserEmulator extends IBrowserEmulatorMethods {
  id: string;

  browserName: string;
  browserVersion: IVersion;

  operatingSystemPlatform: string;
  operatingSystemName: string;
  operatingSystemVersion: IVersion;

  userAgentString: string;
  deviceProfile: IDeviceProfile;
}

export interface IBrowserEmulatorClass {
  id: string;
  type: typeof EmulatorTypes.BrowserEmulator;
  selectBrowserMeta(userAgentSelector: string): ISelectBrowserMeta;
  new (createOptions: IBrowserEmulatorCreateOptions): IBrowserEmulator;
}

export interface IBrowserEmulatorCreateOptions extends ISelectBrowserMeta {
  logger?: ILogger;
  deviceProfile?: IDeviceProfile;
}

export interface ISelectBrowserMeta {
  userAgentOption: IUserAgentOption;
  browserEngine: IBrowserEngine;
}

export interface IBrowserEmulatorMethods
  extends IBrowserHooks,
    IBrowserContextHooks,
    INetworkHooks {
  configure?(options: IBrowserEmulatorConfig): void;
}

export interface IBrowserEmulatorConfig {
  viewport?: IViewport;
  timezoneId?: string;
  locale?: string;
  upstreamProxyUrl?: string;
  upstreamProxyIpMask?: { publicIp?: string; proxyIp?: string; ipLookupService?: string };
  geolocation?: IGeolocation;
  dnsOverTlsProvider?: { host: string; servername: string; port?: number };
}

// decorator for browser emulator classes. hacky way to check the class implements statics we need
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function BrowserEmulatorClassDecorator(staticClass: IBrowserEmulatorClass): void {}
