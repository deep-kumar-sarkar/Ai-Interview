import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import IntervieweePage from './pages/IntervieweePage';
import InterviewerPage from './pages/InterviewerPage';
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
// import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
// import IntervieweePage from './pages/IntervieweePage';
// import InterviewerPage from './pages/InterviewerPage';
import WelcomeBackModal from './components/WelcomeBackModal';
import { resetInterview } from './redux/interviewSlice';
import { resetDashboard } from './redux/dashboardSlice';

// You can create this file later for the dashboard
// import InterviewerPage from './pages/InterviewerPage';

function App() {
    const [showModal, setShowModal] = useState(false);
    const { turnNumber, isInterviewOver } = useSelector((state) => state.interview);
    const dispatch = useDispatch();
    useEffect(() => {
        // Check for an interview in progress when the app loads with rehydrated state
        if (turnNumber > 0 && !isInterviewOver) {
            setShowModal(true);
        }
    }, []); // Empty dependency array ensures this runs only once on initial mount

    const handleResume = () => {
        setShowModal(false);
    };

    const handleRestart = () => {
        dispatch(resetInterview());
        // Optionally clear the dashboard too if a full reset is desired
        dispatch(resetDashboard());
        setShowModal(false);
    };
    return (
        <Router>
            {showModal && <WelcomeBackModal onResume={handleResume} onRestart={handleRestart} />}
            <div className="min-h-screen bg-gray-100 font-sans">
                <nav className="bg-white shadow-md">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-xl font-bold py-4">AI Interview Assistant</h1>
                            <NavLink to="/" className={({ isActive }) => `py-4 px-2 border-b-2 ${isActive ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 hover:text-blue-500'}`}>
                                Interviewee
                            </NavLink>
                            <NavLink to="/dashboard" className={({ isActive }) => `py-4 px-2 border-b-2 ${isActive ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 hover:text-blue-500'}`}>
                                Interviewer Dashboard
                            </NavLink>
                        </div>
                    </div>
                </nav>

                <main className="container mx-auto p-4">
                    <Routes>
                        <Route path="/" element={<IntervieweePage />} />
                         <Route path="/dashboard" element={<InterviewerPage />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;