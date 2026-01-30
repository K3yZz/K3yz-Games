import * as THREE from 'three'
import React, { useRef, useEffect } from 'react'

// import studio from '@theatre/studio'
// import extension from '@theatre/r3f/dist/extension'

// studio.initialize()
// studio.extend(extension)

//* Camera Sheet Setup *//
import { SheetProvider, PerspectiveCamera } from '@theatre/r3f'
import { getProject } from '@theatre/core'
import projectJson from '../data/MainMenu.theatre-project-state.json'

const project = getProject('MainMenu', { state: projectJson });
const sheet = project.sheet('camAnim');

//* camera stuff *//
import { useFrame } from '@react-three/fiber';

function Camera() {
  const cameraRef = useRef();
  const target = new THREE.Vector3(0, 0, 0);

  useFrame(() => {
    if (cameraRef.current) {
      cameraRef.current.lookAt(target);
    }
  });

  return (
    <PerspectiveCamera
      theatreKey="Camera"
      makeDefault
      position={[0, 0, -8]}
      ref={cameraRef}
    />
  );
}

//* Scene Lights *//
import { useHelper } from '@react-three/drei'

function Lights({ showLightDebug = false }) {
  const spotRef = React.useRef()

  useHelper(showLightDebug ? spotRef : null, THREE.SpotLightHelper)

  return (
    <>
      <ambientLight intensity={0.2} />
      <spotLight
        ref={spotRef}
        color={"blue"}
        intensity={1}
        position={[0, 0.5, 1]}
        penumbra={0.3}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
    </>
  )
}

//* Main Scene Component *//
import { Computer } from './Computer.jsx'
import { UI } from './UI.jsx'
import { Canvas } from '@react-three/fiber'

export function MainMenu({ }) {
  useEffect(() => {
    sheet.project.ready.then(() => {
      sheet.sequence.play({ range: [0, 3] });
    });
  }, []);


  return (
    <>
      <Canvas className='bg-white'>
        <SheetProvider sheet={sheet}>
          <Camera />
        </SheetProvider>

        <Computer />
        <Lights />
      </Canvas>
      <UI />
    </>
  )
}
