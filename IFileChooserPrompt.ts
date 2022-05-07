import { IJsPath } from './IJsPath';

export default interface IFileChooserPrompt {
  frameId: number;
  selectMultiple: boolean;
  jsPath: IJsPath;
}
