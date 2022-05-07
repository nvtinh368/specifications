import INodePointer from './INodePointer';
import { IJsPathError } from './IJsPathError';

export default interface IExecJsPathResult<T = any> {
  value: T;
  isValueSerialized?: boolean;
  pathError?: IJsPathError;
  nodePointer?: INodePointer;
}
