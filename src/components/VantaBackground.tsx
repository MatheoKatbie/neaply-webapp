'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
    interface Window {
        VANTA: {
            FOG: (config: any) => any;
        };
        THREE: any;
    }
}

export default function VantaBackground() {
    const vantaRef = useRef<HTMLDivElement>(null);
    const [vantaEffect, setVantaEffect] = useState<any>(null);

    useEffect(() => {
        if (!vantaEffect) {
            const loadVanta = async () => {
                // Check if scripts are already loaded
                if (window.VANTA && window.THREE) {
                    initVanta();
                    return;
                }

                // Load Three.js
                const threeScript = document.createElement('script');
                threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
                threeScript.onload = () => {
                    // Load Vanta.js after Three.js is loaded
                    const vantaScript = document.createElement('script');
                    vantaScript.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.fog.min.js';
                    vantaScript.onload = () => {
                        initVanta();
                    };
                    document.head.appendChild(vantaScript);
                };
                document.head.appendChild(threeScript);
            };

            const initVanta = () => {
                if (vantaRef.current && window.VANTA) {
                    const effect = window.VANTA.FOG({
                        el: vantaRef.current,
                        mouseControls: true,
                        touchControls: true,
                        gyroControls: false,
                        minHeight: 200.00,
                        minWidth: 200.00,
                        highlightColor: 0xffffff,
                        midtoneColor: 0xffffff,
                        lowlightColor: 0x2d00ff,
                        baseColor: 0xffebeb,
                        blurFactor: 0.85,
                        speed: 1.1,
                        zoom: 1
                    });
                    setVantaEffect(effect);
                }
            };

            loadVanta();
        }

        return () => {
            if (vantaEffect) vantaEffect.destroy();
        };
    }, [vantaEffect]);

    return (
        <div
            ref={vantaRef}
            className="fixed inset-0 -z-10"
            style={{ width: '100vw', height: '100vh' }}
        />
    );
}
