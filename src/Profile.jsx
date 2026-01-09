import React, { useEffect, useState } from 'react';
import { auth } from './services/FirebaseConfig';
import { User, Mail, Shield } from 'lucide-react';
import DashboardLayout from './components/DashboardLayout';

const Profile = () => {
    const user = auth.currentUser;
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate a small loading state for smooth transition
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return <div className="min-h-screen bg-gray-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm font-medium">Loading Profile...</div>;
    }

    return (
        <DashboardLayout title="Administrator Profile" subtitle="Manage your account settings and preferences">
            <div className="max-w-4xl mx-auto">
                {/* Profile Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200 dark:shadow-slate-900/50 overflow-hidden transition-colors duration-300">
                    {/* Cover Banner */}
                    <div className="h-32 bg-gradient-to-r from-slate-800 to-indigo-900 relative">
                        <div className="absolute inset-0 bg-black/20"></div>
                    </div>

                    <div className="px-8 pb-8">
                        {/* Avatar */}
                        <div className="relative -mt-16 mb-6">
                            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 shadow-md transition-colors duration-300">
                                <User className="w-16 h-16 text-slate-300 dark:text-slate-400" />
                            </div>
                        </div>

                        {/* User Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">{user?.displayName || 'Admin User'}</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">System Administrator</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 transition-colors">
                                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">Email Address</p>
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{user?.email || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 transition-colors">
                                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-md">
                                            <Shield className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">Role Permission</p>
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Super Admin (Read/Write)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Account Actions / Stats */}
                            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-6 border border-slate-100 dark:border-slate-700 transition-colors">
                                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-4">Account Overview</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b border-slate-200/60 dark:border-slate-600/50">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">Account ID</span>
                                        <span className="text-sm font-mono text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-600">{user?.uid?.substring(0, 12)}...</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-slate-200/60 dark:border-slate-600/50">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">Last Login</span>
                                        <span className="text-sm text-slate-700 dark:text-slate-300">{new Date().toLocaleDateString()}</span>
                                    </div>
                                    <div className="pt-2">
                                        <button className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Change Password</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Profile;
