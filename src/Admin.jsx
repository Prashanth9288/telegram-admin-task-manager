import React, { useState } from 'react';
import { auth } from './services/FirebaseConfig';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { LayoutList, Newspaper, LogOut, User, ArrowRight, Menu, X, Activity } from 'lucide-react';
import { useTasks, useNews } from './hooks/useRealtimeData';

const Admin = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Real-time Data Hooks
    const { stats: taskStats, loading: tasksLoading } = useTasks();
    const { total: newsTotal, loading: newsLoading } = useNews();

    const handleLogout = () => {
        signOut(auth).then(() => {
            navigate('/');
        });
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col relative overflow-hidden font-sans text-white">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
                <div className="absolute top-[10%] left-[20%] w-32 h-32 bg-purple-500/20 blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[20%] right-[20%] w-40 h-40 bg-pink-500/20 blur-[120px] animate-pulse delay-1000"></div>
            </div>

            {/* Navbar */}
            <header className="relative z-50 w-full border-b border-white/10 bg-[#2e1065]/50 backdrop-blur-xl">
                <div className="w-full px-4 md:px-8 h-20 flex items-center justify-between">
                    {/* Left: Brand */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold text-white drop-shadow-md tracking-tight">
                            Admin<span className="text-purple-300">Panel</span>
                        </h1>
                    </div>

                    {/* Center: Navigation Links (Desktop) */}
                    <nav className="hidden md:flex items-center gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <button
                            onClick={() => navigate('/admintask')}
                            className="flex items-center gap-2 text-sm uppercase tracking-wider text-gray-300 hover:text-white transition-colors font-bold group"
                        >
                            <LayoutList className="w-4 h-4 group-hover:text-purple-400 transition-colors" />
                            <span>Tasks</span>
                        </button>
                        <button
                            onClick={() => navigate('/adminNews')}
                            className="flex items-center gap-2 text-sm uppercase tracking-wider text-gray-300 hover:text-white transition-colors font-bold group"
                        >
                            <Newspaper className="w-4 h-4 group-hover:text-pink-400 transition-colors" />
                            <span>News</span>
                        </button>
                    </nav>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-4">
                        <div
                            onClick={() => navigate('/profile')}
                            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 transition-all hover:bg-white/10 hover:border-white/20 cursor-pointer group"
                        >
                            <User className="w-4 h-4 text-purple-300 group-hover:text-white transition-colors" />
                            <span className="text-sm font-medium text-purple-100 group-hover:text-white">Profile</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-200 border border-red-500/10 transition-all font-medium text-sm"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </button>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {mobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-[#1c0b3e] border-b border-white/10 shadow-2xl z-50 animate-in slide-in-from-top-5 duration-200">
                        <div className="flex flex-col p-4 space-y-3">
                            <button
                                onClick={() => navigate('/admintask')}
                                className="flex items-center px-4 py-3 bg-white/5 text-white rounded-lg font-medium border border-white/5 hover:bg-purple-500/20 transition-colors"
                            >
                                <LayoutList className="h-5 w-5 mr-3 text-purple-400" />
                                Admin Task
                            </button>
                            <button
                                onClick={() => navigate('/adminNews')}
                                className="flex items-center px-4 py-3 bg-white/5 text-white rounded-lg font-medium border border-white/5 hover:bg-pink-500/20 transition-colors"
                            >
                                <Newspaper className="h-5 w-5 mr-3 text-pink-400" />
                                Admin News
                            </button>
                            <hr className="border-white/10 my-2" />
                            <button
                                onClick={() => navigate('/profile')}
                                className="flex items-center px-4 py-3 text-purple-200 hover:bg-white/5 rounded-lg font-medium"
                            >
                                <User className="h-5 w-5 mr-3" />
                                Profile
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center px-4 py-3 text-red-300 hover:bg-red-500/10 rounded-lg font-medium"
                            >
                                <LogOut className="h-5 w-5 mr-3" />
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1 relative z-10 flex flex-col items-center justify-center p-6 md:p-12 w-full max-w-7xl mx-auto">

                {/* Hero Section */}
                <div className="text-center mb-16 space-y-4 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 mb-2 backdrop-blur-sm">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">System Online</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-bold text-white drop-shadow-2xl tracking-tight">
                        Dashboard <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Overview</span>
                    </h2>
                    <p className="text-lg text-indigo-200/80 font-light max-w-2xl mx-auto leading-relaxed">
                        Manage your application's real-time data flow. Monitor tasks, news updates, and system metrics from a centralized control center.
                    </p>
                </div>

                {/* Cards Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                    {/* Manage Tasks Card */}
                    <div
                        onClick={() => navigate('/admintask')}
                        className="group relative overflow-hidden bg-[#1e1b4b]/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-10 cursor-pointer transition-all duration-300 hover:bg-[#1e1b4b]/60 hover:border-purple-500/30 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-purple-600/20 transition-all duration-500"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center text-purple-300 border border-white/5 group-hover:scale-110 group-hover:border-purple-500/30 transition-all duration-300 shadow-lg shadow-purple-500/10">
                                    <LayoutList className="w-8 h-8" />
                                </div>
                                <div className="text-right">
                                    <p className="text-xs uppercase font-bold text-purple-300/70 mb-1 tracking-wider">Total Active</p>
                                    {tasksLoading ? (
                                        <div className="h-8 w-16 bg-white/10 rounded animate-pulse ml-auto"></div>
                                    ) : (
                                        <h4 className="text-4xl font-bold text-white tracking-tight">{taskStats.total}</h4>
                                    )}
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Task Management</h3>
                            <p className="text-gray-400 mb-8 leading-relaxed text-sm">
                                Create and organize Daily, Weekly, and Partnership tasks. Monitor completion rates and points distribution.
                            </p>

                            <div className="flex items-center text-purple-300 font-bold text-sm tracking-wide group-hover:translate-x-2 transition-transform duration-300">
                                OPEN BOARD <ArrowRight className="w-4 h-4 ml-2" />
                            </div>
                        </div>

                        {/* Decoration Line */}
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Manage News Card */}
                    <div
                        onClick={() => navigate('/adminNews')}
                        className="group relative overflow-hidden bg-[#3f0d2c]/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-10 cursor-pointer transition-all duration-300 hover:bg-[#3f0d2c]/60 hover:border-pink-500/30 hover:-translate-y-2 hover:shadow-2xl hover:shadow-pink-500/20"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-pink-600/20 transition-all duration-500"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center text-pink-300 border border-white/5 group-hover:scale-110 group-hover:border-pink-500/30 transition-all duration-300 shadow-lg shadow-pink-500/10">
                                    <Newspaper className="w-8 h-8" />
                                </div>
                                <div className="text-right">
                                    <p className="text-xs uppercase font-bold text-pink-300/70 mb-1 tracking-wider">Published</p>
                                    {newsLoading ? (
                                        <div className="h-8 w-16 bg-white/10 rounded animate-pulse ml-auto"></div>
                                    ) : (
                                        <h4 className="text-4xl font-bold text-white tracking-tight">{newsTotal}</h4>
                                    )}
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">News Center</h3>
                            <p className="text-gray-400 mb-8 leading-relaxed text-sm">
                                Broadcast updates, announcements, and articles. Keep your community informed with rich media content.
                            </p>

                            <div className="flex items-center text-pink-300 font-bold text-sm tracking-wide group-hover:translate-x-2 transition-transform duration-300">
                                MANAGE FEED <ArrowRight className="w-4 h-4 ml-2" />
                            </div>
                        </div>

                         {/* Decoration Line */}
                         <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500/0 via-pink-500/50 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Admin;
