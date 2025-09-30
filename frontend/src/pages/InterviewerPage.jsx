// File: src/pages/InterviewerPage.jsx

import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { viewCandidateDetails, clearCandidateDetails } from '../redux/dashboardSlice';
import CandidateDetailView from '../components/CandidateDetailView';

const InterviewerPage = () => {
    const dispatch = useDispatch();
    const { completedInterviews, selectedCandidateId } = useSelector((state) => state.dashboard);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('score_desc'); // Default sort: score descending

    // Memoize the filtered and sorted list to avoid re-calculating on every render
    const filteredAndSortedInterviews = useMemo(() => {
        let interviews = [...completedInterviews];

        // Filtering
        if (searchTerm) {
            interviews = interviews.filter(interview =>
                interview.candidateInfo.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sorting
        interviews.sort((a, b) => {
            if (sortBy === 'score_desc') {
                return b.score - a.score;
            }
            if (sortBy === 'score_asc') {
                return a.score - b.score;
            }
            if (sortBy === 'name_asc') {
                return a.candidateInfo.name.localeCompare(b.candidateInfo.name);
            }
            return 0;
        });

        return interviews;
    }, [completedInterviews, searchTerm, sortBy]);

    const selectedCandidate = useMemo(() =>
            completedInterviews.find(interview => interview.id === selectedCandidateId),
        [completedInterviews, selectedCandidateId]);

    // Handlers
    const handleViewDetails = (id) => dispatch(viewCandidateDetails(id));
    const handleBackToList = () => dispatch(clearCandidateDetails());

    if (selectedCandidate) {
        return <CandidateDetailView candidate={selectedCandidate} onBack={handleBackToList} />;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Interviewer Dashboard</h2>

            {/* Search and Sort Controls */}
            <div className="flex justify-between items-center mb-4">
                <input
                    type="text"
                    placeholder="Search by name..."
                    className="border p-2 rounded-md w-1/3"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="border p-2 rounded-md"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="score_desc">Sort by Score (High to Low)</option>
                    <option value="score_asc">Sort by Score (Low to High)</option>
                    <option value="name_asc">Sort by Name (A-Z)</option>
                </select>
            </div>

            {/* Candidate Table */}
            <CandidateTable candidates={filteredAndSortedInterviews} onViewDetails={handleViewDetails} />
        </div>
    );
};

// We will create this component next
const CandidateTable = ({ candidates, onViewDetails }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
            <thead className="bg-gray-200">
            <tr>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Name</th>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Email</th>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Score</th>
                <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Actions</th>
            </tr>
            </thead>
            <tbody className="text-gray-700">
            {candidates.length > 0 ? candidates.map((candidate) => (
                <tr key={candidate.id} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-4">{candidate.candidateInfo.name}</td>
                    <td className="py-3 px-4">{candidate.candidateInfo.email}</td>
                    <td className="py-3 px-4 font-bold text-blue-600">{candidate.score}</td>
                    <td className="py-3 px-4">
                        <button
                            onClick={() => onViewDetails(candidate.id)}
                            className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-md hover:bg-blue-600"
                        >
                            View Details
                        </button>
                    </td>
                </tr>
            )) : (
                <tr>
                    <td colSpan="4" className="text-center py-4">No completed interviews found.</td>
                </tr>
            )}
            </tbody>
        </table>
    </div>
);

export default InterviewerPage;