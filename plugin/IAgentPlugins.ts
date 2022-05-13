import IAgentPlugin from './IAgentPlugin';

export default interface IAgentPlugins extends Required<IAgentPlugin> {
  hook(plugin: IAgentPlugin): void;
}
