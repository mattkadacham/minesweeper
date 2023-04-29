export type Cell = {
  hasMine: boolean;
  adjacentMines: number;
  uncovered: boolean;
  flagged: boolean;
  coords: GridCoords;
};

export type GridCoords = [number, number];

export type GameSettings = {
  height: number;
  width: number;
  mineCount?: number;
  mineSpawnChance?: number;
};

type Subscribable = {
  subscribe: (s: Subscription) => void;
  emit: () => void;
};

function createCell(coords: GridCoords, hasMine?: boolean): Cell {
  return {
    hasMine: !!hasMine,
    adjacentMines: 0,
    uncovered: false,
    flagged: false,
    coords,
  };
}

export type BoardState = {
  grid: Cell[];
  numMines: number;
  size: {
    height: number;
    width: number;
  };
};

type Subscription = {
  name: string;
  update: (data: BoardState) => void;
};

export class Board implements Iterable<Cell>, Subscribable {
  height: number;
  width: number;
  length: number;
  private subscribers: Subscription[];
  private grid: Cell[];

  constructor(height = 20, width = 20) {
    this.height = height;
    this.width = width;
    this.grid = this.emptyGrid();
    this.subscribers = [];
    this.length = this.height * this.width;
  }

  private emptyGrid(): Cell[] {
    const a = Array(this.height * this.width);
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        a[this.toIndex([i, j])] = createCell([i, j]);
      }
    }

    return a;
  }

  private numMines() {
    return this.grid.filter((i) => i.hasMine).length;
  }

  toggleCellMark([i, j]: GridCoords) {
    const cell = this.get([i, j]);
    if (!cell || cell.uncovered) {
      return;
    }

    cell.flagged = !cell.flagged;
    this.emit();
  }

  getState(): BoardState {
    return {
      grid: [...this.grid],
      numMines: this.numMines(),
      size: {
        height: this.height,
        width: this.width,
      },
    };
  }

  subscribe(s: Subscription) {
    if (!this.subscribers.find((i) => i.name === s.name)) {
      this.subscribers.push(s);
    }

    return () => {
      this.subscribers = this.subscribers.filter((i) => i.name !== s.name);
    };
  }

  emit() {
    for (const subscription of this.subscribers) {
      subscription.update(this.getState());
    }
  }

  reset() {
    this.grid = this.emptyGrid();
  }

  [Symbol.iterator](): Iterator<Cell, unknown, undefined> {
    let curIdx = 0;
    return {
      next: () => {
        const res = {
          done: curIdx === this.grid.length,
          value: this.grid[curIdx],
        };
        curIdx++;
        return res;
      },
    };
  }

  map<T>(func: (cell: Cell) => T) {
    return this.grid.map(func);
  }

  stats() {
    let numMines = 0;
    let uncovered = 0;
    let mineUncovered = false;
    for (const cell of this.grid) {
      numMines += cell.hasMine ? 1 : 0;
      uncovered += cell.uncovered ? 1 : 0;
      if (cell.uncovered && cell.hasMine) {
        mineUncovered = true;
      }
    }

    return {
      numMines,
      uncovered,
      mineUncovered,
    };
  }

  private toIndex([i, j]: GridCoords) {
    return i * this.width + j;
  }

  exists([i, j]: GridCoords): boolean {
    return i >= 0 && i < this.width && j >= 0 && j < this.height;
  }

  get(c: GridCoords): Cell | undefined {
    if (!this.exists(c)) {
      return;
    }
    return this.grid[this.toIndex(c)];
  }

  set(cell: Cell, c: GridCoords) {
    this.grid[this.toIndex(c)] = cell;
  }
}
