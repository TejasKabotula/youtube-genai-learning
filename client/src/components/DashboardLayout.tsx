import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import {
    PlusCircle,
    Video,
    GraduationCap,
    LogOut,
    Menu,
    X,
    LayoutDashboard,
    User
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const DashboardLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const menuItems = [
        { icon: PlusCircle, label: 'New Analysis', path: '/app/new' },
        { icon: Video, label: 'My Videos', path: '/app/videos' },
        { icon: GraduationCap, label: 'Educator Dashboard', path: '/app/educator', role: ['educator', 'admin'] },
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <aside className={cn(
                "bg-white border-r transition-all duration-300 flex flex-col",
                isSidebarOpen ? "w-64" : "w-16"
            )}>
                <div className="p-4 border-b flex items-center justify-between">
                    {isSidebarOpen ? (
                        <span className="font-bold text-xl text-blue-600">YT Tutor</span>
                    ) : (
                        <LayoutDashboard className="text-blue-600" />
                    )}
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-gray-100 rounded">
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="flex-1 p-2 space-y-1 mt-4">
                    {menuItems.map((item) => (
                        (!item.role || (user && item.role.includes(user.role))) && (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center p-3 rounded-lg transition-colors",
                                    location.pathname === item.path
                                        ? "bg-blue-50 text-blue-700 font-medium"
                                        : "text-gray-600 hover:bg-gray-100"
                                )}
                            >
                                <item.icon size={20} />
                                {isSidebarOpen && <span className="ml-3">{item.label}</span>}
                            </Link>
                        )
                    ))}
                </nav>

                <div className="p-4 border-t">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        {isSidebarOpen && <span className="ml-3">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Navbar */}
                <header className="bg-white border-b h-16 flex items-center justify-between px-8">
                    <h2 className="text-lg font-semibold text-gray-800">
                        {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                        </div>
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">
                            <User size={20} />
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
