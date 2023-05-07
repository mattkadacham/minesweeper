import {
  CSSProperties,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as ms from "./minesweeper";

type MSContext = {
  boardState: ms.BoardState;
  debug?: boolean;
  game: ms.Minesweeper;
};

const MinesweeperContext = createContext<MSContext>({
  game: null,
  boardState: null,
  debug: false,
} as never);

export const useBoardState = (game: ms.Minesweeper): ms.BoardState => {
  const [boardState, setBoardState] = useState<ms.BoardState>(
    game?.board?.getState()
  );
  const id = useRef(`{Math.floor(Math.random() * 10000)}`);

  useEffect(() => {
    game.board.clearSubscriptions();
    setBoardState(game.board.getState());

    const unsubscribe = game.board.subscribe({
      name: id.current,
      update: (state) => {
        console.log('update', state);
        setBoardState(state);
      }
    });

    return unsubscribe;
  }, [game]);

  return boardState;
};

export function Minesweeper(props: {
  game: ms.Minesweeper;
  boardState: ms.BoardState;
  debug?: boolean;
  children: ReactNode;
}) {

  return (
    <MinesweeperContext.Provider
      value={{ game: props.game, boardState: props.boardState, debug: !!props.debug }}
    >
      {props.children}
    </MinesweeperContext.Provider>
  );
}

export function Grid({ children }: { children: ReactNode }) {
  const { boardState } = useContext(MinesweeperContext);
  return (
    <div
      className="game-container"
      style={{
        display: "grid",
        gridTemplateRows: `repeat(${boardState?.size?.height || 0}, 1fr)`,
        gridTemplateColumns: `repeat(${boardState?.size?.width || 0}, 1fr)`,
      }}
    >
      {children}
    </div>
  );
}

export function Cell({
  cell,
  onClick,
}: {
  cell: ms.Cell;
  onClick?: (cell: ms.Cell) => void;
}) {
  const { game, debug } = useContext(MinesweeperContext);

  const handleClick = () => {
    if (game.checkGameState() !== 'InProgress') {
      return;
    }
    onClick && onClick(cell);
  };
  const debugStyle: CSSProperties =
    debug && cell.hasMine
      ? {
        backgroundColor: "red",
      }
      : {};

  return (
    <div
      className={"game-cell" + (cell.uncovered ? " uncovered" : "")}
      onClick={handleClick}
      style={{ cursor: cell.uncovered ? "default" : "pointer", ...debugStyle }}
    >
      {cell.uncovered && cell.hasMine && <>💣</>}
      {!cell.uncovered && cell.flagged && <>🚩</>}
      {cell.uncovered && !cell.hasMine && (
        <AdjacentMineText num={cell.adjacentMines} />
      )}
    </div>
  );
}

// index is the number of mines
const adjacentMineColors = [
  "", // 0 has no color
  "#5C9BA5", // blue
  "#A1B05C", // green
  "#C35C5C", // red
  "#5C66A1", // indigo
  "#A15C8D", // purple
  "#5C8DA1", // teal
  "#A1765C", // brown
  "#7A5CA1", // violet
];

export function AdjacentMineText({ num }: { num: number }) {
  const color = useMemo(() => adjacentMineColors[num], [num]);

  return <span style={{ color }}>{num || ""}</span>;
}

export function Header(props: { children: ReactNode }) {
  return <div className="header">{props.children}</div>;
}

export function RestartButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="restart" onClick={onClick}>
      Restart
    </button>
  );
}

export function NumMines() {
  const { boardState, game } = useContext(MinesweeperContext);

  return (
    <span className="num-mines">{boardState.numMines - game.board.stats().flagged}</span>
  )
}

export function GameState({ state }: { state: ms.GameState }) {
  switch (state) {
    case "Win":
      return <>😄</>;

    case "Lose":
      return <>😓</>;
    case "InProgress":
      return <>🙂</>;
  }
}

export function ClickMode({ mode, onClick }: { mode: "Uncover" | "Mark", onClick: () => void }) {
  return <button onClick={onClick} title={`Click mode - ${mode}`}>{mode === "Uncover" ? "⛏️" : "🚩"}</button>
}


export function GameConfig({ settings, onChange, onNewGameClick }: { settings: ms.GameSettings, onChange: (settings: ms.GameSettings) => void, onNewGameClick: () => void }) {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ ...settings, [name]: value });
  }

  const handleDifficultySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    if (value === "Custom") {
      return onChange({ ...settings, difficulty: value });
    }
    const preset = ms.Presets[value as keyof typeof ms.Presets];
    onChange({ ...preset });
  }

  if (!settings) return <></>;

  return (
    <div className="game-settings">
      <div className="game-settings-row">
        <div className="game-settings-label">Width</div>
        <div className="game-settings-value">
          <input name="width" type="number" value={settings.width} onChange={handleChange} />
        </div>
      </div>
      <div className="game-settings-row">
        <div className="game-settings-label">Height</div>
        <div className="game-settings-value">
          <input name="height" type="number" value={settings.height} onChange={handleChange} />
        </div>
      </div>
      <div className="game-settings-row">
        <div className="game-settings-label">Mines</div>
        <div className="game-settings-value">
          <input name="mineCount" type="number" value={settings.mineCount} onChange={handleChange} />
        </div>
      </div>
      <div className="game-settings-row">
        <div className="game-settings-label">Difficulty</div>
        <div className="game-settings-value">
          <select name="difficulty" onChange={handleDifficultySelect} value={settings.difficulty}>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
            <option value="Custom">Custom</option>
          </select>
        </div>
      </div>
      <button onClick={onNewGameClick}>New Game</button>
    </div>
  )
}