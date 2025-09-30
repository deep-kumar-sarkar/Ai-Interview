// File: src/redux/dashboardSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    // This will hold all completed interview data
    completedInterviews: [],
    // This will hold the ID of a candidate if the interviewer is viewing details
    selectedCandidateId: null,
};

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        // This action will be called at the end of an interview
        addCompletedInterview: (state, action) => {
            const newInterview = {
                id: new Date().toISOString(), // Simple unique ID
                ...action.payload,
            };
            state.completedInterviews.push(newInterview);
        },
        // Actions to handle viewing details
        viewCandidateDetails: (state, action) => {
            state.selectedCandidateId = action.payload; // payload should be the candidate id
        },
        clearCandidateDetails: (state) => {
            state.selectedCandidateId = null;
        },
        // Reset the entire dashboard slice to its initial state
        resetDashboard: () => initialState,
    },
});

export const {
    addCompletedInterview,
    viewCandidateDetails,
    clearCandidateDetails,
    resetDashboard,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;