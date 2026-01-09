import React, { useState } from 'react';
import { dbService } from './services/dbService'; // Service Layer
import { useNews } from './hooks/useRealtimeData'; // Custom Hook
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
    ChevronDown,
    Trash2
} from 'lucide-react';
import DashboardLayout from './components/DashboardLayout';

const AdminNews = () => {
    // Real-time News Data
    const { news: newsList, loading: isLoading } = useNews();
    
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

    const [visibleCount, setVisibleCount] = useState(10);


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
                // UPDATE via Service
                await dbService.updateNews(editingNewsId, currentNews);
                toast.success('News updated');
            } else {
                // CREATE via Service
                await dbService.addNews(currentNews);
                toast.success('News added');
            }
            setNewsModalOpen(false);
            setCurrentNews({ title: '', summary: '', category: '', imageUrl: '', readMoreLink: '' });
            setEditingNewsId(null);
        } catch (error) {
            console.error(error);
            toast.error('Error saving news');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this article?")) {
            try {
                await dbService.deleteNews(id);
                toast.success("News deleted");
            } catch (error) {
                toast.error("Error deleting news");
            }
        }
    };

    const handleEdit = (item) => {
        setCurrentNews({
            title: item.title || '',
            summary: item.summary || '',
            category: item.category || '',
            imageUrl: item.imageUrl || '',
            readMoreLink: item.readMoreLink || '',
        });
        setEditingNewsId(item.id);
        setModalMode('edit');
        setNewsModalOpen(true);
    };

    // Derived state for filtering
    const filteredNews = newsList.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const visibleNews = filteredNews.slice(0, visibleCount);

    const loadMore = () => {
        setVisibleCount(prev => prev + 10);
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        // Handle legacy data where timestamp might be in seconds (10 digits) instead of ms (13 digits)
        const dateValue = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
        return new Date(dateValue).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const categories = ['General', 'Update', 'Event', 'Maintenance', 'Promotion', 'Community'];

    return (
        <DashboardLayout title="News Management" subtitle="Publish updates and announcements">
            <ToastContainer position="top-right" theme="colored" />

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-300">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search news..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-pink-500 transition-colors placeholder-slate-400 dark:placeholder-slate-500"
                    />
                </div>
                <button
                    onClick={toggleForm}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-pink-600 to-rose-500 text-white rounded-lg font-bold text-sm hover:shadow-lg hover:shadow-pink-500/30 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Create Article
                </button>
            </div>

            {/* Modal Form */}
            {newsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 border dark:border-slate-700">
                        <div className="px-6 py-4 bg-gradient-to-r from-pink-600 to-rose-500 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                {modalMode === 'add' ? <Plus className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                                {modalMode === 'add' ? 'New Article' : 'Edit Article'}
                            </h3>
                            <button onClick={toggleForm} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="p-6 md:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                                        <Type className="w-3 h-3" /> Title
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-100 dark:focus:ring-pink-900/30 transition-all"
                                        placeholder="Enter headline..."
                                        value={currentNews.title}
                                        onChange={(e) => setCurrentNews({ ...currentNews, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                                        <Tag className="w-3 h-3" /> Category
                                    </label>
                                    <select
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:border-pink-500 focus:outline-none"
                                        value={currentNews.category}
                                        onChange={(e) => setCurrentNews({ ...currentNews, category: e.target.value })}
                                    >
                                        <option value="" className="dark:bg-slate-800">Select Category</option>
                                        {categories.map(cat => <option key={cat} value={cat} className="dark:bg-slate-800">{cat}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                                    <FileText className="w-3 h-3" /> Summary
                                </label>
                                <textarea
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:border-pink-500 focus:outline-none min-h-[100px] resize-y"
                                    placeholder="Brief content overview..."
                                    value={currentNews.summary}
                                    onChange={(e) => setCurrentNews({ ...currentNews, summary: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                                    <Image className="w-3 h-3" /> Image URL (Optional)
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:border-pink-500 focus:outline-none"
                                    placeholder="https://..."
                                    value={currentNews.imageUrl}
                                    onChange={(e) => setCurrentNews({ ...currentNews, imageUrl: e.target.value })}
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                                    <ExternalLink className="w-3 h-3" /> Read More Link (Optional)
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:border-pink-500 focus:outline-none"
                                    placeholder="https://..."
                                    value={currentNews.readMoreLink}
                                    onChange={(e) => setCurrentNews({ ...currentNews, readMoreLink: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={toggleForm}
                                    className="px-6 py-2.5 rounded-lg text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-lg bg-pink-600 text-white font-bold shadow-lg shadow-pink-500/30 hover:bg-pink-700 hover:shadow-pink-600/40 transition-all flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    {modalMode === 'add' ? 'Publish Now' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* News List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500"></div>
                    </div>
                ) : visibleNews.length > 0 ? (
                    visibleNews.map((news) => (
                        <div
                            key={news.id}
                            className="group relative bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Image / Icon Placeholder */}
                                <div className="w-full md:w-48 h-32 rounded-xl bg-slate-100 dark:bg-slate-900 overflow-hidden flex-shrink-0 relative">
                                    {news.imageUrl ? (
                                        <img src={news.imageUrl} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                                            <Newspaper className="w-12 h-12" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-white uppercase tracking-wide">
                                        {news.category || 'General'}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-2">
                                         <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                                            {news.title}
                                        </h3>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleEdit(news)}
                                                className="p-2 text-slate-400 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(news.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                   
                                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2">
                                        {news.summary}
                                    </p>

                                    <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                                        <span className="flex items-center gap-1">
                                            <Activity className="w-3 h-3" />
                                            {formatDate(news.createdAt)}
                                        </span>
                                        {news.readMoreLink && (
                                            <span className="flex items-center gap-1 text-pink-500 dark:text-pink-400">
                                                <ExternalLink className="w-3 h-3" /> External Link
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                        <Newspaper className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400 font-medium">No news articles found.</p>
                        <button onClick={toggleForm} className="mt-4 text-pink-600 dark:text-pink-400 font-bold text-sm hover:underline">
                            Create your first article
                        </button>
                    </div>
                )}
            </div>

            {/* Load More */}
            {visibleNews.length < filteredNews.length && (
                <div className="mt-8 text-center">
                    <button
                        onClick={loadMore}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-full font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                    >
                        Load More <ChevronDown className="w-4 h-4" />
                    </button>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdminNews;