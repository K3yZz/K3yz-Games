import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useHelper } from '@react-three/drei'
import * as THREE from 'three'

const showLightDebug = true;
const showCameraDebug = true;
const showFloorDebug = false;

//* Scene Stuff *//
function Lights() {
  const spotRef = useRef()
  const spotRef2 = useRef()

  if (showLightDebug === true) {
    useHelper(spotRef, THREE.SpotLightHelper)
    useHelper(spotRef2, THREE.SpotLightHelper)
  }

  return (
    <>
      <ambientLight intensity={0.2} />

      {/* computer light */}
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

//* Camera Setup *//

//Triggers on website open
function useZoomOnLaunch(camera, duration = 3) {
  const startTime = useRef(null);
  const hasStarted = useRef(false);

  useFrame(({ clock }) => {
    if (!camera || hasStarted.current) return;

    if (startTime.current === null) {
      startTime.current = clock.getElapsedTime();
    }

    const elapsed = clock.getElapsedTime() - startTime.current;
    let t = Math.min(elapsed / duration, 1);

    // Ease-out cubic
    t = 1 - Math.pow(1 - t, 3);

    const startPos = new THREE.Vector3(0, 0, -5);
    const endPos = new THREE.Vector3(0, -0.25, -1.5);

    camera.position.lerpVectors(startPos, endPos, t);

    if (t >= 1) {
      hasStarted.current = true;
    }
  });
}

//triggers on start button pressed
function useZoomOnStart(camera, playClicked, duration = 1) {
  const startTime = useRef(null);
  const hasPlayed = useRef(false);

  const startPos = useMemo(() => new THREE.Vector3(0, -0.25, -1.5), []);
  const endPos = useMemo(() => new THREE.Vector3(0, 1, 0.5), []);

  useFrame(({ clock }) => {
    if (!camera || !playClicked || hasPlayed.current) return;

    if (startTime.current === null) {
      startTime.current = clock.getElapsedTime();
    }

    const elapsed = clock.getElapsedTime() - startTime.current;
    let t = Math.min(elapsed / duration, 1);

    // Ease-out cubic
    t = 1 - Math.pow(1 - t, 3);

    camera.position.lerpVectors(startPos, endPos, t);

    if (t >= 1) {
      hasPlayed.current = true;
    }
  });
}

function Camera({ playClicked }) {
  const { set } = useThree()
  const cameraRef = useRef()

  // Create camera once
  useEffect(() => {
    const cam = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
    cam.position.set(0, 0, -5)
    cameraRef.current = cam

    set({ camera: cam }) // set as default

    return () => {
      cameraRef.current = null
    }
  }, [set])

  const camera = cameraRef.current

  // Camera helper
  const helper = useMemo(() => camera && new THREE.CameraHelper(camera), [camera])

  // Zoom hooks wrapped in effect to avoid conditional hook call
  useEffect(() => {
    if (!camera) return

    useZoomOnLaunch(camera)
    useZoomOnStart(camera, playClicked)
  }, [camera, playClicked])

  return (
    <>
      {camera && <primitive object={camera} />}
      {showCameraDebug && camera && <primitive object={helper} />}
      {showFloorDebug && <>
        <axesHelper args={[5]} />
        <gridHelper args={[10, 10]} />
      </>}
    </>
  )
}

//* Main Scene Component *//
export function Scene({ playClicked }) {
  return (
    <>
      <Lights />
      <Camera playClicked={playClicked} />
    </>
  );
}
