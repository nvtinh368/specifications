import IExecJsPathResult from './IExecJsPathResult';
import IPoint from './IPoint';
import IElementRect from './IElementRect';
import INodePointer from './INodePointer';
import { IJsPath } from './IJsPath';

const getNodePointerFnName = '__getNodePointer__';
const getClientRectFnName = '__getClientRect__';
const getComputedVisibilityFnName = '__getComputedVisibility__';
const getComputedStyleFnName = '__getComputedStyle__';
const isFocusedFnName = '__isFocused__';
const getNodeIdFnName = '__getNodeId__';

export default interface IJsPathFunctions {
  getLastClientRect(nodeId: number): IElementRect;
  exec<T>(jsPath: IJsPath): Promise<IExecJsPathResult<T>>;
  reloadJsPath<T>(jsPath: IJsPath, containerOffset: IPoint): Promise<IExecJsPathResult<T>>;
  getSourceJsPath(nodePointer: INodePointer): IJsPath;
  getNodePointer<T>(jsPath: IJsPath, containerOffset?: IPoint): Promise<IExecJsPathResult<T>>;
  getNodePointerId(jsPath: IJsPath): Promise<number>;
  simulateOptionClick(jsPath: IJsPath): Promise<IExecJsPathResult<boolean>>;
}

export {
  getNodePointerFnName,
  getClientRectFnName,
  getNodeIdFnName,
  getComputedStyleFnName,
  isFocusedFnName,
  getComputedVisibilityFnName,
};
