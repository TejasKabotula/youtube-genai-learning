import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Youtube, Upload, Settings, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

const NewAnalysis: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'youtube' | 'upload'>('youtube');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [summaryLevels, setSummaryLevels] = useState(['short', 'medium']);
    const [questionTypes, setQuestionTypes] = useState(['mcq']);
    const [difficulty, setDifficulty] = useState('medium');
    const [language, setLanguage] = useState('English');

    const [status, setStatus] = useState<'idle' | 'analyzing' | 'success' | 'error'>('idle');
    const [progressStep, setProgressStep] = useState(0);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const steps = [
        'Fetching transcript',
        'Summarizing content',
        'Generating questions',
        'Detecting doubts',
        'Finalizing'
    ];

    const handleLevelToggle = (level: string) => {
        setSummaryLevels(prev =>
            prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
        );
    };

    const handleTypeToggle = (type: string) => {
        setQuestionTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('analyzing');
        setProgressStep(0);
        setError('');

        try {
            // Step simulation for demo/simplicity
            const interval = setInterval(() => {
                setProgressStep(prev => (prev < 4 ? prev + 1 : prev));
            }, 2000);

            const res = await api.post('/videos/analyze', {
                sourceType: activeTab,
                youtubeUrl: activeTab === 'youtube' ? youtubeUrl : undefined,
                filePath: activeTab === 'upload' ? 'temp_file_path' : undefined, // Stub
                summaryLevels,
                questionTypes,
                difficulty,
                language
            });

            clearInterval(interval);
            setProgressStep(5);
            setStatus('success');
            setTimeout(() => navigate(`/app/videos/${res.data.videoId}/summary`), 1500);
        } catch (err: any) {
            setStatus('error');
            setError(err.response?.data?.message || 'Analysis failed');
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">New Video Analysis</h1>
                <p className="text-gray-500">Transform any video into an interactive learning experience.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b">
                    <button
                        onClick={() => setActiveTab('youtube')}
                        className={`flex-1 py-4 flex items-center justify-center gap-2 font-medium transition-colors ${activeTab === 'youtube' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <Youtube size={20} />
                        YouTube URL
                    </button>
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`flex-1 py-4 flex items-center justify-center gap-2 font-medium transition-colors ${activeTab === 'upload' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <Upload size={20} />
                        Upload Video
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Input Area */}
                    <div>
                        {activeTab === 'youtube' ? (
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700">Enter YouTube Video Link</label>
                                <input
                                    type="url"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={youtubeUrl}
                                    onChange={(e) => setYoutubeUrl(e.target.value)}
                                    required
                                />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700">Select Video File (MP4)</label>
                                <div className="border-2 border-dashed rounded-xl p-8 text-center hover:bg-gray-50 transition cursor-pointer">
                                    <Upload className="mx-auto text-gray-400 mb-4" size={32} />
                                    <p className="text-gray-600">Click to upload or drag and drop</p>
                                    <p className="text-xs text-gray-400 mt-1">MP4, max 500MB</p>
                                    <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                                </div>
                                {file && <p className="text-sm text-blue-600 font-medium">{file.name}</p>}
                            </div>
                        )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 pt-4 border-t">
                        {/* Options */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                    <Settings size={16} /> Summary Levels
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {['short', 'medium', 'detailed'].map(level => (
                                        <button
                                            key={level}
                                            type="button"
                                            onClick={() => handleLevelToggle(level)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium border transition ${summaryLevels.includes(level) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white text-gray-600 hover:border-gray-400'}`}
                                        >
                                            {level.charAt(0).toUpperCase() + level.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Question Types</label>
                                <div className="flex flex-wrap gap-2">
                                    {['mcq', 'open-ended', 'short-answer', 'interview'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => handleTypeToggle(type)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium border transition ${questionTypes.includes(type) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white text-gray-600 hover:border-gray-400'}`}
                                        >
                                            {type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Difficulty</label>
                                <select
                                    className="w-full px-4 py-2.5 border rounded-lg outline-none"
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value)}
                                >
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                    <option value="mixed">Mixed</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Language</label>
                                <select
                                    className="w-full px-4 py-2.5 border rounded-lg outline-none"
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                >
                                    <option value="English">English</option>
                                    <option value="Telugu">Telugu</option>
                                    <option value="Hindi">Hindi</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={status === 'analyzing'}
                            className="w-full bg-blue-700 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-800 transition disabled:opacity-50 shadow-lg"
                        >
                            {status === 'analyzing' ? 'Processing...' : 'Fetch Transcript & Analyze'}
                        </button>
                    </div>
                </form>

                {/* Progress UI */}
                {status === 'analyzing' && (
                    <div className="p-8 bg-gray-50 border-t animate-in fade-in duration-500">
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-3">
                            <Loader2 className="animate-spin text-blue-600" /> Professional Analysis in Progress...
                        </h3>
                        <div className="space-y-4">
                            {steps.map((s, i) => (
                                <div key={s} className="flex items-center gap-3">
                                    {progressStep > i ? (
                                        <CheckCircle2 className="text-green-500" size={20} />
                                    ) : progressStep === i ? (
                                        <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                                    )}
                                    <span className={progressStep === i ? "text-blue-700 font-medium" : "text-gray-500"}>{s}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="p-6 bg-red-50 text-red-700 border-t flex items-center gap-3">
                        <AlertCircle /> {error}
                    </div>
                )}

                {status === 'success' && (
                    <div className="p-6 bg-green-50 text-green-700 border-t flex items-center gap-3">
                        <CheckCircle2 /> Video analyzed successfully! Redirecting...
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewAnalysis;
