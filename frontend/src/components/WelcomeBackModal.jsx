// File: src/components/WelcomeBackModal.jsx

import React from 'react';

const WelcomeBackModal = ({ onResume, onRestart }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl text-center">
                <h2 className="text-2xl font-bold mb-4">Welcome Back!</h2>
                <p className="mb-6 text-gray-700">You have an interview in progress.</p>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={onResume}
                        className="bg-blue-500 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-600"
                    >
                        Resume Interview
                    </button>
                    <button
                        onClick={onRestart}
                        className="bg-gray-300 text-gray-800 font-semibold px-6 py-2 rounded-md hover:bg-gray-400"
                    >
                        Start New
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeBackModal;