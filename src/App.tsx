import { useMemo, useState } from "react";
import "./App.css";
import * as ms from "./minesweeper";
import * as ui from "./minesweeper-ui";

const gameSettings: ms.GameSettings = {
  ...ms.Presets.Easy,
  mineCount: 15
  // height: 10,
  // width: 10,
  // mineSpawnChance: 0.3
}

const createGame = () => {
  const g = new ms.Minesweeper(new ms.Board(gameSettings.height, gameSettings.width), gameSettings)
  g.newGame();
  return g;
}

function App() {
  const [gameState, setGameState] = useState<ms.GameState>('InProgress');
  const game = useMemo<ms.Minesweeper>(createGame, []);
  const boardState = ui.useBoardState(game);

  const handleCellClick = () => {
    const s = game.checkGameState();
    setGameState(s);
    game.board.emit();
  }

  const handleRestart = () => {
    setGameState('InProgress');
    game.newGame();
    game.board.emit();
  }

  return (
    <>
    <ui.Minesweeper game={game} boardState={boardState}>
      <ui.Header>
        <ui.RestartButton onClick={handleRestart} />
        <ui.NumMines />
        <ui.GameState state={gameState}/>
      </ui.Header>
      <ui.Grid>
        {boardState.grid.map((cell) => <ui.Cell onClick={handleCellClick} cell={cell} key={`${cell.coords[0]},${cell.coords[1]}`} />)}
      </ui.Grid>
    </ui.Minesweeper>
    </>
  );
}

export default App;
