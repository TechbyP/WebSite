import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/AuthContext';
import { db } from '../../firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit, deleteDoc, updateDoc, addDoc } from 'firebase/firestore';
import { logActivity } from '../../utils/activityLogger';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';
import { FiGlobe, FiMoon, FiSun } from 'react-icons/fi';
import {
    FiHome,
    FiEdit,
    FiBell,
    FiUsers,
    FiFileText,
    FiImage,
    FiLogOut,
    FiTrash2,
    FiSave,
    FiX,
    FiChevronDown,
    FiChevronUp,
    FiExternalLink
} from 'react-icons/fi';
import BlogPostEditor from '../blog/BlogPostEditor';
import HeroPageEditor from '../hero/HeroPageEditor';
import AnnouncementEditor from '../announcement/AnnouncementEditor';
import Logo from '../../assets/pictures/techbyp.png';
import TechBypLogoDark from '../../assets/pictures/techbypLogoDark.png'
import logo_small from '../../assets/pictures/Logo-Symbol.png';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmationDialog } from './ui/ConfirmationDialog';
import { Skeleton } from './ui/Skeleton';

// Type definitions
type SiteStats = {
    articles: number;
    announcements: number;
};

type Comment = {
    id: string;
    userName: string;
    text: string;
    timestamp: any;
    company: string;
    rating: number;
    edited?: boolean;
    editedAt?: Date;
};

type Activity = {
    id: string;
    event: string;
    timestamp?: any;
    userEmail?: string;
    userId?: string;
    metadata?: any;
};

type ClubMember = {
    id: string;
    email: string;
    name: string;
    source: string;
    joinedDate: any;
};

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [siteStats, setSiteStats] = useState<SiteStats>({
        articles: 0,
        announcements: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState('editor');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
    const [latestComments, setLatestComments] = useState<Comment[]>([]);
    const [latestClubMembers, setLatestClubMembers] = useState<ClubMember[]>([]);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editedCommentText, setEditedCommentText] = useState('');
    const [editedCommentName, setEditedCommentName] = useState('');
    const [editedCommentCompany, setEditedCommentCompany] = useState('');
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        onCancel: () => { }
    });

    // Add dark mode state and toggle function
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    // Apply dark mode class to document
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    const getDisplayName = useCallback((email: string): string => {
        const nameMap: Record<string, string> = {
            "d.alex@techbyp.com": "David",
            "b.peters@techbyp.com": "Benny",
            "m.peters@techbyp.com": "Mattze"
        };

        return nameMap[email.toLowerCase()] || t('adminDashboard.user.role.editor');
    }, [t]);

    const displayName: string = user ? getDisplayName(user.email ?? "") : t('adminDashboard.user.role.editor');

    const fetchLatestCommentsAndMembers = useCallback(async () => {
        try {
            // Fetch latest 15 comments
            const commentsQuery = query(
                collection(db, 'comments'),
                orderBy('timestamp', 'desc'),
                limit(15)
            );
            const commentsSnapshot = await getDocs(commentsQuery);
            setLatestComments(commentsSnapshot.docs.map(doc => ({
                id: doc.id,
                userName: doc.data().name || 'Anonymous',
                text: doc.data().text,
                timestamp: doc.data().timestamp,
                company: doc.data().company,
                rating: doc.data().rating,
                edited: doc.data().edited,
                editedAt: doc.data().editedAt
            })));

            // Fetch latest 10 club members
            const membersQuery = query(
                collection(db, 'club_members'),
                orderBy('timestamp', 'desc'),
                limit(10)
            );
            const membersSnapshot = await getDocs(membersQuery);

            setLatestClubMembers(membersSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    email: data.email,
                    name: data.name || data.email.split('@')[0],
                    source: data.source || 'unknown',
                    joinedDate: data.timestamp
                };
            }));

        } catch (error) {
            console.error('Error fetching comments or club members:', error);
            toast.error('Failed to load comments or club members');
        }
    }, []);

    const handleDeleteMember = async (memberId: string) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Delete Member',
            message: 'Are you sure you want to delete this member? This action cannot be undone.',
            onConfirm: async () => {
                try {
                    const memberToDelete = latestClubMembers.find(m => m.id === memberId);
                    if (!memberToDelete) {
                        toast.error('Member not found');
                        return;
                    }

                    await deleteDoc(doc(db, 'club_members', memberId));
                    toast.success('Member deleted successfully');

                    // Log the member deletion activity
                    await addDoc(collection(db, 'analytics'), {
                        event: 'member_deleted',
                        userId: user?.uid,
                        userEmail: user?.email,
                        timestamp: new Date(),
                        metadata: {
                            memberId: memberId,
                            email: memberToDelete.email,
                            deletedBy: user?.email || 'admin'
                        }
                    });

                    await Promise.all([fetchLatestCommentsAndMembers(), fetchRecentActivity()]);
                } catch (error) {
                    console.error('Error deleting member:', error);
                    toast.error('Failed to delete member');
                }
            },
            onCancel: () => { }
        });
    };

    const fetchRecentActivity = useCallback(async () => {
        try {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            // Updated query to include member events
            const q = query(
                collection(db, 'analytics'),
                where('timestamp', '>=', oneWeekAgo),
                where('event', 'in', [
                    'comment_added',
                    'content_created',
                    'content_updated',
                    'comment_edited',
                    'comment_deleted',
                    'member_joined',
                    'member_deleted'
                ]),
                orderBy('timestamp', 'desc'),
                limit(20)
            );
            const snapshot = await getDocs(q);
            setRecentActivity(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error('Error fetching activity:', error);
            toast.error(t('adminDashboard.activity.fetchError'));
        }
    }, [t]);

    const fetchSiteStats = useCallback(async () => {
        setIsLoading(true);
        try {
            const [articlesSnapshot, announcementsSnapshot] = await Promise.all([
                getDocs(collection(db, 'articles')),
                getDocs(collection(db, 'announcements'))
            ]);

            setSiteStats({
                articles: articlesSnapshot.size,
                announcements: announcementsSnapshot.size
            });
        } catch (error) {
            console.error('Error fetching site stats:', error);
            toast.error(t('adminDashboard.stats.fetchError'));
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    const handleEditComment = (comment: Comment) => {
        setEditingCommentId(comment.id);
        setEditedCommentText(comment.text);
        setEditedCommentName(comment.userName);
        setEditedCommentCompany(comment.company);
    };

    const handleSaveComment = async (commentId: string) => {
        try {
            await updateDoc(doc(db, 'comments', commentId), {
                text: editedCommentText,
                name: editedCommentName,
                company: editedCommentCompany,
                edited: true,
                editedAt: new Date()
            });

            await addDoc(collection(db, 'analytics'), {
                event: 'comment_edited',
                userId: user?.uid,
                userEmail: user?.email,
                timestamp: new Date(),
                metadata: {
                    commentId: commentId,
                    previousText: latestComments.find(c => c.id === commentId)?.text,
                    newText: editedCommentText
                }
            });

            toast.success(t('adminDashboard.comments.updateSuccess'));
            setEditingCommentId(null);
            await Promise.all([fetchLatestCommentsAndMembers(), fetchRecentActivity()]);
        } catch (error) {
            console.error('Error updating comment:', error);
            toast.error(t('adminDashboard.comments.updateError'));
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        setConfirmDialog({
            isOpen: true,
            title: t('adminDashboard.confirmation.deleteComment.title'),
            message: t('adminDashboard.confirmation.deleteComment.message'),
            onConfirm: async () => {
                try {
                    await deleteDoc(doc(db, 'comments', commentId));
                    toast.success(t('adminDashboard.comments.deleteSuccess'));
                    await Promise.all([fetchLatestCommentsAndMembers(), fetchRecentActivity()]);
                } catch (error) {
                    console.error('Error deleting comment:', error);
                    toast.error(t('adminDashboard.comments.deleteError'));
                }
            },
            onCancel: () => { }
        });
    };

    const checkPermissions = useCallback(async () => {
        if (!user) return;

        try {
            const userDoc = await getDoc(doc(db, 'users', user?.email));
            if (userDoc.exists()) {
                setUserRole(userDoc.data().role || 'admin');
            }
        } catch (error) {
            console.error('Error checking permissions:', error);
            toast.error(t('adminDashboard.permissionsError'));
        }
    }, [user, t]);

    useEffect(() => {
        checkPermissions();
        fetchSiteStats();
        fetchRecentActivity();
        fetchLatestCommentsAndMembers();
    }, [checkPermissions, fetchSiteStats, fetchRecentActivity, fetchLatestCommentsAndMembers]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'blog':
                return <BlogPostEditor />;
            case 'hero':
                return <HeroPageEditor />;
            case 'announcements':
                return <AnnouncementEditor />;
            case 'dashboard':
            default:
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Stats Cards */}
                        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <DashboardCard
                                title={t('adminDashboard.stats.articles')}
                                value={siteStats.articles}
                                change={`${siteStats.articles > 0 ? '+' : ''}${Math.round((siteStats.articles / 7) * 100)}% ${t('adminDashboard.common.thisWeek')}`}
                                icon={<FiFileText className="w-6 h-6" />}
                                loading={isLoading}
                                isDarkMode={isDarkMode}
                            />
                            <DashboardCard
                                title={t('adminDashboard.stats.announcements')}
                                value={siteStats.announcements}
                                change={`${siteStats.announcements > 0 ? '+' : ''}${Math.round((siteStats.announcements / 1) * 100)}% ${t('adminDashboard.common.today')}`}
                                icon={<FiBell className="w-6 h-6" />}
                                loading={isLoading}
                                isDarkMode={isDarkMode}
                            />
                        </div>

                        {/* Comments Section */}
                        <div className={`lg:col-span-2 rounded-xl shadow-lg p-6 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className={`text-lg font-black uppercase ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                    {t('adminDashboard.stats.comments')}
                                </h3>
                                <span className={`text-xs ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-brandgreen/10 text-brandgreen'} px-2 py-1 rounded-full`}>
                                    {latestComments.length} {t('adminDashboard.comments.count')}
                                </span>
                            </div>
                            {latestComments.length === 0 ? (
                                <p className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {t('adminDashboard.comments.noComments')}
                                </p>
                            ) : (
                                <ul className="space-y-3 max-h-96 overflow-auto pr-2">
                                    {latestComments.map(comment => (
                                        <motion.li
                                            key={comment.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`${isDarkMode ? 'bg-gray-700/70 hover:bg-gray-700/90 border-gray-600' : 'bg-white/70 hover:bg-white/90 border-gray-100'} transition-all duration-200 rounded-lg p-4 shadow-sm border`}
                                        >
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className="w-8 h-8 rounded-full bg-brandgreen flex items-center justify-center text-white font-medium text-sm">
                                                            {comment.userName?.charAt(0)?.toUpperCase() || 'A'}
                                                        </div>
                                                        <div>
                                                            <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{comment.userName}</p>
                                                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{comment.company}</p>
                                                        </div>
                                                        <div className="ml-auto flex items-center">
                                                            {[...Array(5)].map((_, i) => (
                                                                <span
                                                                    key={i}
                                                                    className={`text-lg ${i < comment.rating ? 'text-yellow-400' : isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}
                                                                >
                                                                    ★
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {editingCommentId === comment.id ? (
                                                        <div className="mt-2 space-y-2">
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <div>
                                                                    <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                        {t('adminDashboard.comments.name')}
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={editedCommentName}
                                                                        onChange={(e) => setEditedCommentName(e.target.value)}
                                                                        className={`w-full p-2 rounded-lg text-sm focus:ring-2 focus:ring-brandgreen focus:border-transparent ${isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'border border-gray-200'}`}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className={`block text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                        {t('adminDashboard.comments.company')}
                                                                    </label>
                                                                    <input
                                                                        type="text"
                                                                        value={editedCommentCompany}
                                                                        onChange={(e) => setEditedCommentCompany(e.target.value)}
                                                                        className={`w-full p-2 rounded-lg text-sm focus:ring-2 focus:ring-brandgreen focus:border-transparent ${isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'border border-gray-200'}`}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <textarea
                                                                value={editedCommentText}
                                                                onChange={(e) => setEditedCommentText(e.target.value)}
                                                                className={`w-full p-2 rounded-lg text-sm focus:ring-2 focus:ring-brandgreen focus:border-transparent ${isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'border border-gray-200'}`}
                                                                rows={3}
                                                                autoFocus
                                                            />
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleSaveComment(comment.id)}
                                                                    className="flex items-center gap-1 px-3 py-1.5 bg-brandgreen hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                                                                >
                                                                    <FiSave className="w-3 h-3" />
                                                                    {t('adminDashboard.comments.save')}
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingCommentId(null)}
                                                                    className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                                                                >
                                                                    <FiX className="w-3 h-3" />
                                                                    {t('adminDashboard.comments.cancel')}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p className={`text-sm mt-1 whitespace-pre-line ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                                {comment.text || t('adminDashboard.comments.noContent')}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                                    {comment.timestamp?.toDate().toLocaleString()}
                                                                </span>
                                                                {comment.edited && (
                                                                    <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                                        • {t('adminDashboard.comments.edited')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                {editingCommentId !== comment.id && (
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleEditComment(comment)}
                                                            className={`p-1.5 hover:text-brandgreen rounded-full transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-gray-600' : 'text-gray-500 hover:bg-brandgreen/10'}`}
                                                            aria-label={t('adminDashboard.comments.edit')}
                                                        >
                                                            <FiEdit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteComment(comment.id)}
                                                            className={`p-1.5 hover:text-red-600 rounded-full transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-gray-600' : 'text-gray-500 hover:bg-red-100'}`}
                                                            aria-label={t('adminDashboard.comments.delete')}
                                                        >
                                                            <FiTrash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Club Members Section */}
                        <div className={`lg:col-span-1 rounded-xl shadow-lg p-6 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <h3 className={`text-lg font-black uppercase mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                {t('adminDashboard.stats.members')}
                            </h3>
                            {latestClubMembers.length === 0 ? (
                                <p className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {t('adminDashboard.members.noMembers')}
                                </p>
                            ) : (
                                <ul className="space-y-3 max-h-96 overflow-auto">
                                    {latestClubMembers.map(member => (
                                        <motion.li
                                            key={member.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`${isDarkMode ? 'bg-gray-700/70 hover:bg-gray-700/90 border-gray-600' : 'bg-white/70 hover:bg-white/90 border-gray-100'} transition-all duration-200 rounded-lg p-4 shadow-sm border`}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className="w-10 h-10 rounded-full bg-brandgreen flex items-center justify-center text-white font-medium">
                                                        {member.name?.charAt(0)?.toUpperCase() || 'M'}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className={`text-sm font-medium break-all ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                                            {member.name || t('adminDashboard.members.unknownMember')}
                                                        </p>
                                                        <p className={`text-xs break-all ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{member.email}</p>
                                                        <div className="flex justify-between items-center">
                                                            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                                {t('adminDashboard.members.joined')}: {member.joinedDate?.toDate().toLocaleDateString()}
                                                            </p>
                                                            <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                                                {member.source}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteMember(member.id)}
                                                    className={`p-1.5 hover:text-red-600 rounded-full transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-gray-600' : 'text-gray-500 hover:bg-red-100'}`}
                                                    aria-label={t('adminDashboard.members.delete')}
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </motion.li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Activity Feed - full width under comments + members */}
                        <div className={`lg:col-span-3 rounded-xl shadow-lg p-6 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className={`text-lg font-black uppercase ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                    {t('adminDashboard.stats.activity')}
                                </h3>
                                <button
                                    onClick={fetchRecentActivity}
                                    className={`text-sm flex items-center gap-1 ${isDarkMode ? 'text-green-400 hover:text-green-300' : 'text-brandgreen hover:text-green-700'}`}
                                >
                                    {t('adminDashboard.activity.refresh')}
                                    <FiExternalLink className="w-3 h-3" />
                                </button>
                            </div>
                            <ActivityFeed activities={recentActivity} t={t} isDarkMode={isDarkMode} />
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme={isDarkMode ? "dark" : "light"}
            />

            <ConfirmationDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                onConfirm={() => {
                    confirmDialog.onConfirm();
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                }}
                onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
            />

            {/* Mobile menu button */}
            <div className="lg:hidden fixed top-4 right-4 z-50">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className={`p-2 rounded-lg shadow-md border transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-white' : 'bg-white border-gray-200 hover:bg-gray-100 text-gray-700'}`}
                    aria-label={isMobileMenuOpen ? t('adminDashboard.common.closeMenu') : t('adminDashboard.common.openMenu')}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isMobileMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            <div className="flex">
                {/* Sidebar */}
                <aside className={`fixed inset-y-0 left-0 z-40 w-64 shadow-xl transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out border-r ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="flex flex-col h-full p-6">
                        <img
                            src={isDarkMode ? TechBypLogoDark : Logo}
                            sizes="(max-width: 768px) 50vw, 25vw"
                            alt="Admin Portal"
                            className="w-96 h-16 mb-10 object-contain cursor-pointer transform transition-transform duration-300 hover:scale-110"
                            onClick={() => navigate("/")}
                        />

                        <nav className="flex-1">
                            <ul className="space-y-2">
                                <NavItem
                                    icon={<FiHome className="w-5 h-5" />}
                                    label={t('adminDashboard.tabs.dashboard')}
                                    active={activeTab === 'dashboard'}
                                    onClick={() => setActiveTab('dashboard')}
                                    isDarkMode={isDarkMode}
                                />
                                <NavItem
                                    icon={<FiEdit className="w-5 h-5" />}
                                    label={t('adminDashboard.tabs.blog')}
                                    active={activeTab === 'blog'}
                                    onClick={() => setActiveTab('blog')}
                                    isDarkMode={isDarkMode}
                                />
                                <NavItem
                                    icon={<FiImage className="w-5 h-5" />}
                                    label={t('adminDashboard.tabs.hero')}
                                    active={activeTab === 'hero'}
                                    onClick={() => setActiveTab('hero')}
                                    isDarkMode={isDarkMode}
                                />
                                <NavItem
                                    icon={<FiBell className="w-5 h-5" />}
                                    label={t('adminDashboard.tabs.announcements')}
                                    active={activeTab === 'announcements'}
                                    onClick={() => setActiveTab('announcements')}
                                    isDarkMode={isDarkMode}
                                />
                            </ul>
                        </nav>

                        <div className="mt-auto">
                            <div className={`p-4 rounded-xl mb-4 border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-white font-black uppercase">
                                        <img srcSet={logo_small} alt="Small logo" className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className={`font-bold truncate max-w-[160px] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{displayName}</p>
                                        <p className={`text-xs uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {t(`adminDashboard.user.role.${userRole}`)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'de' : 'en')}
                                    className={`flex-1 flex items-center space-x-2 p-3 text-left rounded-lg transition-colors font-medium ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                                    title={t('adminDashboard.common.toggleLanguage')}
                                >
                                    <FiGlobe className="w-5 h-5" />
                                    <span>{i18n.language === 'en' ? 'EN' : 'DE'}</span>
                                </button>

                                <button
                                    onClick={toggleDarkMode}
                                    className={`flex-1 flex items-center space-x-2 p-3 text-left rounded-lg transition-colors font-medium ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                                    title={isDarkMode ? t('adminDashboard.common.switchToLight') : t('adminDashboard.common.switchToDark')}
                                >
                                    {isDarkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
                                    <span>{isDarkMode ? "" : ""}</span>
                                </button>

                                <button
                                    onClick={handleLogout}
                                    className={`flex-1 flex items-center space-x-2 p-3 text-left rounded-lg transition-colors font-medium ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                                >
                                    <FiLogOut className="w-5 h-5" />
                                    {/* <span>{t('adminDashboard.common.logout')}</span> */}
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main content */}
                <main className="flex-1 lg:ml-64 min-h-screen p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
                            <h1 className={`text-2xl md:text-3xl font-black uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {activeTab === 'dashboard' && t('adminDashboard.greeting', { name: displayName })}
                                {activeTab === 'blog' && t('adminDashboard.tabs.blog')}
                                {activeTab === 'hero' && t('adminDashboard.tabs.hero')}
                                {activeTab === 'announcements' && t('adminDashboard.tabs.announcements')}
                            </h1>

                            <div className="flex items-center space-x-4">
                                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {t('adminDashboard.common.lastUpdated')}: {new Date().toLocaleString()}
                                </span>
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                                    <div className="h-2 w-2 rounded-full bg-brandgreen animate-pulse"></div>
                                </div>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(3)].map((_, i) => (
                                    <Skeleton key={i} className={`h-36 rounded-xl ${isDarkMode ? 'bg-gray-700' : ''}`} />
                                ))}
                            </div>
                        ) : (
                            renderContent()
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

// Helper components
const NavItem = ({ icon, label, active, onClick, isDarkMode }: {
    icon: React.ReactNode,
    label: string,
    active: boolean,
    onClick: () => void,
    isDarkMode: boolean
}) => (
    <motion.li whileTap={{ scale: 0.95 }}>
        <button
            onClick={onClick}
            className={`w-full flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 ${active
                ? `${isDarkMode ? 'bg-brandgreen/20 text-brandgreen' : 'bg-brandgreen/10 text-brandgreen'} font-bold border-l-4 border-brandgreen`
                : `${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} font-medium`
                }`}
            aria-current={active ? 'page' : undefined}
        >
            <span className={`${active ? 'text-brandgreen' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {icon}
            </span>
            <span>{label}</span>
        </button>
    </motion.li>
);
const DashboardCard = ({ title, value, change, icon, loading, isDarkMode }: {
    title: string,
    value: string | number,
    change: string,
    icon: React.ReactNode,
    loading?: boolean,
    isDarkMode: boolean
}) => (
    <div className={`rounded-xl shadow-lg p-6 border transition-shadow ${isDarkMode
        ? 'bg-gray-800 border-gray-700 hover:shadow-gray-800/20'
        : 'bg-white border-gray-200 hover:shadow-md'}`}>
        <div className="flex justify-between items-start">
            <div>
                <p className={`text-sm font-medium uppercase tracking-wider ${isDarkMode
                    ? 'text-gray-400'
                    : 'text-gray-500'}`}>
                    {title}
                </p>
                {loading ? (
                    <Skeleton className={`h-9 w-24 mt-2 ${isDarkMode ? 'bg-gray-700' : ''}`} />
                ) : (
                    <h3 className={`text-3xl font-black mt-2 ${isDarkMode
                        ? 'text-white'
                        : 'text-gray-900'}`}>
                        {value}
                    </h3>
                )}
                {loading ? (
                    <Skeleton className={`h-6 w-20 mt-3 ${isDarkMode ? 'bg-gray-700' : ''}`} />
                ) : (
                    <p className={`text-xs mt-3 px-3 py-1 rounded-full inline-flex items-center ${change.startsWith('+') || typeof change === 'number'
                            ? isDarkMode
                                ? 'bg-green-900/30 text-green-400'
                                : 'bg-green-100 text-green-800'
                            : isDarkMode
                                ? 'bg-red-900/30 text-red-400'
                                : 'bg-red-100 text-red-800'
                        }`}>
                        {change}
                    </p>
                )}
            </div>
            <div className={`p-3 rounded-lg ${isDarkMode
                ? 'bg-brandgreen/20 text-brandgreen'
                : 'bg-brandgreen/10 text-brandgreen'}`}>
                {icon}
            </div>
        </div>
    </div>
);

const ActivityFeed = ({ activities, t, isDarkMode }: {
    activities: Activity[],
    t: (key: string, options?: any) => string,
    isDarkMode: boolean
}) => {
    const [expandedActivity, setExpandedActivity] = useState<string | null>(null);

    const formatEvent = (event: string) => {
        return t(`adminDashboard.activity.events.${event}`, { defaultValue: event.replace(/_/g, ' ') });
    };

    const getEventIcon = (event: string) => {
        const iconMap: Record<string, React.ReactNode> = {
            'comment_added': <FiFileText className="w-4 h-4 text-blue-500" />,
            'comment_edited': <FiEdit className="w-4 h-4 text-yellow-500" />,
            'comment_deleted': <FiTrash2 className="w-4 h-4 text-red-500" />,
            'content_created': <FiFileText className="w-4 h-4 text-purple-500" />,
            'content_updated': <FiEdit className="w-4 h-4 text-brandgreen" />,
            'member_joined': <FiUsers className="w-4 h-4 text-green-500" />,
            'member_deleted': <FiTrash2 className="w-4 h-4 text-red-500" />
        };
        return iconMap[event] || <FiEdit className="w-4 h-4 text-gray-500" />;
    };

    const formatTime = (timestamp: any) => {
        if (!timestamp) return t('adminDashboard.common.justNow');
        const date = timestamp.toDate();
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return t('adminDashboard.common.justNow');
        if (minutes < 60) return t('adminDashboard.common.minutesAgo', { count: minutes });

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return t('adminDashboard.common.hoursAgo', { count: hours });

        const days = Math.floor(hours / 24);
        if (days < 7) return t('adminDashboard.common.daysAgo', { count: days, s: days > 1 ? 's' : '' });

        return date.toLocaleDateString();
    };

    const renderMetadata = (metadata: any, event: string) => {
        if (!metadata) return null;

        const renderField = (label: string, value: any) => (
            value && (
                <div className="flex">
                    <span className={`min-w-[80px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t(`adminDashboard.activity.metadata.${label.toLowerCase()}`)}:
                    </span>
                    <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                        {value}
                    </span>
                </div>
            )
        );

        switch (event) {
            case 'comment_added':
            case 'comment_deleted':
            case 'comment_edited':
                return (
                    <div className="mt-2 text-sm space-y-1">
                        {renderField('User', metadata.userName || metadata.name)}
                        {renderField('Company', metadata.company)}
                        {renderField('Rating', metadata.rating && `${metadata.rating}/5`)}

                        {(metadata.text || metadata.newText) && (
                            <div className="mt-1">
                                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                                    {t('adminDashboard.activity.metadata.currentMessage')}:
                                </p>
                                <p className={`italic ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    "{metadata.text || metadata.newText}"
                                </p>
                            </div>
                        )}

                        {event === 'comment_edited' && metadata.previousText && (
                            <div className="mt-1">
                                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                                    {t('adminDashboard.activity.metadata.previousMessage')}:
                                </p>
                                <p className={`italic line-through ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    "{metadata.previousText}"
                                </p>
                            </div>
                        )}
                    </div>
                );

            case 'content_created':
            case 'content_updated':
                return (
                    <div className="mt-2 text-sm space-y-1">
                        {renderField('Type', metadata.contentType)}
                        {renderField('Title', metadata.title)}
                        {metadata.changes && (
                            <div className="mt-1">
                                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                                    {t('adminDashboard.activity.metadata.changes')}:
                                </p>
                                <p className={`text-xs p-2 rounded ${isDarkMode
                                    ? 'bg-gray-700 text-gray-300'
                                    : 'bg-gray-100 text-gray-800'}`}>
                                    {metadata.changes}
                                </p>
                            </div>
                        )}
                    </div>
                );

            case 'member_joined':
            case 'member_deleted':
                return (
                    <div className="mt-2 text-sm space-y-1">
                        {renderField('Email', metadata.email)}
                        {renderField('Name', metadata.name)}
                        {renderField('Source', metadata.source)}
                        {metadata.deletedBy && renderField('Deleted By', metadata.deletedBy)}
                    </div>
                );

            default:
                return (
                    <div className="mt-2">
                        <pre className={`text-xs p-2 rounded overflow-x-auto ${isDarkMode
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-gray-100 text-gray-800'}`}>
                            {JSON.stringify(metadata, null, 2)}
                        </pre>
                    </div>
                );
        }
    };

    if (!activities || activities.length === 0) {
        return (
            <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('adminDashboard.activity.noActivity')}
            </div>
        );
    }

    return (
        <div className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'} max-h-[500px] overflow-y-auto`}>
            {activities.slice(0, 50).map((activity) => (
                <div key={activity.id} className="py-4 first:pt-0 last:pb-0">
                    <div
                        className={`flex items-start cursor-pointer p-2 rounded-lg transition-colors ${isDarkMode
                                ? 'hover:bg-gray-700/50'
                                : 'hover:bg-gray-50'
                            }`}
                        onClick={() => setExpandedActivity(expandedActivity === activity.id ? null : activity.id)}
                        aria-expanded={expandedActivity === activity.id}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-1 flex-shrink-0 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                            }`}>
                            {getEventIcon(activity.event)}
                        </div>
                        <div className="ml-3 min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {activity.userEmail || 'System'} {formatEvent(activity.event)}
                                </p>
                                <span className={`text-xs whitespace-nowrap ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                    {formatTime(activity.timestamp)}
                                </span>
                            </div>

                            <AnimatePresence>
                                {expandedActivity === activity.id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className={`mt-2 p-3 rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                                            }`}
                                    >
                                        {renderMetadata(activity.metadata, activity.event)}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className={`ml-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {expandedActivity === activity.id ? (
                                <FiChevronUp className="w-4 h-4" />
                            ) : (
                                <FiChevronDown className="w-4 h-4" />
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AdminDashboard;