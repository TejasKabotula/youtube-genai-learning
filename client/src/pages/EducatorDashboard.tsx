import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { BookOpen, Edit3, Share2, MoreVertical, Plus } from 'lucide-react';

const EducatorDashboard: React.FC = () => {
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const res = await api.get('/videos'); 
            setVideos(res.data);
        } catch (err) {
            console.error('Failed to fetch videos');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-20">Loading educator data...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Educator Dashboard</h1>
                    <p className="text-gray-500">Manage and refine AI-generated educational content.</p>
                </div>
                <Link to="/app/new" className="bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-800 transition">
                    <Plus size={20} /> New Analysis
                </Link>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Video Title</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Analysis Date</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Lang</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {videos.map((video) => (
                            <tr key={video._id} className="border-b hover:bg-gray-50 transition group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                            <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <span className="font-bold text-gray-900 group-hover:text-blue-700 transition line-clamp-1">{video.title}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {new Date(video.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase">{video.language}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center gap-2">
                                        <Link
                                            to={`/app/educator/review/${video._id}`}
                                            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-100 transition"
                                        >
                                            <Edit3 size={16} /> Review Questions
                                        </Link>
                                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition">
                                            <Share2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EducatorDashboard;
