import React from 'react';
import { Link } from 'react-router-dom';
import { Youtube, Upload, BookOpen, MessageCircle, Globe, Users } from 'lucide-react';

const LandingPage: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-5xl font-extrabold mb-6 tracking-tight">YouTube Tutor</h1>
                    <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
                        Paste a YouTube link or upload a video. Get summaries, questions, and clarifications instantly using the power of AI.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link to="/register" className="bg-white text-blue-700 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition shadow-lg">
                            Get Started
                        </Link>
                        <Link to="/login" className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white/10 transition">
                            Sign In
                        </Link>
                    </div>
                </div>
            </header>

            {/* Features */}
            <section className="py-20 px-4 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-16">Everything you need to master any video</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard
                            icon={<Youtube className="text-red-500" />}
                            title="Summarization"
                            desc="Multi-level summaries (Short, Medium, Detailed) to save your precious time."
                        />
                        <FeatureCard
                            icon={<BookOpen className="text-blue-500" />}
                            title="Question Gen"
                            desc="MCQs, open-ended, and interview-style questions generated automatically."
                        />
                        <FeatureCard
                            icon={<MessageCircle className="text-green-500" />}
                            title="Doubt Clarification"
                            desc="Detected ambiguities are clarified with real-world analogies and examples."
                        />
                        <FeatureCard
                            icon={<Globe className="text-purple-500" />}
                            title="Multilingual"
                            desc="Support for English, Telugu, and Hindi to learn in your preferred language."
                        />
                    </div>
                </div>
            </section>

            {/* Team Info */}
            <section className="py-20 px-4 bg-white border-t">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="flex justify-center mb-6">
                        <Users className="w-12 h-12 text-indigo-600" />
                    </div>
                    <h2 className="text-3xl font-bold mb-8">Meet the Team</h2>
                    <p className="text-lg text-gray-600 mb-8 italic">"Building the future of AI-assisted education."</p>
                    <div className="bg-gray-50 p-8 rounded-2xl shadow-sm border">
                        <h3 className="text-xl font-bold text-indigo-700 mb-2">Team Four – Nexus – AOT – Defenders</h3>
                        <p className="text-gray-700">Members: Naveen, Haneesh, Haneesh Badal</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-10 px-4 mt-auto">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center opacity-70 text-sm">
                    <p>&copy; 2025 YouTube Tutor. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <span>By Team Four</span>
                        <span>Nexus Project</span>
                        <span>AOT</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, desc: string }> = ({ icon, title, desc }) => (
    <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border">
        <div className="w-12 h-12 mb-6 bg-gray-50 rounded-lg flex items-center justify-center">
            {React.cloneElement(icon as React.ReactElement, { size: 28 })}
        </div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{desc}</p>
    </div>
);

export default LandingPage;
