import { Scenes } from 'telegraf';

export interface Context extends Scenes.SceneContext {
  match?: RegExpExecArray;
}