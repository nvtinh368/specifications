import { IPathStep } from './IJsPath';

export interface IJsPathError {
  error: string;
  pathState: {
    step: IPathStep;
    index: number;
    querySelectorMatches?: number[];
  };
}
