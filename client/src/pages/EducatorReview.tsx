import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Save, Trash2, Plus, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';

const EducatorReview: React.FC = () => {
    const { videoId } = useParams<{ videoId: string }>();
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchQuestions();
    }, [videoId]);

    const fetchQuestions = async () => {
        try {
            const res = await api.get(`/questions/${videoId}/questions`);
            setQuestions(res.data);
        } catch (err) {
            console.error('Failed to fetch questions');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = (id: string, field: string, value: any) => {
        setQuestions(questions.map(q => q._id === id ? { ...q, [field]: value } : q));
    };

    const handleSaveAll = async () => {
        setSaving(true);
        try {
            await Promise.all(questions.map(q => api.put(`/questions/${q._id}`, q)));
            alert('All changes saved successfully!');
        } catch (err) {
            alert('Failed to save some changes');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this question?')) return;
        try {
            await api.delete(`/questions/${id}`);
            setQuestions(questions.filter(q => q._id !== id));
        } catch (err) {
            alert('Delete failed');
        }
    };

    const handleAddQuestion = () => {
        const newQ = {
            _id: 'temp-' + Date.now(),
            text: 'New Question',
            type: 'mcq',
            difficulty: 'medium',
            options: ['', '', '', ''],
            correctOptionIndex: 0,
            answerExplanation: ''
        };
        setQuestions([...questions, newQ]);
    };

    if (loading) return <div className="text-center py-20">Loading questions editor...</div>;

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <div className="flex justify-between items-center mb-10">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition">
                    <ArrowLeft size={20} /> Back to Dashboard
                </button>
                <div className="flex gap-4">
                    <button
                        onClick={handleAddQuestion}
                        className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-200 transition"
                    >
                        <Plus size={20} /> Add Question
                    </button>
                    <button
                        onClick={handleSaveAll}
                        disabled={saving}
                        className="px-8 py-2.5 bg-blue-700 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-blue-800 transition shadow-lg disabled:opacity-50"
                    >
                        <Save size={20} /> {saving ? 'Saving...' : 'Save All Changes'}
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {questions.map((q, i) => (
                    <div key={q._id} className="bg-white p-8 rounded-2xl border shadow-sm relative group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold">{i + 1}</span>
                                <select
                                    className="px-3 py-1 bg-gray-50 border rounded text-xs font-bold uppercase tracking-wider outline-none"
                                    value={q.type}
                                    onChange={(e) => handleUpdate(q._id, 'type', e.target.value)}
                                >
                                    <option value="mcq">MCQ</option>
                                    <option value="open-ended">Open Ended</option>
                                    <option value="short-answer">Short Answer</option>
                                </select>
                                <select
                                    className="px-3 py-1 bg-gray-50 border rounded text-xs font-bold uppercase tracking-wider outline-none"
                                    value={q.difficulty}
                                    onChange={(e) => handleUpdate(q._id, 'difficulty', e.target.value)}
                                >
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>
                            <button
                                onClick={() => handleDelete(q._id)}
                                className="p-2 text-gray-300 hover:text-red-500 transition"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Question Text</label>
                                <textarea
                                    className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                                    value={q.text}
                                    onChange={(e) => handleUpdate(q._id, 'text', e.target.value)}
                                />
                            </div>

                            {q.type === 'mcq' && q.options && (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {q.options.map((opt: string, idx: number) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleUpdate(q._id, 'correctOptionIndex', idx)}
                                                className={`w-8 h-8 shrink-0 rounded-full border flex items-center justify-center transition ${q.correctOptionIndex === idx ? 'bg-green-500 border-green-500 text-white' : 'bg-white hover:bg-gray-50'}`}
                                            >
                                                {q.correctOptionIndex === idx ? <CheckCircle2 size={16} /> : String.fromCharCode(65 + idx)}
                                            </button>
                                            <input
                                                type="text"
                                                className="flex-1 px-4 py-2 bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                value={opt}
                                                onChange={(e) => {
                                                    const newOpts = [...q.options];
                                                    newOpts[idx] = e.target.value;
                                                    handleUpdate(q._id, 'options', newOpts);
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Detailed Explanation / Answer</label>
                                <textarea
                                    className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-green-500 min-h-[100px] bg-green-50/20"
                                    value={q.answerExplanation}
                                    onChange={(e) => handleUpdate(q._id, 'answerExplanation', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EducatorReview;
