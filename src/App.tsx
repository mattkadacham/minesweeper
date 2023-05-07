import { useState } from "react";
import "./App.css";
import * as ms from "./minesweeper";
import * as ui from "./minesweeper-ui";

const createGame = (settings: ms.GameSettings) => {
  const g = new ms.Minesweeper(new ms.Board(settings.height, settings.width), settings);
  g.newGame();
  return g;
}

function App() {
  const [gameState, setGameState] = useState<ms.GameState>('InProgress');
  const [settings, setSettings] = useState<ms.GameSettings>(ms.Presets.Easy);
  const [game, setGame] = useState(createGame(settings));
  const [clickMode, setClickMode] = useState<'Uncover' | 'Mark'>('Uncover');
  const boardState = ui.useBoardState(game);

  const handleCellClick = (cell: ms.Cell) => {
    if (clickMode === 'Uncover') {
      game.uncover(cell.coords);
    } else {
      game.toggleCellMark(cell.coords);
    }
    game.board.emit();
    const s = game.checkGameState();
    setGameState(s);
    game.board.emit();
  }

  const newGame = () => {
    const g = createGame(settings)
    g.newGame()
    console.log('new game', g);
    g.board.emit();
    setGame(g);
  };

  const handleRestart = () => {
    setGameState('InProgress');
    newGame();
  }

  const toggleClickMode = () => {
    if (clickMode === "Uncover") {
      setClickMode("Mark");
      return;
    }

    setClickMode("Uncover");
  }

  return (
    <>
      <ui.Minesweeper game={game} boardState={boardState}>
        <ui.Header>
          <ui.RestartButton onClick={handleRestart} />
          <ui.NumMines />
          <ui.GameState state={gameState} />
          <ui.ClickMode mode={clickMode} onClick={toggleClickMode} />
        </ui.Header>
        <ui.Grid>
          {boardState.grid.map((cell) => <ui.Cell onClick={handleCellClick} cell={cell} key={`${cell.coords[0]},${cell.coords[1]}`} />)}
        </ui.Grid>
        <ui.GameConfig settings={settings} onChange={setSettings} onNewGameClick={newGame} />
      </ui.Minesweeper>
    </>
  );
}

export default App;
