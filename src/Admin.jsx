import React, { useState } from 'react';
import { auth } from './services/FirebaseConfig';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { LayoutList, Newspaper, LogOut, User, ArrowRight, Menu, X } from 'lucide-react';

const Admin = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        signOut(auth).then(() => {
            navigate('/');
        });
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col relative overflow-hidden font-sans text-white">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-grid-pattern"></div>
                <div className="absolute top-[10%] left-[20%] w-32 h-32 bg-purple-500/20 blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[20%] right-[20%] w-40 h-40 bg-pink-500/20 blur-[120px] animate-pulse delay-1000"></div>
            </div>

            {/* Navbar */}
            <header className="relative z-50 w-full border-b border-white/10 bg-[#2e1065]/50 backdrop-blur-xl">
                <div className="w-full px-4 md:px-8 h-20 flex items-center justify-between">
                    {/* Left: Brand */}
                    <div className="flex-shrink-0">
                        <h1 className="text-xl md:text-2xl font-bold text-white drop-shadow-md">
                            Admin Dashboard
                        </h1>
                    </div>

                    {/* Center: Navigation Links (Desktop) */}
                    <nav className="hidden md:flex items-center gap-6 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <button
                            onClick={() => navigate('/admintask')}
                            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors font-medium"
                        >
                            <LayoutList className="w-5 h-5" />
                            <span>Admin Task</span>
                        </button>
                        <button
                            onClick={() => navigate('/adminNews')}
                            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors font-medium"
                        >
                            <Newspaper className="w-5 h-5" />
                            <span>Admin News</span>
                        </button>
                    </nav>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-4">
                        <div
                            onClick={() => navigate('/profile')}
                            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 transition-colors hover:bg-white/10 cursor-pointer"
                        >
                            <User className="w-4 h-4 text-purple-300" />
                            <span className="text-sm font-medium text-purple-100">Admin Profile</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-200 border border-pink-500/10 transition-all font-medium"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </button>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-white/70 hover:text-white"
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {mobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-[#2e1065] border-b border-white/10 shadow-2xl z-50 animate-fade-in-down">
                        <div className="flex flex-col p-4 space-y-4">
                            <button
                                onClick={() => navigate('/admintask')}
                                className="flex items-center px-4 py-3 bg-white/10 text-white rounded-lg font-medium border border-white/10"
                            >
                                <LayoutList className="h-5 w-5 mr-3" />
                                Admin Task
                            </button>
                            <button
                                onClick={() => navigate('/adminNews')}
                                className="flex items-center px-4 py-3 text-white/70 hover:bg-white/5 rounded-lg font-medium"
                            >
                                <Newspaper className="h-5 w-5 mr-3" />
                                Admin News
                            </button>
                            <div className="h-px bg-white/10 my-2"></div>
                            <button
                                onClick={() => navigate('/profile')}
                                className="flex items-center px-4 py-3 text-purple-200 hover:bg-white/5 rounded-lg font-medium"
                            >
                                <User className="h-5 w-5 mr-3" />
                                Admin Profile
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
            <main className="flex-1 relative z-10 flex flex-col items-center justify-center p-6 md:p-12 w-full">

                {/* Hero Section */}
                <div className="text-center mb-16 space-y-3 animate-fade-in-up">
                    <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                        Welcome back, Admin!
                    </h2>
                    <p className="text-lg text-indigo-200 font-light">
                        Select an area to manage from the dashboard below.
                    </p>
                </div>

                {/* Cards Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
                    {/* Manage Tasks Card */}
                    <div
                        onClick={() => navigate('/admintask')}
                        className="group relative overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-10 cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/20"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-purple-500/20 transition-all"></div>

                        <div className="relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center mb-6 text-purple-300 border border-white/5 group-hover:scale-110 transition-transform duration-300">
                                <LayoutList className="w-7 h-7" />
                            </div>

                            <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">Manage Tasks</h3>
                            <p className="text-gray-400 mb-8 leading-relaxed max-w-sm">
                                Create, edit, and delete tasks for the Telegram Mini App. Set rewards and types efficiently.
                            </p>

                            <div className="flex items-center text-purple-300 font-bold group-hover:translate-x-2 transition-transform duration-300">
                                Go to Tasks <ArrowRight className="w-5 h-5 ml-2" />
                            </div>
                        </div>
                    </div>

                    {/* Manage News Card */}
                    <div
                        onClick={() => navigate('/adminNews')}
                        className="group relative overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-10 cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 hover:shadow-2xl hover:shadow-pink-500/20"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-pink-500/20 transition-all"></div>

                        <div className="relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center mb-6 text-pink-300 border border-white/5 group-hover:scale-110 transition-transform duration-300">
                                <Newspaper className="w-7 h-7" />
                            </div>

                            <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">Manage News</h3>
                            <p className="text-gray-400 mb-8 leading-relaxed max-w-sm">
                                Post updates, announcements, and news articles for the community seamlessly.
                            </p>

                            <div className="flex items-center text-pink-300 font-bold group-hover:translate-x-2 transition-transform duration-300">
                                Go to News <ArrowRight className="w-5 h-5 ml-2" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Admin;
