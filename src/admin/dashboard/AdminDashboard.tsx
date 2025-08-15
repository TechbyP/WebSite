// src/pages/AdminDashboard.tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/AuthContext';
import { useAnalytics } from './hooks/useAnalytics';
import { db } from '../../firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit, deleteDoc, updateDoc, addDoc } from 'firebase/firestore';
import { logActivity } from '../../utils/activityLogger';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';
import { FiGlobe } from 'react-icons/fi';
import {
    FiHome,
    FiEdit,
    FiBell,
    FiUsers,
    FiSettings,
    FiPieChart,
    FiFileText,
    FiImage,
    FiLogOut,
    FiShield,
    FiDatabase,
    FiTrendingUp,
    FiSearch,
    FiTrash2,
    FiSave,
    FiX,
    FiChevronDown,
    FiChevronUp,
    FiExternalLink
} from 'react-icons/fi';
import BlogPostEditor from '../blog/BlogPostEditor';
import HeroPageEditor from '../hero/HeroPageEditor';
import PerformanceMonitor from './PerformanceMonitor';
import SecurityAuditLog from './SecurityAuditLog';
import SEOHealthCheck from './SEOHealthCheck';
import AnalyticsDashboard from './AnalyticsDashboard';
import AnnouncementEditor from '../announcement/AnnouncementEditor';
import Logo from '../../assets/pictures/techbyp.png';
import logo_small from '../../assets/pictures/Logo-Symbol.png';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './hooks/useTheme';
import { ConfirmationDialog } from './ui/ConfirmationDialog';
import { Skeleton } from './ui/Skeleton';

// Type definitions
type SiteStats = {
    visitors: number;
    articles: number;
    announcements: number;
    performanceScore: number;
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

type ClubMember = {
    id: string;
    email: string;
    name: string;
    source: string;
    joinedDate: any;
};

type Activity = {
    id: string;
    event: string;
    timestamp?: any;
    userEmail?: string;
    userId?: string;
    metadata?: any;
};

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const { trackEvent, getAnalyticsData } = useAnalytics();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [siteStats, setSiteStats] = useState<SiteStats>({
        visitors: 0,
        articles: 0,
        announcements: 0,
        performanceScore: 0
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
    const { theme, toggleTheme, isMounted } = useTheme();



    const getDisplayName = useCallback((email: string): string => {
        const nameMap: Record<string, string> = {
            "d.alex@techbyp.com": "David",
            "b.peters@techbyp.com": "Benny",
            "m.peters@techbyp.com": "Mattze"
        };

        return nameMap[email.toLowerCase()] || "User";
    }, []);


    const displayName: string = user ? getDisplayName(user.email ?? "") : "Guest";

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

    const fetchRecentActivity = useCallback(async () => {
        try {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            const q = query(
                collection(db, 'analytics'),
                where('timestamp', '>=', oneWeekAgo),
                where('event', 'in', [
                    'member_joined',
                    'comment_added',
                    'content_created',
                    'content_updated',
                    'comment_edited',
                    'comment_deleted',
                    'member_deleted'
                ]),
                orderBy('timestamp', 'desc'),
                limit(20)
            );
            const snapshot = await getDocs(q);
            setRecentActivity(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error('Error fetching activity:', error);
            toast.error('Failed to load recent activity');
        }
    }, []);

    const fetchSiteStats = useCallback(async () => {
        setIsLoading(true);
        try {
            const [visitorSnapshot, articlesSnapshot, announcementsSnapshot, performanceSnapshot] = await Promise.all([
                getDocs(query(
                    collection(db, 'analytics'),
                    where('event', '==', 'page_view'),
                    where('timestamp', '>=', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
                )),
                getDocs(collection(db, 'articles')),
                getDocs(collection(db, 'announcements')),
                getDocs(query(
                    collection(db, 'analytics'),
                    where('event', '==', 'performance_metrics'),
                    orderBy('timestamp', 'desc'),
                    limit(10)
                ))
            ]);

            let avgPerformance = 0;
            if (!performanceSnapshot.empty) {
                const validEntries = performanceSnapshot.docs
                    .filter(doc => doc.data().metadata)
                    .map(doc => {
                        const m = doc.data().metadata;
                        return {
                            lcp: Number(m.lcp) || 0,
                            fcp: Number(m.fcp) || 0,
                            cls: Number(m.cls) || 0,
                            inp: Number(m.inp) || 0,
                            tbt: Number(m.tbt) || 0
                        };
                    });

                if (validEntries.length > 0) {
                    avgPerformance = Math.round(
                        validEntries.reduce((sum, entry) => {
                            return sum + (
                                (entry.lcp < 2500 ? 20 : 0) +
                                (entry.fcp < 1800 ? 20 : 0) +
                                (entry.cls < 0.1 ? 20 : 0) +
                                (entry.inp < 200 ? 20 : 0) +
                                (entry.tbt < 300 ? 20 : 0)
                            );
                        }, 0) / validEntries.length
                    );
                }
            }

            setSiteStats({
                visitors: visitorSnapshot.size,
                articles: articlesSnapshot.size,
                announcements: announcementsSnapshot.size,
                performanceScore: avgPerformance
            });
        } catch (error) {
            console.error('Error fetching site stats:', error);
            toast.error('Failed to load site statistics');
        } finally {
            setIsLoading(false);
        }
    }, []);

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

            toast.success('Comment updated successfully');
            setEditingCommentId(null);
            await Promise.all([fetchLatestCommentsAndMembers(), fetchRecentActivity()]);
        } catch (error) {
            console.error('Error updating comment:', error);
            toast.error('Failed to update comment');
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Delete Comment',
            message: 'Are you sure you want to delete this comment? This action cannot be undone.',
            onConfirm: async () => {
                try {
                    const commentDoc = await getDoc(doc(db, 'comments', commentId));
                    if (!commentDoc.exists()) {
                        toast.error('Comment not found');
                        return;
                    }

                    const commentData = commentDoc.data();
                    const commentDetails = {
                        userName: commentData.name || 'Anonymous',
                        company: commentData.company || 'No company',
                        text: commentData.text || 'No text',
                        rating: commentData.rating || 0,
                        timestamp: commentData.timestamp || new Date()
                    };

                    await deleteDoc(doc(db, 'comments', commentId));

                    const metadata = {
                        user: displayName,
                        commentId: commentId,
                        userName: commentDetails.userName,
                        company: commentDetails.company,
                        text: commentDetails.text,
                        rating: commentDetails.rating,
                        timestamp: commentDetails.timestamp
                    };

                    await Promise.all([
                        addDoc(collection(db, 'analytics'), {
                            event: 'comment_deleted',
                            userId: user?.uid,
                            userEmail: user?.email,
                            timestamp: new Date(),
                            metadata: metadata
                        }),
                        logActivity({
                            event: 'comment_deleted',
                            userEmail: user?.email || 'system',
                            userId: user?.uid || 'system',
                            metadata: {
                                ...metadata,
                                deletedBy: user?.email || 'system'
                            }
                        })
                    ]);

                    toast.success('Comment deleted successfully');
                    await Promise.all([fetchLatestCommentsAndMembers(), fetchRecentActivity()]);
                } catch (error) {
                    console.error('Error deleting comment:', error);
                    toast.error('Failed to delete comment');
                }
            },
            onCancel: () => { }
        });
    };

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

                    // Only log from the admin's perspective
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
    const checkPermissions = useCallback(async () => {
        if (!user) return;

        try {
            const userDoc = await getDoc(doc(db, 'users', user?.email));
            if (userDoc.exists()) {
                setUserRole(userDoc.data().role || 'admin');
            }
        } catch (error) {
            console.error('Error checking permissions:', error);
            toast.error('Failed to verify permissions');
        }
    }, [user]);

    useEffect(() => {
        checkPermissions();
        fetchSiteStats();
        fetchRecentActivity();
        fetchLatestCommentsAndMembers();
        trackEvent('admin_dashboard_visited');
    }, [checkPermissions, fetchSiteStats, fetchRecentActivity, fetchLatestCommentsAndMembers, trackEvent]);

    const handleLogout = () => {
        trackEvent('admin_logged_out');
        logout();
        navigate('/login');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'blog':
                return <BlogPostEditor />;
            case 'hero':
                return <HeroPageEditor />;
            case 'performance':
                return <PerformanceMonitor />;
            case 'announcements':
                return <AnnouncementEditor />;
            case 'security':
                return <SecurityAuditLog />;
            case 'analytics':
                return <AnalyticsDashboard />;
            case 'seo':
                return <SEOHealthCheck />;
            case 'dashboard':
            default:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <DashboardCard
                            title="Total Visitors"
                            value={siteStats.visitors.toLocaleString()}
                            change={`${siteStats.visitors > 0 ? '+' : ''}${Math.round((siteStats.visitors / 30) * 100)}% this month`}
                            icon={<FiUsers className="w-6 h-6" />}
                            loading={isLoading}
                        />
                        <DashboardCard
                            title="Published Articles"
                            value={siteStats.articles}
                            change={`${siteStats.articles > 0 ? '+' : ''}${Math.round((siteStats.articles / 7) * 100)}% this week`}
                            icon={<FiFileText className="w-6 h-6" />}
                            loading={isLoading}
                        />
                        <DashboardCard
                            title="Active Announcements"
                            value={siteStats.announcements}
                            change={`${siteStats.announcements > 0 ? '+' : ''}${Math.round((siteStats.announcements / 1) * 100)}% today`}
                            icon={<FiBell className="w-6 h-6" />}
                            loading={isLoading}
                        />
                        <DashboardCard
                            title="Performance Score"
                            value={`${siteStats.performanceScore}/100`}
                            change={siteStats.performanceScore > 80 ? 'Excellent' : siteStats.performanceScore > 60 ? 'Good' : 'Needs work'}
                            icon={<FiPieChart className="w-6 h-6" />}
                            loading={isLoading}
                        />

                        <div className="md:col-span-2 bg-white   light:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200   light:border-gray-700">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800   light:text-gray-200">Latest Comments</h3>
                                <span className="text-xs bg-blue-100   light:bg-blue-900 text-blue-800   light:text-blue-200 px-2 py-1 rounded-full">
                                    {latestComments.length} comments
                                </span>
                            </div>
                            {latestComments.length === 0 ? (
                                <p className="text-gray-500   light:text-gray-400 text-center py-4">No recent comments found.</p>
                            ) : (
                                <ul className="space-y-3 max-h-96 overflow-auto pr-2">
                                    {latestComments.map(comment => (
                                        <motion.li
                                            key={comment.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white/70   light:bg-gray-700/70 hover:bg-white/90   light:hover:bg-gray-700/90 transition-all duration-200 rounded-lg p-4 shadow-sm border border-gray-100   light:border-gray-600"
                                        >
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-purple-100   light:from-blue-900   light:to-purple-900 flex items-center justify-center text-blue-600   light:text-blue-300 font-medium text-sm">
                                                            {comment.userName?.charAt(0)?.toUpperCase() || 'A'}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium   light:text-gray-200">{comment.userName}</p>
                                                            <p className="text-xs text-gray-500   light:text-gray-400">{comment.company}</p>
                                                        </div>
                                                        <div className="ml-auto flex items-center">
                                                            {[...Array(5)].map((_, i) => (
                                                                <span key={i} className={`text-lg ${i < comment.rating ? 'text-yellow-400' : 'text-gray-300   light:text-gray-600'}`}>
                                                                    ★
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {editingCommentId === comment.id ? (
                                                        <div className="mt-2 space-y-2">
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <div>
                                                                    <label className="block text-xs text-gray-500   light:text-gray-400 mb-1">Name</label>
                                                                    <input
                                                                        type="text"
                                                                        value={editedCommentName}
                                                                        onChange={(e) => setEditedCommentName(e.target.value)}
                                                                        className="w-full p-2 border border-gray-200   light:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent   light:bg-gray-800   light:text-gray-200"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs text-gray-500   light:text-gray-400 mb-1">Company</label>
                                                                    <input
                                                                        type="text"
                                                                        value={editedCommentCompany}
                                                                        onChange={(e) => setEditedCommentCompany(e.target.value)}
                                                                        className="w-full p-2 border border-gray-200   light:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent   light:bg-gray-800   light:text-gray-200"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <textarea
                                                                value={editedCommentText}
                                                                onChange={(e) => setEditedCommentText(e.target.value)}
                                                                className="w-full p-2 border border-gray-200   light:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent   light:bg-gray-800   light:text-gray-200"
                                                                rows={3}
                                                                autoFocus
                                                            />
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleSaveComment(comment.id)}
                                                                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                                                                >
                                                                    <FiSave className="w-3 h-3" />
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingCommentId(null)}
                                                                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700   light:bg-gray-600   light:hover:bg-gray-700   light:text-gray-200 text-sm rounded-lg transition-colors"
                                                                >
                                                                    <FiX className="w-3 h-3" />
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p className="text-sm text-gray-700   light:text-gray-300 mt-1 whitespace-pre-line">{comment.text || 'No content'}</p>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <span className="text-xs text-gray-400   light:text-gray-500">
                                                                    {comment.timestamp?.toDate().toLocaleString()}
                                                                </span>
                                                                {comment.edited && (
                                                                    <span className="text-xs text-gray-400   light:text-gray-500">• Edited</span>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                {editingCommentId !== comment.id && (
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleEditComment(comment)}
                                                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50   light:hover:bg-blue-900/30 rounded-full transition-colors"
                                                            aria-label="Edit comment"
                                                        >
                                                            <FiEdit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteComment(comment.id)}
                                                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50   light:hover:bg-red-900/30 rounded-full transition-colors"
                                                            aria-label="Delete comment"
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

                        <div className="md:col-span-2 bg-white   light:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200   light:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-800   light:text-gray-200 mb-4">Latest Club Members</h3>
                            {latestClubMembers.length === 0 ? (
                                <p className="text-gray-500   light:text-gray-400 text-center py-4">No new members found.</p>
                            ) : (
                                <ul className="space-y-3 max-h-96 overflow-auto">
                                    {latestClubMembers.map(member => (
                                        <motion.li
                                            key={member.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white/70   light:bg-gray-700/70 hover:bg-white/90   light:hover:bg-gray-700/90 transition-all duration-200 rounded-lg p-4 shadow-sm border border-gray-100   light:border-gray-600"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-teal-100   light:from-green-900   light:to-teal-900 flex items-center justify-center text-teal-600   light:text-teal-300 font-medium">
                                                        {member.name?.charAt(0)?.toUpperCase() || 'M'}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium   light:text-gray-200 break-all">
                                                            {member.name || 'Unknown Member'}
                                                        </p>
                                                        <p className="text-xs text-gray-600   light:text-gray-400 break-all">
                                                            {member.email}
                                                        </p>

                                                        <div className="flex justify-between items-center">
                                                            <p className="text-xs text-gray-500   light:text-gray-400">
                                                                Joined: {member.joinedDate?.toDate().toLocaleDateString()}
                                                            </p>
                                                            <span className="text-xs bg-gray-100   light:bg-gray-700 text-gray-600   light:text-gray-300 px-2 py-1 rounded-full">
                                                                {member.source}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteMember(member.id)}
                                                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50   light:hover:bg-red-900/30 rounded-full transition-colors"
                                                    aria-label="Delete member"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </motion.li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="md:col-span-2 bg-white   light:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200   light:border-gray-700">
                            <SEOHealthCheck compact />
                        </div>

                        <div className="md:col-span-2 bg-white   light:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200   light:border-gray-700">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800   light:text-gray-200">Recent Activity</h3>
                                <button
                                    onClick={fetchRecentActivity}
                                    className="text-sm text-blue-600 hover:text-blue-800   light:text-blue-400   light:hover:text-blue-300 flex items-center gap-1"
                                >
                                    Refresh
                                    <FiExternalLink className="w-3 h-3" />
                                </button>
                            </div>
                            <ActivityFeed activities={recentActivity} />
                        </div>

                        <div className="md:col-span-2 bg-white   light:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200   light:border-gray-700">
                            <PerformanceMonitor compact />
                        </div>

                        <div className="md:col-span-2 bg-white   light:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200   light:border-gray-700">
                            <AnalyticsDashboard compact />
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50   light:bg-gray-900">
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
                theme={theme === 'dark' ? 'dark' : 'light'}
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
                    className="p-2 rounded-lg bg-white   light:bg-gray-800 shadow-md border border-gray-200   light:border-gray-700 hover:bg-gray-100   light:hover:bg-gray-700 transition-all"
                    aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                >
                    <svg className="w-6 h-6 text-gray-700   light:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white   light:bg-gray-800 shadow-xl transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out border-r border-gray-200   light:border-gray-700`}>
                    <div className="flex flex-col h-full p-6">
                        <img
                            srcSet={Logo}
                            sizes="(max-width: 768px) 50vw, 25vw"
                            alt="Admin Portal"
                            className="w-96 h-16 mb-10 object-contain cursor-pointer transform transition-transform duration-300 hover:scale-110"
                            onClick={() => navigate("/")}
                        />

                        <nav className="flex-1">
                            <ul className="space-y-2">
                                <NavItem
                                    icon={<FiHome className="w-5 h-5" />}
                                    label="Dashboard"
                                    active={activeTab === 'dashboard'}
                                    onClick={() => setActiveTab('dashboard')}
                                />
                                <NavItem
                                    icon={<FiEdit className="w-5 h-5" />}
                                    label="Blog Editor"
                                    active={activeTab === 'blog'}
                                    onClick={() => setActiveTab('blog')}
                                />
                                <NavItem
                                    icon={<FiImage className="w-5 h-5" />}
                                    label="Hero Editor"
                                    active={activeTab === 'hero'}
                                    onClick={() => setActiveTab('hero')}
                                />
                                <NavItem
                                    icon={<FiBell className="w-5 h-5" />}
                                    label="Announcements"
                                    active={activeTab === 'announcements'}
                                    onClick={() => setActiveTab('announcements')}
                                />

                                {userRole === 'admin' && (
                                    <>
                                        <div className="border-t border-gray-200   light:border-gray-700 my-4"></div>
                                        <NavItem
                                            icon={<FiTrendingUp className="w-5 h-5" />}
                                            label="Analytics"
                                            active={activeTab === 'analytics'}
                                            onClick={() => setActiveTab('analytics')}
                                        />
                                        <NavItem
                                            icon={<FiSearch className="w-5 h-5" />}
                                            label="SEO Tools"
                                            active={activeTab === 'seo'}
                                            onClick={() => setActiveTab('seo')}
                                        />
                                        <NavItem
                                            icon={<FiPieChart className="w-5 h-5" />}
                                            label="Performance"
                                            active={activeTab === 'performance'}
                                            onClick={() => setActiveTab('performance')}
                                        />
                                        <NavItem
                                            icon={<FiUsers className="w-5 h-5" />}
                                            label="User Management"
                                            active={activeTab === 'users'}
                                            onClick={() => setActiveTab('users')}
                                        />
                                        <NavItem
                                            icon={<FiShield className="w-5 h-5" />}
                                            label="Security"
                                            active={activeTab === 'security'}
                                            onClick={() => setActiveTab('security')}
                                        />
                                        <NavItem
                                            icon={<FiDatabase className="w-5 h-5" />}
                                            label="Backups"
                                            active={activeTab === 'backups'}
                                            onClick={() => setActiveTab('backups')}
                                        />
                                    </>
                                )}
                            </ul>
                        </nav>

                        <div className="mt-auto">
                            <div className="p-4 bg-gray-50   light:bg-gray-700 rounded-xl mb-4 border border-gray-200   light:border-gray-600">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brandblue/10 to-brandgreen/10   light:from-brandblue/20   light:to-brandgreen/20 flex items-center justify-center text-brandblue   light:text-brandblue-light font-semibold">
                                        <img srcSet={logo_small} alt="Small logo" className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900   light:text-gray-100 truncate max-w-[160px]">{displayName}</p>
                                        <p className="text-xs text-gray-500   light:text-gray-400 uppercase">{userRole}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'de' : 'en')}
                                    className="flex-1 flex items-center space-x-2 p-3 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors font-medium"
                                    title={t('toggleLanguage')}
                                >
                                    <FiGlobe className="w-5 h-5" />
                                    <span>{i18n.language === 'en' ? 'EN' : 'DE'}</span>
                                </button>

                                <button
                                    onClick={handleLogout}
                                    className="flex-1 flex items-center space-x-2 p-3 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors font-medium"
                                >
                                    <FiLogOut className="w-5 h-5" />
                                    <span>{t('logout')}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main content */}
                <main className="flex-1 lg:ml-64 min-h-screen p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
                            <h1 className="text-2xl md:text-3xl font-black uppercase text-gray-900   light:text-gray-100">
                                {activeTab === 'dashboard' && `Hello ${displayName}`}
                                {activeTab === 'blog' && 'Blog Post Management'}
                                {activeTab === 'hero' && 'Hero Section Editor'}
                                {activeTab === 'announcements' && 'Announcements Editor'}
                                {activeTab === 'analytics' && 'Analytics Dashboard'}
                                {activeTab === 'seo' && 'SEO Health Check'}
                                {activeTab === 'performance' && 'Performance Monitor'}
                                {activeTab === 'users' && 'User Management'}
                                {activeTab === 'security' && 'Security Dashboard'}
                                {activeTab === 'backups' && 'Backup Management'}
                            </h1>

                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-600   light:text-gray-400">
                                    Last updated: {new Date().toLocaleString()}
                                </span>
                                <div className="h-8 w-8 rounded-full bg-green-100   light:bg-green-900 flex items-center justify-center">
                                    <div className="h-2 w-2 rounded-full bg-brandgreen animate-pulse"></div>
                                </div>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[...Array(8)].map((_, i) => (
                                    <Skeleton key={i} className="h-36 rounded-xl" />
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
const NavItem = ({ icon, label, active, onClick }: {
    icon: React.ReactNode,
    label: string,
    active: boolean,
    onClick: () => void
}) => (
    <motion.li whileTap={{ scale: 0.95 }}>
        <button
            onClick={onClick}
            className={`w-full flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 ${active
                ? 'bg-brandblue/10   light:bg-brandblue/20 text-brandblue   light:text-brandblue-light font-bold border-l-4 border-brandblue'
                : 'text-gray-700   light:text-gray-300 hover:bg-gray-100   light:hover:bg-gray-700 font-medium'
                }`}
            aria-current={active ? 'page' : undefined}
        >
            <span className={`${active ? 'text-brandblue   light:text-brandblue-light' : 'text-gray-600   light:text-gray-400'}`}>
                {icon}
            </span>
            <span>{label}</span>
        </button>
    </motion.li>
);

const DashboardCard = ({ title, value, change, icon, loading }: {
    title: string,
    value: string | number,
    change: string,
    icon: React.ReactNode,
    loading?: boolean
}) => (
    <div className="bg-white   light:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200   light:border-gray-700 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500   light:text-gray-400 uppercase tracking-wider">{title}</p>
                {loading ? (
                    <Skeleton className="h-9 w-24 mt-2" />
                ) : (
                    <h3 className="text-3xl font-black mt-2 text-gray-900   light:text-gray-100">{value}</h3>
                )}
                {loading ? (
                    <Skeleton className="h-6 w-20 mt-3" />
                ) : (
                    <p className={`text-xs mt-3 px-3 py-1 rounded-full inline-flex items-center ${change.startsWith('+') || typeof change === 'number' || change === 'Excellent' || change === 'Good'
                        ? 'bg-green-100   light:bg-green-900 text-green-800   light:text-green-200'
                        : 'bg-red-100   light:bg-red-900 text-red-800   light:text-red-200'
                        }`}>
                        {change}
                    </p>
                )}
            </div>
            <div className="p-3 rounded-lg bg-brandblue/10   light:bg-brandblue/20 text-brandblue   light:text-brandblue-light">
                {icon}
            </div>
        </div>
    </div>
);

const ActivityFeed = ({ activities }: { activities: Activity[] }) => {
    const [expandedActivity, setExpandedActivity] = useState<string | null>(null);

    const formatEvent = (event: string) => {
        const eventMap: Record<string, string> = {
            'member_joined': 'joined the TechByP Club',
            'comment_added': 'added a new comment',
            'content_created': 'created new content',
            'content_updated': 'updated content',
            'comment_edited': 'edited a comment',
            'comment_deleted': 'deleted a comment',
            'member_deleted': 'deleted a club member'
        };
        return eventMap[event] || event.replace(/_/g, ' ');
    };

    const getEventIcon = (event: string) => {
        const iconMap: Record<string, React.ReactNode> = {
            'member_joined': <FiUsers className="w-4 h-4 text-green-500" />,
            'comment_added': <FiFileText className="w-4 h-4 text-blue-500" />,
            'comment_edited': <FiEdit className="w-4 h-4 text-yellow-500" />,
            'comment_deleted': <FiTrash2 className="w-4 h-4 text-red-500" />,
            'member_deleted': <FiUsers className="w-4 h-4 text-red-500" />,
            'content_created': <FiFileText className="w-4 h-4 text-purple-500" />,
            'content_updated': <FiEdit className="w-4 h-4 text-indigo-500" />
        };
        return iconMap[event] || <FiEdit className="w-4 h-4 text-gray-500" />;
    };

    const formatTime = (timestamp: any) => {
        if (!timestamp) return 'Just now';
        const date = timestamp.toDate();
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} min ago`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hr ago`;

        const days = Math.floor(hours / 24);
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;

        return date.toLocaleDateString();
    };

    const renderMetadata = (metadata: any, event: string) => {
        if (!metadata) return null;

        const renderField = (label: string, value: any) => (
            value && (
                <div className="flex">
                    <span className="text-gray-500   light:text-gray-400 min-w-[80px]">{label}:</span>
                    <span className="font-medium   light:text-gray-300">{value}</span>
                </div>
            )
        );

        switch (event) {
            case 'member_joined':
            case 'member_deleted':
                return (
                    <div className="mt-2 text-sm space-y-1">
                        {renderField('Email', metadata.email)}
                        {renderField('Source', metadata.source)}
                        {/* {metadata.memberId && renderField('Member ID', metadata.memberId)} */}
                    </div>
                );

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
                                <p className="text-gray-500   light:text-gray-400">Current Message:</p>
                                <p className="text-gray-700   light:text-gray-300 italic">"{metadata.text || metadata.newText}"</p>
                            </div>
                        )}



                        {event === 'comment_edited' && metadata.previousText && (
                            <div className="mt-1">
                                <p className="text-gray-500   light:text-gray-400">Previous Message:</p>
                                <p className="text-gray-700   light:text-gray-300 italic line-through">"{metadata.previousText}"</p>
                            </div>
                        )}


                        {event === 'comment_deleted' && renderField('Deleted by', metadata.deletedBy || metadata.userEmail)}
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
                                <p className="text-gray-500   light:text-gray-400">Changes:</p>
                                <p className="text-xs bg-gray-100   light:bg-gray-700 p-2 rounded">
                                    {metadata.changes}
                                </p>
                            </div>
                        )}
                    </div>
                );

            default:
                return (
                    <div className="mt-2">
                        <pre className="text-xs bg-gray-100   light:bg-gray-700 p-2 rounded overflow-x-auto">
                            {JSON.stringify(metadata, null, 2)}
                        </pre>
                    </div>
                );
        }
    };

    if (!activities || activities.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500   light:text-gray-400">
                No recent activity found
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-200   light:divide-gray-700 max-h-[500px] overflow-y-auto">
            {activities.slice(0, 50).map((activity) => (
                <div key={activity.id} className="py-4 first:pt-0 last:pb-0">
                    <div
                        className="flex items-start cursor-pointer hover:bg-gray-50   light:hover:bg-gray-800/50 p-2 rounded-lg transition-colors"
                        onClick={() => setExpandedActivity(expandedActivity === activity.id ? null : activity.id)}
                        aria-expanded={expandedActivity === activity.id}
                    >
                        <div className="w-8 h-8 rounded-full bg-gray-100   light:bg-gray-700 flex items-center justify-center mt-1 flex-shrink-0">
                            {getEventIcon(activity.event)}
                        </div>
                        <div className="ml-3 min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900   light:text-gray-100">
                                    {activity.userEmail || 'System'} {formatEvent(activity.event)}
                                </p>
                                <span className="text-xs text-gray-500   light:text-gray-400 whitespace-nowrap ml-2">
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
                                        className="mt-2 bg-gray-50   light:bg-gray-700/30 p-3 rounded-lg overflow-hidden"
                                    >
                                        {renderMetadata(activity.metadata, activity.event)}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="ml-2 text-gray-400">
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