import { GameSettings } from ".";

const Easy: GameSettings = {
  height: 9,
  width: 9,
  mineCount: 10,
};

const Medium: GameSettings = {
  height: 16,
  width: 16,
  mineCount: 40,
};

const Hard: GameSettings = {
  height: 16,
  width: 30,
  mineCount: 99,
};

export const Presets = {
  Easy,
  Medium,
  Hard,
};
