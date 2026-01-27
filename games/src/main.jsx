import { createRoot } from 'react-dom/client'
import { useState, useEffect, StrictMode } from "react";

import './main.css'

import { MainMenu } from './main-menu/Scene';
import { GameUI } from './game/UI'
import Spinner from './other/Spinner'

function App() {
  const [animPlayStart, setAnimPlayStart] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [loading, setLoading] = useState(false);

  //transition
  useEffect(() => {
    if (animPlayStart) {
      const timer = setTimeout(() => {
        setShowGame(true);
      }, 2400);
      return () => clearTimeout(timer);
    } else {
      setShowGame(false);
    }
  }, [animPlayStart]);

  //loading
  useEffect(() => {
    if (showGame) {
      setLoading(true);

      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [showGame]);

  return (
    <StrictMode>
      <div className={`loadingScreen ${loading ? '' : 'hidden'} `} >
        <Spinner />
      </div>
      {!showGame && (
        <MainMenu
          animPlayStarted={animPlayStart}
          setAnimPlayStart={setAnimPlayStart}
        />
      )}
      {showGame && <GameUI />}
    </StrictMode>
  );
}

//* Render stuff *//
createRoot(document.getElementById('root')).render(<App />)