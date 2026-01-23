import { createRoot } from 'react-dom/client'
import { StrictMode, useState } from 'react'
import { Canvas } from '@react-three/fiber'

import './main.css'

import { Computer } from './main-menu/Computer.jsx'
import { Scene } from './main-menu/Scene.jsx'
import { UI } from './main-menu/UI.jsx'

function App() {
  const [playClicked, setPlayClicked] = useState(false);

  const handlePlayClick = () => {
    setPlayClicked(true);
  };

  return (
    <StrictMode>
      <Canvas className='bg-white'>
        <Computer />
        <Scene playClicked={playClicked} />
      </Canvas>
      <UI onPlayClick={handlePlayClick} />
    </StrictMode>
  );
}

//* Render stuff *//
createRoot(document.getElementById('root')).render(<App />)