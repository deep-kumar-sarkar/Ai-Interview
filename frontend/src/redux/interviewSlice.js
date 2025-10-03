import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// THE FIX: Add candidateInfo to the initial state so it gets reset properly.
const initialState = {
    candidateInfo: null,
    resumeText: "",
    messages: [],
    turnNumber: 0,
    timeLimit: 0,
    isInterviewOver: false,
    finalScore: null,
    finalSummary: null,
    isLoading: false,
    error: null,
};

export const progressInterviewTurn = createAsyncThunk(
    'interview/progressTurn',
    async (userMessage, { getState, dispatch }) => {
        const { interview } = getState();
        // const currentHistory = interview.messages;
        // const currentTurn = interview.turnNumber;

        const { messages, turnNumber, resumeText } = interview;

        // if (currentTurn > 0) {
        //     dispatch(addMessage({ role: 'user', content: userMessage }));
        // }
        if (turnNumber > 0) {
            dispatch(addMessage({ role: 'user', content: userMessage }));
        }

        // const requestBody = {
        //     history: currentHistory,
        //     turnNumber: currentTurn
        // };

        const requestBody = {
            resumeContext: resumeText, // Add it to the request body
            history: messages,
            turnNumber: turnNumber
        };

        const response = await axios.post('/api/interview/turn', requestBody);
        return response.data;
    }
);

const interviewSlice = createSlice({
    name: 'interview',
    initialState,
    reducers: {
        setResumeText: (state, action) => {
            state.resumeText = action.payload;
        },
        setCandidateInfo: (state, action) => {
            state.candidateInfo = action.payload;
        },
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },
        // This action now correctly resets the entire slice, including candidateInfo
        resetInterview: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(progressInterviewTurn.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(progressInterviewTurn.fulfilled, (state, action) => {
                const { aiResponse, timeLimit, isInterviewOver, score, summary } = action.payload;
                state.messages.push({ role: 'ai', content: aiResponse });
                state.timeLimit = timeLimit;
                state.turnNumber += 1;
                state.isInterviewOver = isInterviewOver;
                state.finalScore = score;
                state.finalSummary = summary;
                state.isLoading = false;
            })
            .addCase(progressInterviewTurn.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            });
    },
});

// We need to export setCandidateInfo as well
export const { setResumeText, addMessage, resetInterview, setCandidateInfo } = interviewSlice.actions;
export default interviewSlice.reducer;
