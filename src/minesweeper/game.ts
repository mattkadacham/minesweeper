import { Board, GridCoords } from "./board";

export type GameState = "Win" | "Lose" | "InProgress";

export type Difficulty = "Easy" | "Medium" | "Hard" | "Custom";

export type GameSettings = {
  height: number;
  width: number;
  mineCount?: number;
  mineSpawnChance?: number;
  difficulty: Difficulty;
};

export class Minesweeper {
  board: Board;
  settings: GameSettings;

  constructor(board: Board, settings: GameSettings) {
    this.board = board;
    this.settings = settings;
  }

  newGame() {
    this.board.reset();
    this.generateMines();
    this.board.emit();
  }

  checkGameState(): GameState {
    const { numMines, uncovered, mineUncovered, flagged, flaggedCorrect } = this.board.stats();
    if (mineUncovered) return "Lose";
    const coveredCells = this.board.length - uncovered;
    if (numMines === coveredCells) {
      return "Win";
    }
    if (flagged === this.settings.mineCount && flaggedCorrect === this.settings.mineCount) {
      return "Win";
    }
    return "InProgress";
  }

  uncover([i, j]: GridCoords): void {
    const cell = this.board.get([i, j]);
    if (!cell || cell.uncovered || cell.flagged) {
      return;
    }

    cell.uncovered = true;
    cell.adjacentMines = this.calculateAdjacentMines([i, j]);
    this.board.emit();

    // flood fill algorithm to recursively uncover connected empty cells
    if (cell.adjacentMines === 0 && !cell.hasMine) {
      const directions: GridCoords[] = [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
      ];

      for (const direction of directions) {
        this.uncover([i + direction[0], j + direction[1]]);
      }
    }
  }

  generateMines(): void {
    if (this.settings.mineCount !== undefined) {
      this.generateMinesByCount(this.settings.mineCount);
    } else {
      const spawnChance = this.settings.mineSpawnChance || 0.3;
      this.generateMinesByProbability(spawnChance);
    }

    for (const cell of this.board) {
      cell.adjacentMines = this.calculateAdjacentMines(cell.coords);
    }
  }

  generateMinesByCount(mineCount: number): void {
    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
      const x = Math.floor(Math.random() * this.board.width);
      const y = Math.floor(Math.random() * this.board.height);
      const cell = this.board.get([x, y]);
      if (cell && !cell.hasMine) {
        cell.hasMine = true;
        minesPlaced++;
      }
    }
  }

  toggleCellMark([i, j]: GridCoords) {
    const cell = this.board.get([i, j]);
    if (!cell || cell.uncovered) {
      return;
    }

    cell.flagged = !cell.flagged;
    this.board.emit();
  }

  generateMinesByProbability(spawnChance: number): void {
    for (const cell of this.board) {
      const hasMine = Math.random() < spawnChance;
      cell.hasMine = hasMine;
    }
  }

  calculateAdjacentMines([i, j]: GridCoords): number {
    const adj: GridCoords[] = [
      [i - 1, j - 1],
      [i, j - 1],
      [i + 1, j - 1],
      [i - 1, j],
      [i + 1, j],
      [i - 1, j + 1],
      [i, j + 1],
      [i + 1, j + 1],
    ];

    let numMines = 0;

    for (const coords of adj) {
      const cell = this.board.get(coords);
      if (cell?.hasMine) {
        numMines++;
      }
    }

    return numMines;
  }
}
