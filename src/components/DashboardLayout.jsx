import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutList, Newspaper, User, LogOut, Menu, X, Power, Activity, CheckCircle2, Award, Sun, Moon } from 'lucide-react'; 
import { signOut } from 'firebase/auth';
import { auth } from '../services/FirebaseConfig';
import { useTheme } from '../hooks/useTheme'; 

const DashboardLayout = ({ children, title, subtitle, sidebarExtra, subNavigation, customNavItems }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme(); 

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/', { state: { message: "Signed out successfully" } });
        } catch (error) {
            console.error("Logout Error", error);
        }
    };


    // Global Navigation Configuration
    const defaultNavItems = [
        {
            label: 'Standard Tasks',
            icon: LayoutList,
            path: '/admintask',
            search: '?category=standard',
            isActive: (pathname, search) => pathname === '/admintask' && (search.includes('category=standard') || search === '')
        },
        {
            label: 'Daily Tasks',
            icon: Activity,
            path: '/admintask',
            search: '?category=daily',
            isActive: (pathname, search) => pathname === '/admintask' && search.includes('category=daily')
        },
        {
            label: 'Weekly Tasks',
            icon: CheckCircle2,
            path: '/admintask',
            search: '?category=weekly',
            isActive: (pathname, search) => pathname === '/admintask' && search.includes('category=weekly')
        },
        {
            label: 'Achievements',
            icon: Award,
            path: '/admintask',
            search: '?category=achievements',
            isActive: (pathname, search) => pathname === '/admintask' && search.includes('category=achievements')
        },
        {
            label: 'News Feed',
            icon: Newspaper,
            path: '/adminNews',
            isActive: (pathname) => pathname === '/adminNews'
        },
    ];

    const displayNavItems = customNavItems || defaultNavItems;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-300">

            {/* Mobile Header */}
            <div className="md:hidden bg-white dark:bg-slate-800 p-4 shadow-sm flex justify-between items-center z-30 relative transition-colors duration-300">
                <div className="flex items-center gap-2">
                    <LayoutList className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    <span className="font-bold text-slate-800 dark:text-white">Admin Console</span>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-yellow-400 transition-colors">
                         {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600 dark:text-slate-300">
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-20 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="h-full flex flex-col p-4 bg-gradient-to-br from-slate-800 to-slate-900 border-r border-slate-700/50">
                    {/* Brand Desktop */}
                    <div className="hidden md:flex items-center gap-3 px-4 py-6 border-b border-white/10 mb-6">
                        <LayoutList className="h-7 w-7 text-purple-400" />
                        <span className="font-bold tracking-wider uppercase text-sm">Admin Console</span>
                    </div>

                    {/* Navigation */}
                    <div className="space-y-2 flex-1">
                        {displayNavItems.map((item, index) => {
                            const Icon = item.icon;

                            // Determine active state
                            let isActive = false;
                            if (item.isActive && typeof item.isActive === 'function') {
                                isActive = item.isActive(location.pathname, location.search);
                            } else if (item.isActive !== undefined) {
                                isActive = item.isActive;
                            } else {
                                isActive = location.pathname === item.path;
                            }

                            return (
                                <div key={index}>
                                    <button
                                        onClick={() => {
                                            if (item.onClick) {
                                                item.onClick();
                                            } else if (item.path) {
                                                // Construct full path with search params if they exist
                                                const fullPath = item.search ? `${item.path}${item.search}` : item.path;
                                                navigate(fullPath);
                                            }
                                            setMobileMenuOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all text-sm font-medium
                                            ${isActive
                                                ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-900/20'
                                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        {item.label}
                                    </button>

                                </div>
                            );
                        })}
                    </div>

                    {/* Page Specific Sidebar Content */}
                    {sidebarExtra && (
                        <div className="mb-6 pt-6 border-t border-white/10">
                            {sidebarExtra}
                        </div>
                    )}

                    {/* Profile Button */}
                    <div className="mt-auto pt-6 border-t border-white/10">
                        <button
                            onClick={() => {
                                navigate('/profile');
                                setMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all text-sm font-bold uppercase tracking-wider
                                ${location.pathname === '/profile'
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'bg-slate-800 text-purple-300 hover:bg-slate-700 hover:text-white border border-purple-500/20'
                                }`}
                        >
                            <div className={`p-1 rounded-md ${location.pathname === '/profile' ? 'bg-white/20' : 'bg-purple-500/20'}`}>
                                <User className="h-4 w-4" />
                            </div>
                            Profile
                        </button>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile sidebar */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-10 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
                {/* Desktop Top Bar */}
                <div className="hidden md:flex justify-between items-center p-8 pb-4 bg-gray-100 dark:bg-slate-900 sticky top-0 z-10 transition-colors duration-300">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">{title || 'Dashboard'}</h2>
                        {subtitle && <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">{subtitle}</p>}
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={toggleTheme} 
                            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-yellow-400 shadow-sm hover:shadow-md transition-all"
                            title="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 dark:hover:bg-red-900/10 dark:hover:text-red-400 dark:hover:border-red-900/30 transition-all shadow-sm font-medium text-sm"
                        >
                            <Power className="h-4 w-4" />
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-4 md:p-8 md:pt-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
