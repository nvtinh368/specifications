import IDeviceProfile from './browser/IDeviceProfile';
import { EmulatorTypes } from './IEmulatorTypes';
import ILogger from './ILogger';
import IInteractHooks from "./hooks/IInteractHooks";

export interface IHumanEmulator extends IHumanEmulatorMethods {
  id: string;
}

export interface IHumanEmulatorClass {
  id: string;
  type: typeof EmulatorTypes.HumanEmulator;
  new (createOptions: IHumanEmulatorCreateOptions): IHumanEmulator;
}

export interface IHumanEmulatorCreateOptions {
  deviceProfile?: IDeviceProfile;
  logger?: ILogger;
}

export interface IHumanEmulatorMethods extends IInteractHooks {}

// decorator for human emulator classes. hacky way to check the class implements statics we need
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function HumanEmulatorClassDecorator(staticClass: IHumanEmulatorClass): void {}
