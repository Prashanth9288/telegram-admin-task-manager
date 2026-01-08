import React, { useState, useEffect } from 'react';
import {
    ref,
    push,
    set,
    update,
    onValue,
    serverTimestamp,
    query,
    orderByChild
} from 'firebase/database';
import { database } from "./services/FirebaseConfig";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    Newspaper,
    Plus,
    Edit3,
    Save,
    X,
    ExternalLink,
    Image,
    Tag,
    Type,
    Search,
    Activity,
    FileText,
    ChevronDown
} from 'lucide-react';
import DashboardLayout from './components/DashboardLayout';

const AdminNews = () => {
    const [newsList, setNewsList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // News Form State
    const [newsModalOpen, setNewsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentNews, setCurrentNews] = useState({
        title: '',
        summary: '',
        category: '',
        imageUrl: '',
        readMoreLink: '',
    });
    const [editingNewsId, setEditingNewsId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination / Limit State
    const [visibleCount, setVisibleCount] = useState(10);

    // Load news
    useEffect(() => {
        const newsRef = query(ref(database, 'news'), orderByChild('createdAt'));
        const unsubscribe = onValue(newsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const newsArray = Object.entries(data)
                    .map(([id, item]) => ({ id, ...item }))
                    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                setNewsList(newsArray);
            } else {
                setNewsList([]);
            }
            setIsLoading(false);
        },
            (error) => {
                toast.error(`Error: ${error.message}`);
                setIsLoading(false);
            }
        );
        return () => unsubscribe();
    }, []);

    // Reset pagination when search changes
    useEffect(() => {
        setVisibleCount(10);
    }, [searchTerm]);

    // Toggle Form
    const toggleForm = () => {
        if (newsModalOpen) {
            setNewsModalOpen(false);
            setEditingNewsId(null);
            setCurrentNews({ title: '', summary: '', category: '', imageUrl: '', readMoreLink: '' });
        } else {
            setModalMode('add');
            setCurrentNews({ title: '', summary: '', category: '', imageUrl: '', readMoreLink: '' });
            setEditingNewsId(null);
            setNewsModalOpen(true);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!currentNews.title || !currentNews.summary || !currentNews.category) {
            toast.error('Required fields missing');
            return;
        }

        try {
            if (modalMode === 'edit' && editingNewsId) {
                await update(ref(database, `news/${editingNewsId}`), {
                    ...currentNews,
                    updatedAt: serverTimestamp()
                });
                toast.success('News updated');
            } else {
                const newNewsRef = push(ref(database, 'news'));
                await set(newNewsRef, {
                    ...currentNews,
                    createdAt: serverTimestamp()
                });
                toast.success('News added');
            }
            setNewsModalOpen(false);
            setCurrentNews({ title: '', summary: '', category: '', imageUrl: '', readMoreLink: '' });
            setEditingNewsId(null);
        } catch (error) {
            toast.error(`Error: ${error.message}`);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '-';
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(timestamp));
    };

    const filteredNews = newsList.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const displayedNews = filteredNews.slice(0, visibleCount);

    return (
        <DashboardLayout title="News Management" subtitle="Publish and manage articles">
            <ToastContainer theme="colored" position="bottom-right" />

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="relative flex flex-col min-w-0 break-words bg-white shadow-xl rounded-2xl bg-clip-border">
                    <div className="absolute -top-4 left-4 p-4 bg-gradient-to-tr from-gray-900 to-gray-800 rounded-xl shadow-lg shadow-gray-900/40 text-white">
                        <Newspaper className="w-6 h-6" />
                    </div>
                    <div className="p-4 text-right">
                        <p className="block antialiased font-sans text-sm leading-normal font-normal text-blue-gray-600">Total Articles</p>
                        <h4 className="block antialiased tracking-normal font-sans text-2xl font-semibold leading-snug text-blue-gray-900">{newsList.length}</h4>
                    </div>
                    <div className="border-t border-blue-gray-50 p-4">
                        <div className="flex items-center gap-2 text-emerald-500 text-sm font-bold">
                            <Activity className="h-4 w-4 animate-pulse" />
                            <span className="font-normal text-slate-500">System Status: <span className="text-emerald-500 font-bold">Online</span></span>
                        </div>
                    </div>
                </div>

                {/* Action Card to Trigger Form */}
                <div
                    onClick={toggleForm}
                    className="relative flex flex-col min-w-0 break-words bg-white shadow-xl rounded-2xl bg-clip-border cursor-pointer hover:-translate-y-1 transition-transform group"
                >
                    <div className={`absolute -top-4 left-4 p-4 rounded-xl shadow-lg text-white transition-colors ${newsModalOpen ? 'bg-gradient-to-tr from-red-600 to-red-400 shadow-red-500/40' : 'bg-gradient-to-tr from-green-600 to-green-400 shadow-green-500/40'}`}>
                        {newsModalOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                    </div>
                    <div className="p-4 text-right">
                        <p className="block antialiased font-sans text-sm leading-normal font-normal text-blue-gray-600">Quick Action</p>
                        <h4 className="block antialiased tracking-normal font-sans text-2xl font-semibold leading-snug text-blue-gray-900 group-hover:text-purple-600 transition-colors">
                            {newsModalOpen ? 'Close Editor' : 'Publish News'}
                        </h4>
                    </div>
                    <div className="border-t border-blue-gray-50 p-4">
                        <p className="block antialiased font-sans text-base leading-relaxed font-normal text-slate-500">
                            Click to toggle editor
                        </p>
                    </div>
                </div>
            </div>


            {/* FORM CARD */}
            <div
                id="admin-news-form"
                className={`transition-all duration-500 ease-in-out ${newsModalOpen ? 'max-h-[1000px] opacity-100 mb-12' : 'max-h-0 opacity-0 overflow-hidden'}`}
            >
                <div className="relative flex flex-col min-w-0 break-words bg-white w-full shadow-xl shadow-slate-200 rounded-2xl">
                    <div className="mx-4 -mt-6 p-4 mb-6 rounded-xl bg-gradient-to-tr from-purple-600 to-purple-400 shadow-lg shadow-purple-500/40 flex justify-between items-center text-white">
                        <h3 className="text-lg font-bold tracking-wide">
                            {modalMode === 'edit' ? 'Edit Article' : 'Publish New Article'}
                        </h3>
                        <Edit3 className="h-5 w-5 opacity-80" />
                    </div>
                    <div className="p-6 px-8 flex-auto">
                        <form onSubmit={handleFormSubmit}>
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <label className="text-xs uppercase text-slate-400 font-bold ml-1">Article Title</label>
                                    <div className="flex items-center">
                                        <Type className="h-5 w-5 text-slate-400 mr-2" />
                                        <input
                                            value={currentNews.title}
                                            onChange={e => setCurrentNews({ ...currentNews, title: e.target.value })}
                                            className="w-full border-b border-slate-200 bg-transparent py-2 px-1 text-slate-700 font-medium focus:border-purple-500 focus:outline-none transition-colors"
                                            placeholder="Enter headline..."
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs uppercase text-slate-400 font-bold ml-1">Summary</label>
                                    <div className="flex items-start">
                                        <FileText className="h-5 w-5 text-slate-400 mr-2 mt-2" />
                                        <textarea
                                            value={currentNews.summary}
                                            onChange={e => setCurrentNews({ ...currentNews, summary: e.target.value })}
                                            className="w-full border-b border-slate-200 bg-transparent py-2 px-1 text-slate-700 font-medium focus:border-purple-500 focus:outline-none transition-colors resize-none"
                                            rows="2"
                                            placeholder="Short description..."
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-1">
                                        <label className="text-xs uppercase text-slate-400 font-bold ml-1">Category</label>
                                        <div className="flex items-center">
                                            <Tag className="h-5 w-5 text-slate-400 mr-2" />
                                            <input
                                                value={currentNews.category}
                                                onChange={e => setCurrentNews({ ...currentNews, category: e.target.value })}
                                                className="w-full border-b border-slate-200 bg-transparent py-2 px-1 text-slate-700 font-medium focus:border-purple-500 focus:outline-none transition-colors"
                                                placeholder="e.g. Updates"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs uppercase text-slate-400 font-bold ml-1">Image URL (Optional)</label>
                                        <div className="flex items-center">
                                            <Image className="h-5 w-5 text-slate-400 mr-2" />
                                            <input
                                                value={currentNews.imageUrl}
                                                onChange={e => setCurrentNews({ ...currentNews, imageUrl: e.target.value })}
                                                className="w-full border-b border-slate-200 bg-transparent py-2 px-1 text-slate-700 font-medium focus:border-purple-500 focus:outline-none transition-colors"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs uppercase text-slate-400 font-bold ml-1">Read More Link (Optional)</label>
                                    <div className="flex items-center">
                                        <ExternalLink className="h-5 w-5 text-slate-400 mr-2" />
                                        <input
                                            value={currentNews.readMoreLink}
                                            onChange={e => setCurrentNews({ ...currentNews, readMoreLink: e.target.value })}
                                            className="w-full border-b border-slate-200 bg-transparent py-2 px-1 text-slate-700 font-medium focus:border-purple-500 focus:outline-none transition-colors"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 mt-8">
                                <button type="button" onClick={toggleForm} className="px-6 py-2 rounded-lg text-slate-500 font-bold text-xs uppercase hover:bg-slate-100 transition-all">Cancel</button>
                                <button type="submit" className="px-6 py-2 rounded-lg bg-gradient-to-tr from-purple-600 to-purple-400 text-white font-bold text-xs uppercase shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/40 transition-all flex items-center gap-2">
                                    <Save className="h-4 w-4" />
                                    {modalMode === 'edit' ? 'Update News' : 'Publish News'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* TABLE CARD */}
            <div className="relative flex flex-col min-w-0 break-words bg-white w-full shadow-xl shadow-slate-200 rounded-2xl mb-24">
                <div className="mx-4 -mt-6 p-4 mb-4 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 shadow-lg shadow-blue-500/40 flex justify-between items-center text-white">
                    <div>
                        <h3 className="text-lg font-bold tracking-wide">News Feed</h3>
                        <p className="text-sm opacity-80 font-light">Existing news and updates.</p>
                    </div>
                    <div className="bg-white/20 rounded-lg p-1 flex items-center">
                        <Search className="h-4 w-4 text-white ml-2" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search..."
                            className="bg-transparent border-none focus:ring-0 text-white placeholder:text-white/70 text-sm w-32 md:w-48"
                        />
                    </div>
                </div>

                <div className="block w-full overflow-x-auto p-2">
                    <table className="items-center w-full bg-transparent border-collapse">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-xs uppercase align-middle bg-transparent border-b border-slate-100 text-slate-400 font-bold text-left opacity-70">ID</th>
                                <th className="px-6 py-3 text-xs uppercase align-middle bg-transparent border-b border-slate-100 text-slate-400 font-bold text-left opacity-70">Title / Summary</th>
                                <th className="px-6 py-3 text-xs uppercase align-middle bg-transparent border-b border-slate-100 text-slate-400 font-bold text-left opacity-70">Category</th>
                                <th className="px-6 py-3 text-xs uppercase align-middle bg-transparent border-b border-slate-100 text-slate-400 font-bold text-left opacity-70">Date</th>
                                <th className="px-6 py-3 text-xs uppercase align-middle bg-transparent border-b border-slate-100 text-slate-400 font-bold text-right opacity-70">View</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-500">Loading...</td></tr>
                            ) : displayedNews.length > 0 ? (
                                displayedNews.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-purple-50 hover:shadow-md transition-all duration-200">
                                        <td className="border-t-0 px-6 align-middle border-b border-slate-100 text-xs whitespace-nowrap p-4 text-left text-slate-500 font-mono">
                                            #{index + 1}
                                        </td>
                                        <td className="border-t-0 px-6 align-middle border-b border-slate-100 text-xs whitespace-nowrap p-4 text-left">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700 text-sm max-w-xs truncate">{item.title}</span>
                                                <span className="font-normal text-slate-400 max-w-xs truncate">{item.summary}</span>
                                            </div>
                                        </td>
                                        <td className="border-t-0 px-6 align-middle border-b border-slate-100 text-xs whitespace-nowrap p-4">
                                            <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-600">
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="border-t-0 px-6 align-middle border-b border-slate-100 text-xs whitespace-nowrap p-4 text-slate-500">
                                            {formatDate(item.createdAt)}
                                        </td>
                                        <td className="border-t-0 px-6 align-middle border-b border-slate-100 text-xs whitespace-nowrap p-4 text-right">
                                            <a
                                                href="https://web3today-website.vercel.app/blog"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-end gap-1 text-slate-400 hover:text-indigo-600 font-bold uppercase text-xs transition-colors group/link"
                                            >
                                                <span className="group-hover/link:underline">Open</span>
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center p-8 text-slate-400 font-medium">
                                        No news found. Publish a new article above.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* View More Button */}
                {visibleCount < filteredNews.length && (
                    <div className="p-4 flex justify-center border-t border-slate-100">
                        <button
                            onClick={() => setVisibleCount(filteredNews.length)}
                            className="flex items-center gap-2 px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-indigo-100 transition-all"
                        >
                            View All News ({filteredNews.length - visibleCount} more)
                            <ChevronDown className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AdminNews;