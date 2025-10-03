import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ResumeUpload from '../components/ResumeUpload';
import ChatInterface from '../components/ChatInterface';
import { setCandidateInfo, resetInterview, setResumeText } from '../redux/interviewSlice';

const IntervieweePage = () => {
    const dispatch = useDispatch();
    const candidateInfo = useSelector((state) => state.interview.candidateInfo);

    // THE FIX: Update the function to accept both 'parsedData' and 'rawText'
    const handleParseSuccess = (parsedData, rawText) => {
        // First, reset the state of the PREVIOUS interview.
        dispatch(resetInterview());

        // Then, set the info for the NEW candidate.
        dispatch(setCandidateInfo(parsedData));

        // Now, this works because 'rawText' is a defined parameter.
        dispatch(setResumeText(rawText));
    };

    return (
        <div>
            {!candidateInfo ? (
                // If we don't have candidate info in Redux, show the upload component
                <ResumeUpload onParseSuccess={handleParseSuccess} />
            ) : (
                // Once Redux has candidate info, show the chat interface
                <ChatInterface />
            )}
        </div>
    );
};

export default IntervieweePage;

