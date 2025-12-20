import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Calendar, Clock, PlayCircle, Eye, Trash2, Search } from 'lucide-react';

const MyVideos: React.FC = () => {
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        if (!window.confirm('Are you sure you want to delete this analysis?')) return;
        try {
            await api.delete(`/videos/${id}`); // Need to implement this route in backend
            setVideos(videos.filter(v => v._id !== id));
        } catch (err) {
            alert('Delete failed');
        }
    };

    const filteredVideos = videos.filter(v =>
        v.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-center py-20">Loading your videos...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Analyzed Videos</h1>
                    <p className="text-gray-500">Access all your previous insights and quiz reports.</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search videos..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {filteredVideos.length === 0 ? (
                <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-200">
                    <PlayCircle className="mx-auto text-gray-300 mb-6" size={64} />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No videos found</h2>
                    <p className="text-gray-500 mb-8">Start by analyzing your first video.</p>
                    <Link to="/app/new" className="px-8 py-3 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800 transition">
                        Analyze New Video
                    </Link>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredVideos.map((video) => (
                        <Link
                            key={video._id}
                            to={`/app/videos/${video._id}/summary`}
                            className="bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-xl transition group"
                        >
                            <div className="relative aspect-video">
                                <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <PlayCircle className="text-white" size={48} />
                                </div>
                                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-[10px] font-bold rounded uppercase">
                                    {video.language}
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 min-h-[3rem] group-hover:text-blue-700 transition">{video.title}</h3>
                                <div className="flex flex-col gap-2 text-xs text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} /> {new Date(video.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} /> {Math.floor(video.duration / 60)}m {video.duration % 60}s
                                    </div>
                                </div>
                                <div className="mt-5 pt-5 border-t flex justify-between items-center">
                                    <span className="flex items-center gap-1.5 text-blue-600 font-bold text-sm">
                                        <Eye size={16} /> View Analysis
                                    </span>
                                    <button
                                        onClick={(e) => handleDelete(video._id, e)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyVideos;
