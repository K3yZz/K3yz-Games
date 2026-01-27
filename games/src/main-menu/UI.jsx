import { motion } from "motion/react"
import { useState } from "react";

export function UI({ setAnimPlayStart }) {
    const [fadeOut, setFadeOut] = useState(false);

    const handlePlayClick = () => {
        setAnimPlayStart(true);
        setFadeOut(true);
    };
    
    return (
        <motion.div
            className="absolute top-20 left-20 text-black"
            initial={{ opacity: 1 }}
            animate={{ opacity: fadeOut ? 0 : 1 }}
            transition={{ duration: 0.5 }}
        >
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 3.2 }}
                className="text-5xl font-bold mb-2"
            >
                K3yz Games
            </motion.h1>
            <motion.button
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 3.4 }}
                className="text-lg"
                onClick={handlePlayClick}
            >
                Play
            </motion.button>
        </motion.div>
    )
}