export declare type IJsPath = IPathStep[];
export declare type IPathStep = IPropertyName | IMethod | INodeId;
declare type IPropertyName = string;
declare type IMethod = [IMethodName, ...IMethodArgs];
declare type IMethodName = string;
declare type IMethodArgs = any[];
declare type INodeId = number;
