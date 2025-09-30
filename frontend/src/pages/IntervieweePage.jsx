// File: src/pages/IntervieweePage.jsx (Updated)

import React, { useState } from 'react';
import ResumeUpload from '../components/ResumeUpload'; // Import the new component
import ChatInterface from '../components/ChatInterface'; // We'll move the chat to its own component

const IntervieweePage = () => {
    const [candidateInfo, setCandidateInfo] = useState(null);
    const [missingInfo, setMissingInfo] = useState(null);

    const handleParseSuccess = (data) => {
        // This function is called from ResumeUpload when the API call is successful
        setCandidateInfo(data);

        // Check for missing information as per the requirement [cite: 7]
        if (!data.name || !data.email || !data.phone) {
            setMissingInfo('Some information is missing. Please complete your profile.');
            // In a real app, you would show a form here to collect the missing data.
        }
    };

    return (
        <div>
            {!candidateInfo ? (
                // If we don't have candidate info yet, show the upload component
                <ResumeUpload onParseSuccess={handleParseSuccess} />
            ) : (
                // Once parsing is successful, show the chat interface
                <div>
                    {missingInfo && (
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
                            <p className="font-bold">Profile Incomplete</p>
                            <p>{missingInfo}</p>
                        </div>
                    )}
                    {/* For now, we'll let the interview start even if info is missing */}
                    <ChatInterface />
                </div>
            )}
        </div>
    );
};

// For better organization, move the previous chat logic into its own component
// Create a new file src/components/ChatInterface.jsx and paste the old IntervieweePage code there



export default IntervieweePage;