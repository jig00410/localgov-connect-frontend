import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

// Helper function from your second file, adapted for Tailwind CSS
const getSeverityInfo = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'emergency':
      return { label: '🚨 Emergency', className: 'bg-red-100 text-red-800' };
    case 'high': // Mapped 'high' to critical styling
      return { label: '🔥 Critical', className: 'bg-orange-100 text-orange-800' };
    case 'urgent':
      return { label: '⚠️ Urgent', className: 'bg-yellow-100 text-yellow-800' };
    case 'medium':
      return { label: '🔵 Needs Attention', className: 'bg-blue-100 text-blue-800' };
    default:
      return { label: 'Minor', className: 'bg-gray-100 text-gray-800' };
  }
};

function IssueDetailPage() {
    const { id } = useParams();
    const [issue, setIssue] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    // Initial data fetch for user, issue, and comments
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            await fetchIssueAndComments();
            setLoading(false);
        };
        fetchInitialData();
    }, [id]);

    // Real-time listener for new comments (from your first file)
    useEffect(() => {
        const channel = supabase
            .channel(`public:comments:issue_id=eq.${id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'comments',
                filter: `issue_id=eq.${id}`
            }, (payload) => {
                setComments(currentComments => [...currentComments, payload.new]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [id]);

    // Fetches all necessary data for the page
    async function fetchIssueAndComments() {
        try {
            // Query now includes all fields from 'issues' plus the department name
            const { data: issueData, error: issueError } = await supabase
                .from('issues')
                .select('*, departments(name)')
                .eq('id', id)
                .single();
            if (issueError) throw issueError;
            setIssue(issueData);

            const { data: commentsData, error: commentsError } = await supabase
                .from('comments')
                .select('*')
                .eq('issue_id', id)
                .order('created_at', { ascending: true });
            if (commentsError) throw commentsError;
            setComments(commentsData);

        } catch (error) {
            console.error(error.message);
        }
    }

    // Handles submitting a new comment
    async function handleAddComment(e) {
        e.preventDefault();
        if (!user) { alert("You must be logged in to comment."); return; }
        if (!newComment.trim()) return;

        try {
            // Inserts comment with user's metadata for rich display
            const { error } = await supabase
                .from('comments')
                .insert({ 
                    content: newComment, 
                    issue_id: id, 
                    user_id: user.id,
                    user_full_name: user.user_metadata.full_name,
                    user_avatar_url: user.user_metadata.avatar_url
                });

            if (error) throw error;
            setNewComment('');
            // UI updates automatically via the real-time listener
        } catch (error) {
            alert(error.message);
        }
    }

    if (loading) return <p className="text-center text-gray-500 mt-8">Loading issue details...</p>;
    if (!issue) return <p className="text-center text-gray-500 mt-8">Issue not found.</p>;

    const severityInfo = getSeverityInfo(issue.severity);

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                {/* Issue Details Section */}
                <div className="border-b pb-4 mb-6">
                     <div className="flex justify-between items-start mb-2">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{issue.title}</h1>
                        <div className="flex flex-col sm:flex-row gap-2 items-end flex-shrink-0">
                           {/* Status Badge */}
                           <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                                issue.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                           }`}>{issue.status}</span>
                           {/* Severity Badge (from second file) */}
                           <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${severityInfo.className}`}>
                             {severityInfo.label}
                           </span>
                        </div>
                    </div>
                     {/* Additional Details from both files */}
                    <div className="text-sm text-gray-600 space-y-2">
                        {issue.departments && <p>Assigned to: <span className="font-semibold text-gray-800">{issue.departments.name}</span></p>}
                        {issue.category && <p>Category: <span className="font-semibold text-gray-800">{issue.category}</span></p>}
                        {issue.location && <p>Location: <span className="font-semibold text-gray-800">{issue.location}</span></p>}
                        {issue.services?.length > 0 && <p>Services: <span className="font-semibold text-gray-800">{issue.services.join(', ')}</span></p>}
                    </div>
                    <p className="text-gray-700 mt-4">{issue.description}</p>
                </div>
                
                {issue.image_url && <img src={issue.image_url} alt={issue.title} className="w-full max-w-lg mx-auto rounded-lg mb-6 shadow-md" />}

                {/* Comments Section */}
                <h2 className="text-2xl font-bold mb-4">Comments ({comments.length})</h2>
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                    {comments.map(comment => (
                        <div key={comment.id} className="flex gap-4">
                            <img src={comment.user_avatar_url || 'https://placehold.co/40x40/EFEFEF/333333?text=U'} alt="avatar" className="w-10 h-10 rounded-full mt-1"/>
                            <div className="bg-gray-100 p-3 rounded-lg flex-1">
                                <p className="font-semibold text-sm text-gray-900">{comment.user_full_name || 'Anonymous'}</p>
                                <p className="text-gray-800">{comment.content}</p>
                                <p className="text-xs text-gray-500 mt-1">{new Date(comment.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                    {comments.length === 0 && <p className="text-gray-500">No comments yet. Be the first to say something!</p>}
                </div>

                {/* Add Comment Form */}
                {user ? (
                    <form onSubmit={handleAddComment}>
                        <textarea
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                            rows="3"
                            placeholder="Write a public comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        ></textarea>
                        <button type="submit" className="mt-2 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition">
                            Post Comment
                        </button>
                    </form>
                ) : (
                    <p className="text-center text-gray-500 bg-gray-50 p-4 rounded-lg">Please <Link to="/login" className="text-blue-600 font-semibold hover:underline">log in</Link> to post a comment.</p>
                )}
            </div>
        </div>
    );
}

export default IssueDetailPage;