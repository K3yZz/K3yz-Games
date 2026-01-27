import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree, Canvas } from '@react-three/fiber'
import { useHelper } from '@react-three/drei'
import * as THREE from 'three'

const showLightDebug = false;

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
/**
 * @param {THREE.Camera} cam - the camera to animate
 * @param {number} elapsed - time since animation started
 * @param {Object} options - configuration
 *   options.startPos: THREE.Vector3 - start position
 *   options.endPos: THREE.Vector3 - end position
 *   options.startFov: number - starting FOV
 *   options.endFov: number - ending FOV
 *   options.duration: number - total duration in seconds
 */

export function animateCamera(cam, elapsed, options) {
  const { startPos, endPos, startFov, endFov, duration } = options;

  const t = THREE.MathUtils.clamp(elapsed / duration, 0, 1);
  const smoothT = THREE.MathUtils.smootherstep(t, 0, 1);

  if (startPos && endPos) {
    cam.position.lerpVectors(startPos, endPos, smoothT);
  }

  if (startFov !== undefined && endFov !== undefined) {
    cam.fov = THREE.MathUtils.lerp(startFov, endFov, smoothT);
    cam.updateProjectionMatrix();
  }

  cam.lookAt(0, 0, 0);
}

function Camera({ animPlayStarted }) {
  const { set } = useThree();
  const cameraRef = useRef();

  const cam = useMemo(() => {
    const c = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    c.position.set(0, 0, -8);
    c.lookAt(0, 0, 0);
    return c;
  }, []);

  useEffect(() => {
    set({ camera: cam });
  }, [set, cam]);

  const playStartTimeRef = useRef(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    if (!animPlayStarted) {
      // Title animation
      animateCamera(cam, elapsed, {
        startPos: new THREE.Vector3(0, 0, -10),
        endPos: new THREE.Vector3(0, 0, -3),
        duration: 3,
      });
    } else {
      if (playStartTimeRef.current === null) {
        playStartTimeRef.current = elapsed;
      }

      const playElapsed = elapsed - playStartTimeRef.current;

      animateCamera(cam, playElapsed, {
        startPos: new THREE.Vector3(0, 0, -3),
        endPos: new THREE.Vector3(0, 0, 0),
        startFov: 45,
        endFov: 100,
        duration: 3
      });
    }
  });

  return <primitive ref={cameraRef} object={cam} />;
}

//* Main Scene Component *//
import { Computer } from './Computer.jsx'
import { UI } from './UI.jsx'

export function MainMenu({ animPlayStarted, setAnimPlayStart }) {
  return (
    <>
      <Canvas className='bg-white'>
        <Computer />
        <Lights />
        <Camera animPlayStarted={animPlayStarted} />
      </Canvas>
      <UI setAnimPlayStart={setAnimPlayStart} />
    </>
  );
}

