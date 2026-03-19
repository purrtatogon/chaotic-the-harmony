import React, { useState, useEffect } from 'react';

const DemoBanner = () => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const calculateTime = () => {
            const now = new Date();
            // Get the next even hour in UTC (matching my GitHub Cron)
            const nextReset = new Date(now);
            nextReset.setUTCHours(Math.ceil((now.getUTCHours() + 1) / 2) * 2, 0, 0, 0);

            const diff = nextReset - now;
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

            setTimeLeft(`${hours}h ${minutes}m`);
        };

        calculateTime();
        const timer = setInterval(calculateTime, 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    return (
        <div style={{
            backgroundColor: '#ff9800',
            color: 'white',
            textAlign: 'center',
            padding: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            position: 'sticky',
            top: 0,
            zIndex: 1000
        }}>
            🛡️ DEMO MODE: System "Harmony" restores every 2 hours. Next reset in: {timeLeft}
        </div>
    );
};

export default DemoBanner;