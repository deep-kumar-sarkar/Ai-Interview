// File: src/redux/store.js (Updated)

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

import interviewReducer from './interviewSlice';
import dashboardReducer from './dashboardSlice';

const persistConfig = {
    key: 'root',
    version: 1,
    storage,
    // We only want to persist these two slices
    whitelist: ['interview', 'dashboard'],
};

// Combine our reducers first
const rootReducer = combineReducers({
    interview: interviewReducer,
    dashboard: dashboardReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            // This is to prevent an error with non-serializable data that redux-persist uses
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

// Export the persistor which we'll use in our main app file
export const persistor = persistStore(store);