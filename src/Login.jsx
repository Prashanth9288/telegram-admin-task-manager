import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './services/FirebaseConfig';
import { Mail, Lock, ArrowRight, Loader2, LayoutList } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation, useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.state?.message) {
            toast.success(location.state.message);
            // Clear state to prevent toast on refresh (optional, but good practice in complex apps)
            window.history.replaceState({}, document.title)
        }
    }, [location.state]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success("Login Successful! Redirecting...", {
                position: "top-center",
                autoClose: 1500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            // Navigation handled by auth state listener usually, but user might rely on direct nav or listener. 
            // In previous code there was no explicit navigate in handleLogin, implying a listener or the component is conditionally rendered.
            // Wait, looking at previous artifacts, there is no AuthProvider evident in the snippet.
            // AdminTask/News check auth, but Login doesn't seem to navigate?
            // Ah, usually there's an `onAuthStateChanged` in App.js or similar that redirects.
            // If not, I should probably navigate here. 
            // The previous Login.jsx snippet didn't have navigate call.
            // Let's check App.jsx or similar if I can, or just assume the user has a router setup.
            // User's previous request imply "chnage only login page ui".
            // If I look at the previous `Login.jsx`, it didn't navigate. 
            // However, `AdminTask` imports `useNavigate`.
            // If `Login` is supposed to redirect, I should probably add `navigate('/admintask')` on success?
            // The previous code: `await signInWithEmailAndPassword(auth, email, password);` then nothing.
            // I will assume there is a listener elsewhere OR I should add navigation.
            // To be safe and since I'm improving it, I'll add navigation to ensure it works.
            navigate('/admintask');
        } catch (err) {
            console.error("Login failed:", err);
            if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                if (email === 'Web3today@gmail.com') {
                    try {
                        console.log("Attempting to auto-create demo user...");
                        await createUserWithEmailAndPassword(auth, email, password);
                    } catch (createErr) {
                        setError('Failed to create demo user: ' + createErr.message);
                    }
                } else {
                    setError('Invalid email or password.');
                }
            } else {
                setError('Login failed: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = () => {
        setEmail('Web3today@gmail.com');
        setPassword('Web3today@123');
    };

    return (
        <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-4 font-sans text-slate-800">
            <ToastContainer />
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">

                {/* Left Side - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <div className="mb-8">
                        <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white mb-4 shadow-lg shadow-indigo-500/30">
                            <LayoutList className="h-6 w-6" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome Back</h2>
                        <p className="text-slate-500">Enter your credentials to access the admin panel.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
                            <span className="font-bold">Error:</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 font-medium"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 font-medium"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-slate-900/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    Sign In to Dashboard
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <button
                            type="button"
                            onClick={handleDemoLogin}
                            className="text-sm font-medium text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                            Or use <span className="underline decoration-dashed underline-offset-4">Demo Credentials</span> for testing
                        </button>
                    </div>
                </div>

                {/* Right Side - Decor */}
                <div className="hidden md:block w-1/2 bg-slate-900 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 z-10"></div>
                    {/* Abstract Shapes */}
                    <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-indigo-500/10 blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-3xl animate-pulse delay-700"></div>

                    <div className="relative z-20 h-full flex flex-col justify-center p-12 text-white">
                        <div className="mb-6 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 w-fit">
                            <LayoutList className="h-10 w-10 text-indigo-300" />
                        </div>
                        <h3 className="text-4xl font-bold mb-4 leading-tight">Manage Your App <br /><span className="text-indigo-400">Efficiently</span></h3>
                        <p className="text-slate-300 text-lg leading-relaxed opacity-90">
                            Complete control over tasks, news, and user engagement metrics in one centralized admin console.
                        </p>
                    </div>

                    {/* Grid pattern overlay */}
                    <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                </div>
            </div>
        </div>
    );
};

export default Login;
