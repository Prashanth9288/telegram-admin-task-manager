import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, X, LayoutList, CheckCircle2, Activity, Award } from 'lucide-react';
import DashboardLayout from './components/DashboardLayout';
import { useLocation } from 'react-router-dom';
import { dbService } from './services/dbService'; // Import Service Layer
import { useTasks } from './hooks/useRealtimeData'; // Import Hook for reading

const AdminTask = () => {
    const location = useLocation();

    // Determine active tab from URL query params, default to 'standard'
    const getCategoryFromUrl = () => {
        const searchParams = new URLSearchParams(location.search);
        return searchParams.get('category') || 'standard';
    };

    const [activeTab, setActiveTab] = useState(getCategoryFromUrl());

    // Update activeTab whenever URL changes
    useEffect(() => {
        setActiveTab(getCategoryFromUrl());
    }, [location.search]);

    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        type: '',
        points: '',
        url: '',
        total: '',
        icon: '',
        iconBg: '',
        category: 'standard', // Initial value, will be synced
    });

    // Use Custom Hook for real-time data
    const { tasks, loading, error } = useTasks();
    
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showForm, setShowForm] = useState(false);

    // List options
    const taskCategories = [
        { value: 'standard', label: 'Standard Tasks', icon: LayoutList },
        { value: 'daily', label: 'Daily Tasks', icon: Activity },
        { value: 'weekly', label: 'Weekly Tasks', icon: CheckCircle2 },
        { value: 'achievements', label: 'Achievements', icon: Award },
    ];

    const taskTypes = [
        { value: 'watch', label: 'Watch' },
        { value: 'social', label: 'Social' },
        { value: 'partnership', label: 'Partnership' },
        { value: 'misc', label: 'Misc' },
        { value: 'news', label: 'News' },
        { value: 'game', label: 'Game' },
        { value: 'referral', label: 'Referral' },
        { value: 'general', label: 'General' },
    ];

    const taskIcons = [
        { value: 'Zap', label: 'Zap', bg: 'bg-indigo-500/30' },
        { value: 'Award', label: 'Award', bg: 'bg-amber-500/30' },
        { value: 'Users', label: 'Users', bg: 'bg-amber-500/30' },
    ];

    // Sync form category with activeTab when tab changes
    useEffect(() => {
        setTaskForm(prev => ({ ...prev, category: activeTab }));
    }, [activeTab]);


    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'icon') {
            const selectedIcon = taskIcons.find(icon => icon.value === value);
            setTaskForm(prev => ({
                ...prev,
                icon: value,
                iconBg: selectedIcon ? selectedIcon.bg : ''
            }));
        } else {
            setTaskForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const resetForm = () => {
        setTaskForm({ title: '', description: '', type: '', points: '', url: '', total: '', icon: '', iconBg: '', category: activeTab });
        setEditingTaskId(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 1. Basic Requirement Check
        if (!taskForm.title || !taskForm.type || !taskForm.points) {
            showMessage('Please fill in all required fields (Title, Type, Reward)', 'error');
            return;
        }

        // 2. Data Logic Safety (Persona Requirement: Guard Writes)
        if (parseInt(taskForm.points) < 0) {
             showMessage('Points cannot be negative.', 'error');
             return;
        }

        // 3. URL Validation (Persona Requirement: Input Safety)
        if (taskForm.url && taskForm.url.length > 0 && !/^https?:\/\//i.test(taskForm.url)) {
             showMessage('Link URL must start with http:// or https://', 'error');
             return;
        }

        try {
            const payload = {
                ...taskForm,
                 category: activeTab,
                 points: parseInt(taskForm.points, 10),
                 total: activeTab === 'standard' ? 1 : parseInt(taskForm.total || 1, 10),
            };

            if (editingTaskId) {
                 // UPDATE via Service
                 await dbService.updateTask(editingTaskId, payload);
                 showMessage('Task updated successfully');
            } else {
                 // CREATE via Service
                 await dbService.addTask(payload);
                 showMessage('Task created successfully');
            }
            resetForm();
        } catch (error) {
            console.error(error);
            showMessage('Error saving task: ' + error.message, 'error');
        }
    };

    const handleEdit = (task) => {
        setTaskForm({
            title: task.title || '',
            description: task.description || '',
            type: task.type || '',
            points: task.points || task.score || '',
            url: task.url || task.videoUrl || '',
            total: task.total || '',
            icon: task.icon || '',
            iconBg: task.iconBg || '',
            category: task.category || 'standard',
        });
        setEditingTaskId(task.id);
        setShowForm(true);
        setTimeout(() => {
            document.getElementById('admin-task-form')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleDelete = async (id) => {
        // Critical Fix: Ensure we delete from the correct category path
        const taskToDelete = tasks.find(t => t.id === id);
        const category = taskToDelete?.category || activeTab;

        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await dbService.deleteTask(id, category);
                showMessage('Task deleted successfully');
            } catch (error) {
                console.error("Delete failed", error);
                showMessage('Error deleting task', 'error');
            }
        }
    };


    const getTabLabel = () => taskCategories.find(c => c.value === activeTab)?.label;

    return (
        <DashboardLayout
            title={getTabLabel()}
            subtitle={`Manage your ${activeTab} tasks`}
        >

            {/* Controls Row */}
            <div className="flex flex-wrap items-center gap-6 mb-8">
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        if (!showForm) {
                            setEditingTaskId(null);
                            setTaskForm({ title: '', description: '', type: '', points: '', url: '', total: '', icon: '', iconBg: '', category: activeTab });
                        }
                    }}
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl text-white font-bold shadow-lg transition-all transform hover:-translate-y-1 ${showForm ? 'bg-slate-700 shadow-slate-500/30' : 'bg-gradient-to-tr from-purple-600 to-purple-400 shadow-purple-500/30'}`}
                >
                    {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    <span>{showForm ? 'Close Editor' : `Add ${getTabLabel()}`}</span>
                </button>
            </div>

            {/* Message Alert */}
            {message.text && (
                <div className={`fixed top-8 right-8 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 text-white animate-in slide-in-from-top-10 fade-in duration-300 ${message.type === 'error' ? 'bg-gradient-to-tr from-red-600 to-red-400 shadow-red-500/40' : 'bg-gradient-to-tr from-green-600 to-green-400 shadow-green-500/40'}`}>
                    <span className="font-bold tracking-wide text-sm">{message.text}</span>
                </div>
            )}

            {/* FORM CARD */}
            <div
                id="admin-task-form"
                className={`transition-all duration-500 ease-in-out ${showForm ? 'max-h-[1000px] opacity-100 mb-12' : 'max-h-0 opacity-0 overflow-hidden'}`}
            >
                <div className="relative flex flex-col min-w-0 break-words bg-white dark:bg-slate-800 w-full shadow-xl shadow-slate-200 dark:shadow-slate-900/50 rounded-2xl transition-colors duration-300">
                    <div className="mx-4 -mt-6 p-4 mb-6 rounded-xl bg-gradient-to-tr from-purple-600 to-purple-400 shadow-lg shadow-purple-500/40 flex justify-between items-center text-white">
                        <h3 className="text-lg font-bold tracking-wide">
                            {editingTaskId ? `Edit ${getTabLabel()}` : `Create ${getTabLabel()}`}
                        </h3>
                        <Edit2 className="h-5 w-5 opacity-80" />
                    </div>
                    <div className="p-6 px-8 flex-auto">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                                <div className="space-y-1">
                                    <label className="text-xs uppercase text-slate-400 dark:text-slate-500 font-bold ml-1">Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={taskForm.title}
                                        onChange={handleChange}
                                        className="w-full border-b border-slate-200 dark:border-slate-700 bg-transparent py-2 px-1 text-slate-700 dark:text-slate-200 font-medium focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-colors placeholder-slate-400 dark:placeholder-slate-600"
                                        placeholder="Task Title..."
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                                <div className="space-y-1">
                                    <label className="text-xs uppercase text-slate-400 dark:text-slate-500 font-bold ml-1">Type (Action)</label>
                                    <select
                                        name="type"
                                        value={taskForm.type}
                                        onChange={handleChange}
                                        className="w-full border-b border-slate-200 dark:border-slate-700 bg-transparent py-2 px-1 text-slate-700 dark:text-slate-200 font-medium focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-colors"
                                    >
                                        <option value="" className="dark:bg-slate-800">Choose Action Type...</option>
                                        {taskTypes.filter(t => {
                                            if (activeTab === 'standard') {
                                                return ['watch', 'social', 'partnership', 'misc'].includes(t.value);
                                            } else {
                                                return ['news', 'game', 'referral', 'general'].includes(t.value);
                                            }
                                        }).map(t => (
                                            <option key={t.value} value={t.value} className="dark:bg-slate-800">{t.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                                <div className="space-y-1">
                                    <label className="text-xs uppercase text-slate-400 dark:text-slate-500 font-bold ml-1">Reward (Points)</label>
                                    <input
                                        type="number"
                                        name="points"
                                        value={taskForm.points}
                                        onChange={handleChange}
                                        className="w-full border-b border-slate-200 dark:border-slate-700 bg-transparent py-2 px-1 text-slate-700 dark:text-slate-200 font-medium focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-colors placeholder-slate-400 dark:placeholder-slate-600"
                                        placeholder="0"
                                    />
                                </div>
                                {activeTab !== 'standard' && (
                                    <div className="space-y-1">
                                        <label className="text-xs uppercase text-slate-400 dark:text-slate-500 font-bold ml-1">Total (Target)</label>
                                        <input
                                            type="number"
                                            name="total"
                                            value={taskForm.total}
                                            onChange={handleChange}
                                            className="w-full border-b border-slate-200 dark:border-slate-700 bg-transparent py-2 px-1 text-slate-700 dark:text-slate-200 font-medium focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-colors placeholder-slate-400 dark:placeholder-slate-600"
                                            placeholder="1"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                                <div className="space-y-1">
                                    <label className="text-xs uppercase text-slate-400 dark:text-slate-500 font-bold ml-1">Icon</label>
                                    <select
                                        name="icon"
                                        value={taskForm.icon}
                                        onChange={handleChange}
                                        className="w-full border-b border-slate-200 dark:border-slate-700 bg-transparent py-2 px-1 text-slate-700 dark:text-slate-200 font-medium focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-colors"
                                    >
                                        <option value="" className="dark:bg-slate-800">Choose Icon...</option>
                                        {taskIcons.map(icon => (
                                            <option key={icon.value} value={icon.value} className="dark:bg-slate-800">{icon.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs uppercase text-slate-400 dark:text-slate-500 font-bold ml-1">Icon Background (Auto)</label>
                                    <input
                                        type="text"
                                        name="iconBg"
                                        value={taskForm.iconBg}
                                        readOnly
                                        className="w-full border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 py-2 px-1 text-slate-500 dark:text-slate-500 font-medium focus:outline-none cursor-not-allowed"
                                        placeholder="Auto-generated..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-8 mb-6">
                                <div className="space-y-1">
                                    <label className="text-xs uppercase text-slate-400 dark:text-slate-500 font-bold ml-1">Link URL</label>
                                    <input
                                        type="text"
                                        name="url"
                                        value={taskForm.url}
                                        onChange={handleChange}
                                        className="w-full border-b border-slate-200 dark:border-slate-700 bg-transparent py-2 px-1 text-slate-700 dark:text-slate-200 font-medium focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-colors placeholder-slate-400 dark:placeholder-slate-600"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div className="mb-8 space-y-1">
                                <label className="text-xs uppercase text-slate-400 dark:text-slate-500 font-bold ml-1">Description</label>
                                <textarea
                                    name="description"
                                    rows="2"
                                    value={taskForm.description}
                                    onChange={handleChange}
                                    className="w-full border-b border-slate-200 dark:border-slate-700 bg-transparent py-2 px-1 text-slate-700 dark:text-slate-200 font-medium focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-colors resize-none placeholder-slate-400 dark:placeholder-slate-600"
                                    placeholder="Brief details..."
                                />
                            </div>

                            <div className="flex justify-end gap-4">
                                <button type="button" onClick={resetForm} className="px-6 py-2 rounded-lg text-slate-500 dark:text-slate-400 font-bold text-xs uppercase hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">Cancel</button>
                                <button type="submit" className="px-6 py-2 rounded-lg bg-gradient-to-tr from-purple-600 to-purple-400 text-white font-bold text-xs uppercase shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/40 transition-all">
                                    {editingTaskId ? 'Update Details' : 'Publish Activity'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Dynamic Task Table based on Active Tab */}
            <div className="mb-24">
                <TaskTable
                    title={getTabLabel()}
                    tasks={activeTab === 'standard' ? tasks : tasks.filter(t => t.category === activeTab)}
                    loading={loading}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    color={activeTab === 'standard' ? 'blue' : activeTab === 'daily' ? 'purple' : activeTab === 'weekly' ? 'pink' : 'amber'}
                />
            </div>
        </DashboardLayout>
    );
};

// Sub-component for clean tables
const TaskTable = ({ title, tasks, loading, onDelete, onEdit, color }) => {
    const colorClasses = {
        blue: 'from-blue-600 to-blue-400 shadow-blue-500/40',
        purple: 'from-purple-600 to-purple-400 shadow-purple-500/40',
        pink: 'from-pink-600 to-pink-400 shadow-pink-500/40',
        amber: 'from-amber-600 to-amber-400 shadow-amber-500/40',
    };

    return (
        <div className="relative flex flex-col min-w-0 break-words bg-white dark:bg-slate-800 w-full shadow-xl shadow-slate-200 dark:shadow-slate-900/50 rounded-2xl transition-colors duration-300">
            <div className={`mx-4 -mt-6 p-4 mb-4 rounded-xl bg-gradient-to-tr ${colorClasses[color] || colorClasses.blue} shadow-lg flex justify-between items-center text-white`}>
                <div>
                    <h3 className="text-lg font-bold tracking-wide">{title}</h3>
                    <p className="text-sm opacity-80 font-light">Manage {title ? title.toLowerCase() : 'tasks'} list.</p>
                </div>
            </div>

            <div className="block w-full overflow-x-auto p-2">
                <table className="items-center w-full bg-transparent border-collapse">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-xs uppercase align-middle bg-transparent border-b border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 font-bold text-left opacity-70">
                                Title / Detail
                            </th>
                            <th className="px-6 py-3 text-xs uppercase align-middle bg-transparent border-b border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 font-bold text-left opacity-70">
                                Type
                            </th>
                            <th className="px-6 py-3 text-xs uppercase align-middle bg-transparent border-b border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 font-bold text-left opacity-70">
                                Target / XP
                            </th>
                            <th className="px-6 py-3 text-xs uppercase align-middle bg-transparent border-b border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 font-bold text-right opacity-70">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                             <tr>
                                <td colSpan="4" className="text-center p-8">
                                    <div className="flex justify-center items-center gap-2 text-slate-400">
                                        <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span>Loading Tasks...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : tasks && tasks.length > 0 ? (
                            tasks.map((task) => (
                                <tr
                                    key={`${task.category || 'task'}-${task.id}`}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:shadow-sm transition-all duration-200"
                                >
                                    <td className="border-t-0 px-6 align-middle border-b border-slate-100 dark:border-slate-700/50 text-xs whitespace-nowrap p-4 text-left">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{task.title}</span>
                                            <span className="font-normal text-slate-400 dark:text-slate-500 text-[10px]">{task.description?.substring(0, 40)}{task.description?.length > 40 && '...'}</span>
                                        </div>
                                    </td>
                                    <td className="border-t-0 px-6 align-middle border-b border-slate-100 dark:border-slate-700/50 text-xs whitespace-nowrap p-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300`}>
                                            {task.type}
                                        </span>
                                    </td>
                                    <td className="border-t-0 px-6 align-middle border-b border-slate-100 dark:border-slate-700/50 text-xs whitespace-nowrap p-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-600 dark:text-slate-400">Total: {task.total || 1}</span>
                                            <span className="text-amber-500 font-bold">+{task.points || task.score || 0} XP</span>
                                        </div>
                                    </td>
                                    <td className="border-t-0 px-6 align-middle border-b border-slate-100 dark:border-slate-700/50 text-xs whitespace-nowrap p-4 text-right">
                                        <div className="flex justify-end gap-3">
                                            <button onClick={() => onEdit(task)} className="text-slate-400 hover:text-purple-600 transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => onDelete(task.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center p-12 text-slate-400 dark:text-slate-600 font-medium">
                                    <div className="flex flex-col items-center gap-3 opacity-60">
                                         <LayoutList className="w-10 h-10" />
                                         <span>No tasks found in this category.</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


export default AdminTask;