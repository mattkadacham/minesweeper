import {
  CSSProperties,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  MouseEvent,
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
    const unsubscribe = game.board.subscribe({
      name: id.current,
      update: setBoardState,
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
    game.uncover(cell.coords);
    onClick && onClick(cell);
  };

  const handleDoubleClick = () => {
    game.board.toggleCellMark(cell.coords);
  }

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
      onDoubleClick={handleDoubleClick}
      style={{ cursor: cell.uncovered ? "default" : "pointer", ...debugStyle }}
    >
      {cell.uncovered && cell.hasMine && <>💣</>}
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
    const { boardState } = useContext(MinesweeperContext);

    return (
        <span className="num-mines">{boardState.numMines}</span>
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
