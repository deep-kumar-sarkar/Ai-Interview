// File: src/App.jsx (Updated)
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import IntervieweePage from './pages/IntervieweePage';
import InterviewerPage from './pages/InterviewerPage';

function App() {
    return (
        <Router>
            {/* Make the root a full-height flex column */}
            <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
                <nav className="bg-white shadow-sm border-b border-slate-200">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-xl font-bold py-4 text-slate-800">AI Interview Assistant</h1>
                            <NavLink to="/" className={({ isActive }) => `py-4 px-2 border-b-2 font-medium ${isActive ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-indigo-600'}`}>
                                Interviewee
                            </NavLink>
                            <NavLink to="/dashboard" className={({ isActive }) => `py-4 px-2 border-b-2 font-medium ${isActive ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-indigo-600'}`}>
                                Interviewer Dashboard
                            </NavLink>
                        </div>
                    </div>
                </nav>

                {/* Make the main content area grow to fill space */}
                <main className="container mx-auto p-4 flex-grow">
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