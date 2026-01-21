import { createRoot } from 'react-dom/client'
import { useRef, useState, useMemo, useEffect, StrictMode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useHelper, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

import './main.css'

const showDebug = false;
const showVertices = true;

function Computer() {
  const ref = useRef();

  const outerWidth = 2;
  const outerHeight = 1.5;
  const innerWidth = 1.6;
  const innerHeight = 1.1;
  const depth = 0.2;

  const frameGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const hole = new THREE.Path();

    // Outer rectangle
    shape.moveTo(-outerWidth / 2, -outerHeight / 2);
    shape.lineTo(outerWidth / 2, -outerHeight / 2);
    shape.lineTo(outerWidth / 2, outerHeight / 2);
    shape.lineTo(-outerWidth / 2, outerHeight / 2);
    shape.lineTo(-outerWidth / 2, -outerHeight / 2);

    // Inner rectangle (hole)
    hole.moveTo(-innerWidth / 2, -innerHeight / 2);
    hole.lineTo(-innerWidth / 2, innerHeight / 2);
    hole.lineTo(innerWidth / 2, innerHeight / 2);
    hole.lineTo(innerWidth / 2, -innerHeight / 2);
    hole.lineTo(-innerWidth / 2, -innerHeight / 2);

    shape.holes.push(hole);

    return new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: false,
    });
  }, [outerWidth, outerHeight, innerWidth, innerHeight, depth]);

  const screenGeometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(innerWidth, innerHeight, 64, 64);
    const positionAttr = geom.attributes.position;

    const curvature = 0.2;

    for (let i = 0; i < positionAttr.count; i++) {
      const x = positionAttr.getX(i);
      const y = positionAttr.getY(i);
      const z = curvature * (x * x + y * y);
      positionAttr.setZ(i, z);
    }

    geom.computeVertexNormals();
    return geom;
  }, [innerWidth, innerHeight]);

  function frame() {
    // return frame
    return (
      <group ref={ref} position={[0, 0, 0]}>
        {/* Solid frame */}
        <mesh ref={ref} position={[0, 0, 0]}>
          <primitive object={frameGeometry} attach="geometry" />
          <meshStandardMaterial color="gray" side={THREE.DoubleSide} />
        </mesh>
        {showVertices &&
          <>
            {/* Wireframe overlay */}
            < mesh position={[0, 0, 0]}>
              <primitive object={frameGeometry} attach="geometry" />
              <meshBasicMaterial color="black" wireframe />
            </mesh>

            {/* Edge lines */}
            <lineSegments position={[0, 0, 0]}>
              <edgesGeometry args={[frameGeometry]} />
              <lineBasicMaterial color="red" />
            </lineSegments>
          </>
        }
      </group >
    );
  }

  function screen() {
    //return screen
    return (
      <group ref={ref} position={[0, 0, 0]}>
        {/* Inner plane */}
        <mesh position={[0, 0, depth / 2 - 0.15]}>
          <primitive object={screenGeometry} />
          <meshStandardMaterial color="blue" side={THREE.DoubleSide} />
        </mesh>
        {showVertices &&
          <>
            {/* Wireframe overlay */}
            < mesh position={[0, 0, 0]}>
              <primitive object={screenGeometry} />
              <meshBasicMaterial color="black" wireframe />
            </mesh>

            {/* Edge lines */}
            <lineSegments position={[0, 0, 0]}>
              <edgesGeometry args={[screenGeometry]} />
              <lineBasicMaterial color="blue" />
            </lineSegments>
          </>
        }
      </group >
    );
  }

  return (
    <group>
      {frame()}
      {screen()}
    </group>
  )
}

function Lights() {
  const spotRef = useRef()
  const pointRef = useRef()

  if (showDebug) {
    useHelper(spotRef, THREE.SpotLightHelper)
    useHelper(pointRef, THREE.PointLightHelper, 0.5)
  }

  return (
    <>
      <ambientLight intensity={Math.PI / 2} />

      <spotLight
        ref={spotRef}
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI}
      />

      <pointLight
        ref={pointRef}
        position={[-10, -10, -10]}
        decay={0}
        intensity={Math.PI}
      />
    </>
  )
}

function Camera() {
  return (
    <>
      <OrbitControls />
      {showDebug &&
        <>
          {/* <axesHelper args={[5]} />
      <gridHelper args={[10, 10]} /> */}
        </>
      }
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Canvas className='bg-gray-600'>
      <Lights />
      <Camera />
      <Computer />
    </Canvas>
  </StrictMode>
)