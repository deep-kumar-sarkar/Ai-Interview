// File: src/components/CandidateDetailView.jsx

import React from 'react';

const CandidateDetailView = ({ candidate, onBack }) => {
    return (
        <div className="w-full max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
            <button onClick={onBack} className="bg-gray-100 text-gray-900 font-semibold px-4 py-2 rounded-md hover:bg-gray-200 mb-4">
                &larr; Back to Dashboard
            </button>

            {/* Summary Section */}
            <div className="border-b pb-4 mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{candidate.candidateInfo.name}</h2>
                <p className="text-gray-700">{candidate.candidateInfo.email}</p>
                <div className="mt-4 bg-indigo-50 p-4 rounded-md">
                    <h3 className="text-lg font-semibold text-indigo-900">Interview Summary</h3>
                    <p className="mt-1"><strong>Final Score:</strong> <span className="font-bold text-xl text-indigo-700">{candidate.score}</span> / 100</p>
                    <p className="mt-1"><strong>AI Analysis:</strong> {candidate.summary}</p>
                </div>
            </div>

            {/* Chat History Section */}
            <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Interview Transcript</h3>
                <div className="h-96 overflow-y-auto pr-4 border rounded-md p-4 flex flex-col space-y-4 bg-white">
                    {candidate.chatHistory.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-lg max-w-lg ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                                <p className="font-bold capitalize mb-1">{msg.role === 'ai' ? 'Interviewer' : 'Candidate'}</p>
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CandidateDetailView;