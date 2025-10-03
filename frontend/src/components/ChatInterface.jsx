import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
// import { progressInterviewTurn } from '../redux/interviewSlice';
import Timer from './Timer';
import { addCompletedInterview } from '../redux/dashboardSlice';
import { progressInterviewTurn, resetInterview } from '../redux/interviewSlice';

// THE FIX: Remove candidateInfo from the props.
const ChatInterface = () => {
    const dispatch = useDispatch();

    // THE FIX: Get candidateInfo directly from the Redux store with useSelector.
    const {
        candidateInfo, // <-- Get it from here
        messages,
        isLoading,
        timeLimit,
        turnNumber,
        isInterviewOver,
        finalScore,
        finalSummary
    } = useSelector((state) => state.interview);

    const [input, setInput] = useState('');
    const inputRef = useRef(null);
    const chatEndRef = useRef(null);

    const handleStartNewInterview = () => {
        dispatch(resetInterview());
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (turnNumber === 0) {
            dispatch(progressInterviewTurn("Let's begin"));
        }
    }, [dispatch, turnNumber]);

    useEffect(() => {
        if (isInterviewOver) {
            const interviewResult = {
                // Now this will reliably use the data from the Redux store
                candidateInfo: candidateInfo || { name: 'Anonymous', email: 'N/A' },
                score: finalScore,
                summary: finalSummary,
                chatHistory: messages,
            };
            dispatch(addCompletedInterview(interviewResult));
        }
    }, [isInterviewOver, dispatch, candidateInfo, finalScore, finalSummary, messages]);

    const submitAnswer = () => {
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

    // The rest of your JSX remains exactly the same.
    // ...
    if (isInterviewOver) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto text-center">
                <h2 className="text-2xl font-bold mb-4">Interview Complete</h2>
                <div className="text-left bg-green-100 p-4 rounded-md mb-6">
                    <p className="font-bold text-green-800">Thank you! Your results have been saved to the dashboard.</p>
                </div>
                <button
                    onClick={handleStartNewInterview}
                    className="bg-indigo-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-indigo-700"
                >
                    Start Another Interview
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-2 text-center">Your AI Interview</h2>
            <Timer
                timeLimit={timeLimit}
                onTimeUp={submitAnswer}
                turnNumber={turnNumber}
            />
            <div className="h-96 overflow-y-auto pr-4 mb-4 border rounded-md p-4 flex flex-col space-y-4 bg-gray-50">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 rounded-lg max-w-xs lg:max-w-md ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
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
                    className="flex-grow border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    placeholder="Type your answer..."
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                    disabled={isLoading}
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatInterface;
