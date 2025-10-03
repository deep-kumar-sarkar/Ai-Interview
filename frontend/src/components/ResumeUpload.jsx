import React, { useState } from 'react';
import axios from 'axios';

// This component receives a function to call when parsing is successful
const ResumeUpload = ({ onParseSuccess }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState('Upload your PDF resume to begin.');

    const extractTextFromPdf = async (arrayBuffer) => {
        // Dynamically import the legacy ESM build of pdfjs-dist to work well with Vite
        const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
        // Configure worker (Vite will resolve this URL correctly)
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
            'pdfjs-dist/legacy/build/pdf.worker.mjs',
            import.meta.url
        ).toString();

        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let text = '';
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const content = await page.getTextContent();
            const strings = content.items.map((item) => item.str || '');
            text += strings.join(' ') + '\n';
        }
        return text.trim();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) {
            setMessage('Please select a PDF file.');
            return;
        }
        if (file.type && file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            setMessage('Please select a valid PDF file.');
            return;
        }

        setIsProcessing(true);
        setMessage('Reading your resume...');

        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const arrayBuffer = e.target.result;
                const resumeText = await extractTextFromPdf(arrayBuffer);

                if (!resumeText || resumeText.length < 10) {
                    throw new Error('Could not extract text from the PDF.');
                }

                setMessage('Extracting your information with AI...');

                const response = await axios.post('/api/parse-resume', {
                    resumeText
                });

                const parsedData = response.data || {};

                // Normalize parsed values to ensure they are clean
                const normalized = {
                    name: (parsedData.name || '').trim(),
                    email: (parsedData.email || '').trim(),
                    phone: (parsedData.phone || '').trim(),
                };

                setMessage(`Success! Welcome, ${normalized.name || 'candidate'}.`);

                // THE FIX: Pass the cleaned, normalized data along with the raw text
                onParseSuccess(normalized, resumeText);

            } catch (error) {
                console.error('Error during resume parsing:', error);
                setMessage('An error occurred while processing your resume. Please try another PDF.');
            } finally {
                setIsProcessing(false);
                if (event.target) event.target.value = '';
            }
        };

        reader.onerror = () => {
            setMessage('Failed to read the file. Please try again.');
            setIsProcessing(false);
        };

        reader.readAsArrayBuffer(file);
    };

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-white p-8 rounded-lg shadow-md w-full max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-extrabold mb-4 text-indigo-800">Get Started</h2>
            <p className="mb-6 text-indigo-600">{message}</p>
            <label className={`inline-flex items-center justify-center px-6 py-3 text-white font-semibold rounded-lg shadow-md cursor-pointer transition-colors ${isProcessing ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                {isProcessing ? 'Processing...' : 'Upload Resume (PDF)'}
                <input
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isProcessing}
                />
            </label>
            <p className="text-sm text-gray-500 mt-4">Tip: Use a text-based PDF for better extraction results.</p>
        </div>
    );
};

export default ResumeUpload;
