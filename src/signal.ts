export {};

declare global {
  type settingsNames = 'spies' | 'players' | 'time';
  type settings = Record<settingsNames, number>;
  interface AlwatrSignals {
    readonly 'hide-navigation': boolean;
    readonly 'game-settings': settings | undefined;
    readonly 'game-words': string[];
  }
}
