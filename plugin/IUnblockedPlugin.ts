import { IHooksProvider } from '../agent/hooks/IHooks';
import IEmulationProfile from './IEmulationProfile';

export default interface IUnblockedPlugin<T = any> extends IHooksProvider {
  configure?(emulationProfile: IEmulationProfile<T>): void | Promise<void>;
}

export interface IUnblockedPluginClass<T = any> {
  shouldActivate?(emulationProfile: IEmulationProfile<T>): boolean;
  new (emulationProfile?: IEmulationProfile<T>): IUnblockedPlugin<T>;
}


// decorator for browser emulator classes. hacky way to check the class implements statics we need
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function UnblockedPluginClassDecorator(staticClass: IUnblockedPluginClass): void {}
