import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Define initial state separately so we can reuse it in a reset reducer
const initialState = {
    messages: [],
    turnNumber: 0,
    timeLimit: 0, // Time limit for the current question
    isInterviewOver: false,
    finalScore: null,
    finalSummary: null,
    isLoading: false,
    error: null,
};

// Update the async thunk to call the new endpoint
export const progressInterviewTurn = createAsyncThunk(
    'interview/progressTurn',
    async (userMessage, { getState, dispatch }) => {
        const { interview } = getState();
        const currentHistory = interview.messages;
        const currentTurn = interview.turnNumber;

        // Add user message to state immediately for snappy UI
        if (currentTurn > 0) { // Don't add the initial "start" message
            dispatch(addMessage({ role: 'user', content: userMessage }));
        }

        const requestBody = {
            history: currentHistory,
            turnNumber: currentTurn
        };

        const response = await axios.post('/api/interview/turn', requestBody);
        return response.data; // This is our new InterviewTurnResponse object
    }
);

const interviewSlice = createSlice({
    name: 'interview',
    initialState,
    reducers: {
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },
        // Reset the interview state completely
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

export const { addMessage, resetInterview } = interviewSlice.actions;
export default interviewSlice.reducer;