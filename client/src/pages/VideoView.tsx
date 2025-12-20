import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import {
    FileText,
    HelpCircle,
    MessageSquare,
    Download,
    Clock,
    PlayCircle,
    ChevronDown,
    ChevronUp,
    FileDown
} from 'lucide-react';

const VideoView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [video, setVideo] = useState<any>(null);
    const [summaries, setSummaries] = useState<any[]>([]);
    const [questions, setQuestions] = useState<any[]>([]);
    const [clarifications, setClarifications] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'summary' | 'questions' | 'clarifications'>('summary');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [vRes, qRes, cRes] = await Promise.all([
                    api.get(`/videos/${id}`),
                    api.get(`/questions/${id}/questions`),
                    api.get(`/videos/${id}/clarifications`)
                ]);
                setVideo(vRes.data.video);
                setSummaries(vRes.data.summaries);
                setQuestions(qRes.data);
                setClarifications(cRes.data);
            } catch (err) {
                console.error('Failed to fetch video data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleDownload = async (format: 'pdf' | 'docx') => {
        try {
            const response = await api.get(`/videos/${id}/report/${format}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `report-${id}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error(`Failed to download ${format} report`, err);
            alert(`Failed to download ${format} report. Please try again.`);
        }
    };

    if (loading) return <div className="text-center py-20">Loading video details...</div>;
    if (!video) return <div className="text-center py-20">Video not found.</div>;

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-8 mb-8">
                <div className="w-full md:w-1/3">
                    <img src={video.thumbnailUrl} alt={video.title} className="w-full rounded-2xl shadow-lg border" />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{video.title}</h1>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleDownload('pdf')}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
                            >
                                <FileDown size={18} /> PDF
                            </button>
                            <button
                                onClick={() => handleDownload('docx')}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
                            >
                                <Download size={18} /> DOCX
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-gray-500 mt-4">
                        <span className="flex items-center gap-1"><Clock size={16} /> {Math.floor(video.duration / 60)}m {video.duration % 60}s</span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-bold uppercase">{video.language}</span>
                        <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                            View on YouTube
                        </a>
                    </div>
                    <div className="mt-8 flex border rounded-xl overflow-hidden shadow-sm">
                        {[
                            { id: 'summary', icon: FileText, label: 'Summary' },
                            { id: 'questions', icon: HelpCircle, label: 'Questions' },
                            { id: 'clarifications', icon: MessageSquare, label: 'Clarifications' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 py-3 flex items-center justify-center gap-2 font-medium transition ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'summary' && <SummaryTab summaries={summaries} topics={video.topics} youtubeUrl={video.youtubeUrl} />}
                {activeTab === 'questions' && <QuestionsTab questions={questions} id={id!} />}
                {activeTab === 'clarifications' && <ClarificationsTab clarifications={clarifications} id={id!} />}
            </div>
        </div>
    );
};

const SummaryTab: React.FC<{ summaries: any[], topics: any[], youtubeUrl: string }> = ({ summaries, topics, youtubeUrl }) => (
    <div className="space-y-8">
        <div className="grid md:grid-cols-3 gap-6">
            {['short', 'medium', 'detailed'].map(level => {
                const s = summaries.find(sm => sm.level === level);
                return (
                    <div key={level} className="bg-white p-6 rounded-2xl border shadow-sm h-full">
                        <h3 className="text-lg font-bold mb-4 capitalize text-indigo-700">{level} Summary</h3>
                        <p className="text-gray-700 leading-relaxed text-sm">{s?.content || 'No summary generated for this level.'}</p>
                    </div>
                );
            })}
        </div>

        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
                <h3 className="font-bold flex items-center gap-2"><Clock size={18} className="text-blue-600" /> Topics & Timestamps</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b bg-gray-50/50">
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Topic</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Time</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Key Insight</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topics.map((t, i) => (
                            <tr key={i} className="border-b hover:bg-gray-50 transition">
                                <td className="px-6 py-4 font-bold text-gray-900">{t.topic}</td>
                                <td className="px-6 py-4 text-gray-600 text-sm">{Math.floor(t.start / 60)}:{(t.start % 60).toString().padStart(2, '0')}</td>
                                <td className="px-6 py-4 text-gray-600 text-sm max-w-xs">{t.keyInsight}</td>
                                <td className="px-6 py-4 text-center">
                                    <a
                                        href={`${youtubeUrl}&t=${t.start}s`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition"
                                    >
                                        <PlayCircle size={14} /> Jump to Time
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

const QuestionsTab: React.FC<{ questions: any[], id: string }> = ({ questions, id }) => {
    const [showAnswerIdx, setShowAnswerIdx] = useState<number | null>(null);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Interactive Quiz</h3>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition">
                    Generate More Questions
                </button>
            </div>
            <div className="grid gap-6">
                {questions.map((q, i) => (
                    <div key={i} className="bg-white p-8 rounded-2xl border shadow-sm relative overflow-hidden group">
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${q.difficulty === 'hard' ? 'bg-red-500' : q.difficulty === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                        <div className="flex justify-between items-start mb-4">
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wider">{q.type}</span>
                            <span className="flex items-center gap-1 text-gray-400 text-xs"><Clock size={12} /> {Math.floor(q.timestampSeconds / 60)}:{(q.timestampSeconds % 60).toString().padStart(2, '0')}</span>
                        </div>
                        <p className="text-lg font-medium text-gray-900 mb-6">{i + 1}. {q.text}</p>

                        {q.type === 'mcq' && q.options && (
                            <div className="grid md:grid-cols-2 gap-3 mb-6">
                                {q.options.map((opt: string, idx: number) => (
                                    <div key={idx} className="p-4 border rounded-xl bg-gray-50 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center text-sm font-bold shadow-sm">{String.fromCharCode(65 + idx)}</div>
                                        <span className="text-gray-700">{opt}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="border-t pt-4">
                            <button
                                onClick={() => setShowAnswerIdx(showAnswerIdx === i ? null : i)}
                                className="flex items-center gap-2 text-blue-600 font-bold text-sm hover:underline"
                            >
                                {showAnswerIdx === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                {showAnswerIdx === i ? 'Hide Answer' : 'Show Answer'}
                            </button>
                            {showAnswerIdx === i && (
                                <div className="mt-4 p-5 bg-blue-50 rounded-xl animate-in slide-in-from-top-2 duration-300">
                                    <p className="font-bold text-blue-800 mb-2">
                                        {q.type === 'mcq' ? `Correct Option: ${String.fromCharCode(65 + q.correctOptionIndex)}` : 'Model Answer:'}
                                    </p>
                                    <p className="text-blue-700 text-sm leading-relaxed">{q.answerExplanation}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ClarificationsTab: React.FC<{ clarifications: any[], id: string }> = ({ clarifications, id }) => {
    const [doubt, setDoubt] = useState('');
    const [doubts, setDoubts] = useState<any[]>([]);
    const [asking, setAsking] = useState(false);

    useEffect(() => {
        api.get(`/videos/${id}/doubts`).then(res => setDoubts(res.data));
    }, [id]);

    const handleAsk = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!doubt.trim()) return;
        setAsking(true);
        try {
            const res = await api.post(`/videos/${id}/clarifications/ask`, { question: doubt });
            setDoubts([res.data, ...doubts]);
            setDoubt('');
        } finally {
            setAsking(false);
        }
    };

    return (
        <div className="grid lg:grid-cols-2 gap-10">
            <div className="space-y-8">
                <h3 className="text-xl font-bold flex items-center gap-3">
                    <AlertCircle size={24} className="text-yellow-600" /> Detected Ambiguities
                </h3>
                {clarifications.map((c, i) => (
                    <div key={i} className="bg-white p-8 rounded-2xl border shadow-sm space-y-4 border-l-4 border-l-yellow-400">
                        <div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Snippet from Video</p>
                            <p className="italic text-gray-700 bg-gray-50 p-4 rounded-xl border">"{c.transcriptSnippet}"</p>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-red-500 uppercase tracking-widest mb-1">Reason for Ambiguity</p>
                            <p className="text-gray-900 font-medium">{c.reason}</p>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-green-600 uppercase tracking-widest mb-1">AI Clarification</p>
                            <p className="text-gray-800 leading-relaxed">{c.clarificationText}</p>
                        </div>
                        {c.examples && (
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-gray-400 uppercase">Examples / Analogies</p>
                                {c.examples.map((ex: string, idx: number) => (
                                    <div key={idx} className="flex gap-2 p-3 bg-green-50/50 rounded-lg text-sm text-green-800">
                                        <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> {ex}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="space-y-8">
                <h3 className="text-xl font-bold flex items-center gap-3">
                    <MessageSquare size={24} className="text-blue-600" /> Ask Your Doubts
                </h3>
                <div className="bg-white p-1 rounded-2xl border shadow-lg overflow-hidden flex flex-col h-[600px]">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {doubts.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                                <MessageCircle size={48} className="mb-4 opacity-20" />
                                <p>No doubts asked yet. Be the first!</p>
                            </div>
                        ) : (
                            doubts.map((d, i) => (
                                <div key={i} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                    <div className="flex justify-end">
                                        <div className="bg-blue-600 text-white p-4 rounded-2xl rounded-tr-none max-w-[80%] shadow-md">
                                            {d.question}
                                        </div>
                                    </div>
                                    <div className="flex justify-start">
                                        <div className="bg-gray-100 text-gray-800 p-4 rounded-2xl rounded-tl-none max-w-[80%] shadow-sm border">
                                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">AI Tutor</p>
                                            {d.answer}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <form onSubmit={handleAsk} className="p-4 border-t bg-gray-50 flex gap-2">
                        <input
                            type="text"
                            placeholder="Ask anything about this video..."
                            className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                            value={doubt}
                            onChange={(e) => setDoubt(e.target.value)}
                            disabled={asking}
                        />
                        <button
                            type="submit"
                            disabled={asking || !doubt.trim()}
                            className="px-6 py-3 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800 transition shadow-md disabled:opacity-50"
                        >
                            {asking ? <Loader2 className="animate-spin" size={20} /> : 'Ask'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Simple imports for missing icons/components in the code above (Lucide)
import { AlertCircle, CheckCircle2, MessageCircle, Loader2 } from 'lucide-react';

export default VideoView;
