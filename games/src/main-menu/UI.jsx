import { motion } from "motion/react"

export function UI({ onPlayClick }) {
    return (
        <>
            <div className="absolute top-20 left-20 text-black">
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
                    onClick={onPlayClick}
                >
                    Play
                </motion.button>
            </div>
        </>
    )
}