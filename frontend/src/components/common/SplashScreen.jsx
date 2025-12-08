import React, { useEffect, useState } from 'react';
import sarthiLogo from '../../assets/images/sarthiLogo.png';

const SplashScreen = ({ onFinish }) => {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        // Start animation shortly after mount
        const timer = setTimeout(() => {
            setAnimate(true);
        }, 500);

        // Initial display time before moving up
        const finishTimer = setTimeout(() => {
            onFinish();
        }, 2500); // 2.5s total duration

        return () => {
            clearTimeout(timer);
            clearTimeout(finishTimer);
        };
    }, [onFinish]);

    return (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-opacity duration-700 ${animate ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div
                className={`flex flex-col items-center transition-transform duration-1000 ease-in-out ${animate ? '-translate-y-20 scale-90' : 'translate-y-0 scale-100'
                    }`}
            >
                <img
                    src={sarthiLogo}
                    alt="SARTHI Logo"
                    className="w-40 h-40 object-contain mb-4 animate-pulse"
                />
                <h1 className="text-3xl font-black text-gray-900 tracking-wider">
                    SARTHI <span className="text-deep-indigo">PORTAL</span>
                </h1>
            </div>
        </div>
    );
};

export default SplashScreen;
