import { IJsPath } from './IJsPath';
import IExecJsPathResult from './IExecJsPathResult';

export default interface IJsPathResult {
  jsPath: IJsPath;
  result: IExecJsPathResult<any>;
  index: number;
}
