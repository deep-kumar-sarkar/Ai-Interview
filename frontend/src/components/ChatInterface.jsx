// File: src/components/ChatInterface.jsx (Updated)

import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { progressInterviewTurn } from '../redux/interviewSlice';
import Timer from './Timer'; // Import the new Timer component
import { addCompletedInterview } from '../redux/dashboardSlice'; // 1. Import the new action


const ChatInterface = () => {
    const dispatch = useDispatch();
    const interviewState = useSelector((state) => state.interview);
    const {
        messages,
        isLoading,
        timeLimit,
        turnNumber,
        isInterviewOver,
        finalScore,
        finalSummary
    } = interviewState;

    const [input, setInput] = useState('');
    const inputRef = useRef(null); // Ref to access the input field's value
    const chatEndRef = useRef(null);

    // Scroll to the latest message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Kick off the interview on component mount
    useEffect(() => {
        if (turnNumber === 0) {
            dispatch(progressInterviewTurn("Let's begin"));
        }
    }, [dispatch, turnNumber]);

    // 3. Add a new useEffect to watch for the end of the interview
    useEffect(() => {
        if (isInterviewOver) {
            // When the interview is over, archive the results to the dashboard state
            const interviewResult = {
                // In a real app, you'd get candidateInfo (name, email) from the Redux store too
                candidateInfo: { name: 'Jane Doe', email: 'jane.doe@example.com' },
                score: finalScore,
                summary: finalSummary,
                chatHistory: messages,
            };
            dispatch(addCompletedInterview(interviewResult));
        }
    }, [isInterviewOver, dispatch]);

    // Function to handle submitting an answer, either by button or by timer
    const submitAnswer = () => {
        // Use the ref to get the most current input value, even if the state isn't updated
        const answer = inputRef.current?.value || "I don't have an answer.";
        if (!isLoading) {
            dispatch(progressInterviewTurn(answer));
            setInput('');
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        submitAnswer();
    };

    if (isInterviewOver) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto text-center">
                <h2 className="text-2xl font-bold mb-4">Interview Complete</h2>
                <div className="text-left bg-green-100 p-4 rounded-md">
                    <p className="font-bold text-green-800">Thank you! Your results have been saved.</p>
                    <p className="mt-2">You may now close this window.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-2 text-center">Your AI Interview</h2>
            <Timer
                timeLimit={timeLimit}
                onTimeUp={submitAnswer}
                turnNumber={turnNumber}
            />
            <div className="h-96 overflow-y-auto pr-4 mb-4 border rounded-md p-4 flex flex-col space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 rounded-lg max-w-xs lg:max-w-md ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="p-3 rounded-lg bg-gray-200 text-gray-500 italic">
                            AI is typing...
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleFormSubmit} className="flex space-x-2">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-grow border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your answer..."
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
                    disabled={isLoading}
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatInterface;