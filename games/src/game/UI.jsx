import { useEffect, useRef, useState } from 'react';
import { $Font } from 'bdfparser';

function BootScreen(setSplashStart) {
    const canvasRef = useRef(null);

    const textContent = [
        "K3yzBIOS 1.0 Release 1.0",
        "Copyright 1989-2000 K3yz Technologies Ltd.",
        "",
        "BIOS version 29.3",
        "System ID = 1024580",
        "Build Time = 09/7/05 03:09:52",
        "",
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
    ]

    useEffect(() => {
        const loadFont = async () => {
            const response = await fetch('/ib8x8u.bdf');
            const text = await response.text();

            function* getline(str) { yield* str.split('\n'); }

            const font = await $Font(getline(text));

            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            let currentLine = 0;
            const lineHeight = 16;

            const drawNextLine = () => {
                if (currentLine >= textContent.length) {
                    setSplashStart(true);
                    return
                }
                const line = textContent[currentLine];
                const glyph = font.draw(line).enlarge(2, 2);

                ctx.save();
                ctx.translate(0, currentLine * lineHeight);
                glyph.draw2canvas(ctx, { '0': '#000', '1': '#A9A9A9' });
                ctx.restore();

                currentLine++;

                let speed = Math.floor(Math.random() * 300) + 200;
                let time = Math.floor(Math.random() * speed);
                setTimeout(drawNextLine, time);
            };

            setTimeout(drawNextLine, 1000);
        };

        loadFont();
    }, []);

    return (
        <div className="bg-black h-screen w-screen">
            <canvas
                ref={canvasRef}
                width={840}
                height={480}
                className='bg-black'
            />
        </div>
    );
}

function SplashScreen() {
    return (
        <div>uiawhaiuodhuhd</div>
    )
}

export function GameUI() {
    const [splashStart, setSplashStart] = useState(false);

    return (
        <>
            {!splashStart && <BootScreen />}
            {splashStart && <SplashScreen />}
        </>
    );
}