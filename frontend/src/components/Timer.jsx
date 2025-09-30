// File: src/components/Timer.jsx

import React, { useState, useEffect } from 'react';

const Timer = ({ timeLimit, onTimeUp, turnNumber }) => {
    const [timeLeft, setTimeLeft] = useState(timeLimit);

    useEffect(() => {
        // Reset the timer whenever a new question is asked (i.e., timeLimit or turnNumber changes)
        setTimeLeft(timeLimit);

        // Don't start a timer if the timeLimit is 0 (e.g., interview over)
        if (timeLimit === 0) return;

        const interval = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(interval);
                    onTimeUp(); // Trigger the time's up event
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        // Cleanup function to clear the interval when the component unmounts or re-renders
        return () => clearInterval(interval);

    }, [timeLimit, onTimeUp, turnNumber]); // Dependencies that will reset the timer

    // Determine the color of the timer based on time remaining
    const timerColor = timeLeft <= 10 ? 'text-red-500' : 'text-gray-700';

    return (
        <div className="flex justify-center items-center mb-4">
            <div className={`text-lg font-bold ${timerColor}`}>
                Time Left: {timeLeft}s
            </div>
        </div>
    );
};

export default Timer;