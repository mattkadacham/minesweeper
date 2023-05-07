import { GameSettings } from ".";

const Easy: GameSettings = {
  height: 9,
  width: 9,
  mineCount: 10,
  difficulty: "Easy",
};

const Medium: GameSettings = {
  height: 16,
  width: 16,
  mineCount: 40,
  difficulty: "Medium",
};

const Hard: GameSettings = {
  height: 16,
  width: 30,
  mineCount: 99,
  difficulty: "Hard",
};

export const Presets = {
  Easy,
  Medium,
  Hard,
};
