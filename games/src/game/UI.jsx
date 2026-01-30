import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Pixelation } from '@react-three/postprocessing';
import CRTEffect from 'vault66-crt-effect';
import 'vault66-crt-effect/dist/vault66-crt-effect.css';

const TEXT_CONTENT = [
    "K3yzBIOS 1.0 Release 1.0",
    "Copyright 1989-2000 K3yz Technologies Ltd.",
    ".",
    "BIOS version 29.3",
    "System ID = 1024580",
    "Build Time = 09/7/05 03:09:52",
    ".",
    "CPU = 1990s 486/Pentium (25-100 MHz)",
    "GPU = Integrated graphics (Intel HD/UHD)",
    "RAM = SDRAM 1GB",
    "",
    "Running with Windows 96",
    "initializing...",
    ".",
    ".",
    ".",
    "",
    "-Completed-",
    "executing..."
];

function BootScreen({ onComplete }) {
    const [visibleLines, setVisibleLines] = useState([]);
    const timeoutRef = useRef(null);
    const completedRef = useRef(false);

    useEffect(() => {
        let index = 0;

        const drawNextLine = () => {
            if (index >= TEXT_CONTENT.length) {
                if (!completedRef.current) {
                    completedRef.current = true;
                    onComplete(true);
                }
                return;
            }

            setVisibleLines(prev => [...prev, TEXT_CONTENT[index]]);
            index++;

            const delay = Math.floor(Math.random() * 300) + 200;
            timeoutRef.current = setTimeout(drawNextLine, delay);
        };

        timeoutRef.current = setTimeout(drawNextLine, 1000);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [onComplete]);

    return (
        <div className="bg-black h-screen w-screen p-4 font-[AtariClassic] text-gray-600 text-sm">
            {visibleLines.map((line, i) => (
                <div key={i}>{line}</div>
            ))}
        </div>
    );
}

function SplashScreen({ onComplete }) {
    function Finalizing() {
        return (
            <motion.p
                className="text-xl text-white flex font-[AtariClassic]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
            >
                Finalizing
                {[0, 1, 2].map((i) => (
                    <motion.span
                        key={i}
                        className="ml-1"
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.3,
                        }}
                    >
                        .
                    </motion.span>
                ))}
            </motion.p>
        );
    }

    function SpinningCube() {
        const ref = useRef()

        useFrame((_, delta) => {
            ref.current.rotation.x += delta
            ref.current.rotation.y += delta
        })

        return (
            <mesh ref={ref}>
                <boxGeometry args={[3, 3, 3]} />
                <meshStandardMaterial color="red" />
            </mesh>
        )
    }

    function Scene() {
        return (
            <Canvas camera={{ position: [3, 3, 3] }}>
                <ambientLight intensity={0.4} />
                <directionalLight position={[5, 5, 5]} />
                <SpinningCube />
                <EffectComposer>
                    <Pixelation
                        granularity={5}
                    />
                </EffectComposer>
            </Canvas>
        )
    }

    useEffect(() => {
        const t = setTimeout(() => {
            onComplete();
        }, 3000);

        return () => clearTimeout(t);
    }, [onComplete]);

    return (
        <div>
            <div className="bg-blue-900 h-screen w-screen flex flex-col items-center justify-center">
                <motion.h1 className="text-3xl font-[AtariClassic] text-white" initial={{ opacity: 0 }} transition={{ delay: 0.5 }} animate={{ opacity: 1 }}>K3yzOS</motion.h1>
                <div className="w-32 h-32">
                    <Scene />
                </div>
                <Finalizing />
            </div>
        </div>
    )
}

function Desktop() {
    return (
        <div className="bg-blue-400 h-screen w-screen flex flex-col items-center justify-center">
            hi
        </div>
    );
}

export function GameUI() {
    const [phase, setPhase] = useState("boot");

    return (
        <>
            <CRTEffect preset="apple2">
                {phase === "boot" && (
                    <BootScreen onComplete={() => setPhase("splash")} />
                )}

                {phase === "splash" && (
                    <SplashScreen onComplete={() => setPhase("desktop")} />
                )}

                {phase === "desktop" && <Desktop />}
            </CRTEffect>
        </>
    );
}