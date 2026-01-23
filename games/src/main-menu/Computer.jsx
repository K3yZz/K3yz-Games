import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const outerWidth = 2;
const outerHeight = 1.5;
const innerWidth = 1.6;
const innerHeight = 1.1;

//* Computer Components *//
function Frame(showVertices = false, hideMesh = false) {
  const ref = useRef();

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
      depth: 0.2,
      bevelEnabled: false,
    });
  }, [outerWidth, outerHeight, innerWidth, innerHeight]);

  return (
    <group ref={ref} position={[0, 0, 0]}>
      {hideMesh ? null :
        <mesh>
          <primitive object={frameGeometry} attach="geometry" />
          <meshStandardMaterial side={THREE.DoubleSide} />
        </mesh>
      }
      {showVertices === true &&
        <>
          <mesh>
            <primitive object={frameGeometry} attach="geometry" />
            <meshBasicMaterial color="black" wireframe />
          </mesh>
          <lineSegments>
            <edgesGeometry args={[frameGeometry]} />
            <lineBasicMaterial color="red" />
          </lineSegments>
        </>
      }
    </group>
  );
}

function Screen(showVertices = false, hideMesh = false) {
  const ref = useRef();

  //code stolen from the internet
  const CRT_shader = {
    uniforms: {
      tDiffuse: { value: null },
      time: { value: 0.0 },

      scanlineIntensity: { value: 0.35 },
      scanlineCount: { value: 900.0 },

      rgbShift: { value: 0.003 },
      noiseIntensity: { value: 0.04 },

      vignetteIntensity: { value: 0.75 },
      maskStrength: { value: 0.4 },
      jitterIntensity: { value: 0.002 }
    },

    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

    fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float time;

    uniform float scanlineIntensity;
    uniform float scanlineCount;
    uniform float rgbShift;
    uniform float noiseIntensity;
    uniform float vignetteIntensity;
    uniform float maskStrength;
    uniform float jitterIntensity;

    varying vec2 vUv;

    float rand(vec2 co) {
      return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453);
    }

    void main() {

      // Horizontal line jitter
      float jitter = (rand(vec2(vUv.y, time)) - 0.5) * jitterIntensity;
      vec2 uv = vUv + vec2(jitter, 0.0);

      // RGB chroma bleed
      float r = texture2D(tDiffuse, uv + vec2(rgbShift, 0.001)).r;
      float g = texture2D(tDiffuse, uv).g;
      float b = texture2D(tDiffuse, uv - vec2(rgbShift, 0.001)).b;
      vec3 color = vec3(r, g, b);

      // Scanlines (brightness modulation)
      float scan = sin(uv.y * scanlineCount) * 0.5 + 0.5;
      color *= mix(1.0, scan, scanlineIntensity);

      // Phosphor mask (RGB triads)
      float mask = mod(gl_FragCoord.x, 3.0);
      vec3 phosphor = vec3(
        mask == 0.0 ? 1.0 : 0.6,
        mask == 1.0 ? 1.0 : 0.6,
        mask == 2.0 ? 1.0 : 0.6
      );
      color *= mix(vec3(1.0), phosphor, maskStrength);

      // Temporal noise
      float noise = rand(uv * time * 60.0) - 0.5;
      color += noise * noiseIntensity;

      // Subtle global flicker
      color *= 0.97 + 0.03 * sin(time * 50.0);

      // Vignette
      float dist = distance(uv, vec2(0.5));
      color *= smoothstep(0.85, vignetteIntensity, dist);

      gl_FragColor = vec4(color, 1.0);
    }
  `
  };

  const video = useMemo(() => {
    const vid = document.createElement("video");
    vid.src = "/test.mp4";
    vid.crossOrigin = "anonymous";
    vid.loop = true;
    vid.muted = true;
    vid.playsInline = true;
    vid.autoplay = true;
    vid.play();
    return vid;
  }, []);

  const videoTexture = useMemo(() => {
    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBFormat;
    return texture;
  }, [video]);

  const CRTMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: CRT_shader.vertexShader,
      fragmentShader: CRT_shader.fragmentShader,
      uniforms: {
        ...CRT_shader.uniforms,
        tDiffuse: { value: videoTexture }
      },
      side: THREE.DoubleSide
    });
  }, [videoTexture]);


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
  }, []);


  return (
    <group ref={ref} position={[0, 0, 0]}>
      {hideMesh ? null :

        <mesh>
          <primitive object={screenGeometry} attach="geometry" side={THREE.DoubleSide} />
          <primitive object={CRTMaterial} attach="material" side={THREE.DoubleSide} />
        </mesh>
      }
      {showVertices === true &&
        <>
          <mesh>
            <primitive object={screenGeometry} attach="geometry" />
            <meshBasicMaterial color="black" wireframe />
          </mesh>
          <lineSegments>
            <edgesGeometry args={[screenGeometry]} />
            <lineBasicMaterial color="red" />
          </lineSegments>
        </>
      }
    </group>
  );

}

function Case(showVertices = false, hideMesh = false) {
  const caseGeometry = useMemo(() => {
    // Top part
    const topShape = new THREE.Shape();
    topShape.moveTo(-0.9, -1)
      .lineTo(0.9, -1)
      .lineTo(0.6, 0.2)
      .lineTo(-0.6, 0.2)
      .closePath();

    const geoTop = new THREE.ExtrudeGeometry(topShape, {
      depth: 1.1,
      bevelEnabled: false
    });
    geoTop.rotateX(Math.PI / 2);
    geoTop.computeVertexNormals();

    // Bottom part
    const bottomShape = new THREE.Shape();
    bottomShape.moveTo(-0.9, -1)
      .lineTo(0.9, -1)
      .lineTo(0.6, -0.05)
      .lineTo(-0.6, -0.05)
      .closePath();

    const geoBottom = new THREE.ExtrudeGeometry(bottomShape, {
      depth: 0.4,
      bevelEnabled: false
    });
    geoBottom.rotateX(Math.PI / 2);
    geoBottom.computeVertexNormals();
    geoBottom.translate(0, -1.1, 0);

    return mergeGeometries([geoTop, geoBottom]);
  }, []);

  const caseMaterial = new THREE.MeshStandardMaterial({
    color: 0xd9d9d9,
    metalness: 0.1,
    roughness: 0.7,
  });

  return (
    <group position={[0, 0.65, 1.2]}>
      {hideMesh ? null :
        <mesh geometry={caseGeometry} >
          <primitive object={caseMaterial} attach="material" />
        </mesh>
      }
      {showVertices && (
        <>
          {/* Wireframe overlay */}
          <mesh geometry={caseGeometry}>
            <meshBasicMaterial wireframe color="black" />
          </mesh>

          {/* Edge lines */}
          <lineSegments>
            <edgesGeometry args={[caseGeometry]} />
            <lineBasicMaterial color="red" />
          </lineSegments>
        </>
      )}
    </group>
  );
}

//* Group the computer components *//

export function Computer() {
  return (
    <group>
      {Frame()}
      {Case()}
      {Screen()}
    </group>
  )
}
