import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [issues, setIssues] = useState([]);
  const [trendingIssues, setTrendingIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [likedIssues, setLikedIssues] = useState(new Set());
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    const fetchUserAndInitialData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      await fetchIssues();
      await fetchTrendingIssues();
      if (user) {
        const { data: likedData, error } = await supabase
          .from('issue_likes')
          .select('issue_id')
          .eq('user_id', user.id);
        if (!error) setLikedIssues(new Set(likedData.map(like => like.issue_id)));
      }
      setLoading(false);
    };
    fetchUserAndInitialData();
  }, []);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('public-feed-final')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'issue_likes' }, () => {
        fetchIssues();
        fetchTrendingIssues();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => fetchIssues())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'issues' }, () => fetchIssues())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user]);

  const fetchIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*, issue_likes(count), comments(count)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setIssues(data);
    } catch (error) {
      console.error('Error fetching issues:', error.message);
    }
  };

  const fetchTrendingIssues = async () => {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      let { data, error } = await supabase
        .from('issues')
        .select('id, title, issue_likes(count)')
        .gt('created_at', sevenDaysAgo);
      if (error) throw error;
      const sortedByLikes = data.sort((a, b) => (b.issue_likes[0]?.count || 0) - (a.issue_likes[0]?.count || 0));
      setTrendingIssues(sortedByLikes.slice(0, 3));
    } catch (error) {
      console.error("Error fetching trending issues:", error.message);
    }
  };

  const handleLikeToggle = async (issueId) => {
    if (!user) { alert("Login required."); return; }
    const isLiked = likedIssues.has(issueId);
    const newLikedIssues = new Set(likedIssues);
    isLiked ? newLikedIssues.delete(issueId) : newLikedIssues.add(issueId);
    setLikedIssues(newLikedIssues);
    setIssues(currentIssues =>
      currentIssues.map(issue => {
        if (issue.id === issueId) {
          const count = issue.issue_likes[0]?.count || 0;
          return { ...issue, issue_likes: [{ count: isLiked ? count - 1 : count + 1 }] };
        }
        return issue;
      })
    );
    const { error } = await supabase.rpc('toggle_like', { p_issue_id: issueId, p_user_id: user.id });
    if (error) console.error("Error toggling like:", error);
  };

  const filteredIssues = issues.filter(issue =>
    (filterSeverity === 'all' || issue.severity === filterSeverity) &&
    (filterStatus === 'all' || issue.status === filterStatus) &&
    (filterCategory === 'all' || issue.category === filterCategory)
  );

  if (loading) return <p className="text-center text-gray-500 mt-8">Loading issues...</p>;

  return (
    <div className="min-h-full bg-gray-50 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:items-start">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center mb-6">
            {/* Severity Filter */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="all">All</option>
                <option value="emergency">Emergency</option>
                <option value="critical">Critical</option>
                <option value="urgent">Urgent</option>
                <option value="needs attention">Needs Attention</option>
                <option value="minor">Minor</option>
              </select>
            </div>
            {/* Status Filter */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400">
                <option value="all">All</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            {/* Category Filter */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400">
                <option value="all">All</option>
                <option value="accident">Accident</option>
                <option value="fire">Fire</option>
                <option value="traffic">Traffic</option>
                <option value="roads">Roads</option>
                <option value="water">Water</option>
                <option value="nature">Nature</option>
                <option value="electricity">Electricity</option>
                <option value="sanitation">Sanitation</option>
              </select>
            </div>
          </div>

          {/* Issue Posts */}
          {filteredIssues.map(issue => {
            const isLikedByUser = likedIssues.has(issue.id);
            return (
              <div 
                key={issue.id} 
                className="bg-black border border-black rounded-xl shadow-md hover:shadow-lg transition p-5"
              >
                {/* User Info */}
                <div className="flex items-center mb-4">
                  <img src={issue.user_avatar_url || 'https://placehold.co/40x40/EFEFEF/333333?text=U'} alt="user avatar" className="w-12 h-12 rounded-full mr-4 border border-gray-300 object-cover"/>
                  <div>
                    <p className="font-semibold text-white">{issue.user_full_name || 'Anonymous'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${issue.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : issue.status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{issue.status}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full text-white ${issue.severity === "emergency" ? "bg-red-600" : issue.severity === "critical" ? "bg-orange-500" : issue.severity === "urgent" ? "bg-yellow-500" : "bg-blue-500"}`}>
                        {issue.severity?.toUpperCase() || "NEEDS ATTENTION"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-bold mb-2 text-white">{issue.title}</h3>
                <p className="text-white mb-4 break-words">{issue.description}</p>

                {/* Image */}
                {issue.image_url && (
                  <div className="mb-4 rounded-lg overflow-hidden border">
                    <img src={issue.image_url} alt={issue.title} className="w-full max-h-96 object-cover" />
                  </div>
                )}

                {/* Footer */}
                <div className="flex justify-between items-center text-white text-sm border-t pt-3">
                  <div className="flex items-center gap-4">
                    <button onClick={() => handleLikeToggle(issue.id)} className="flex items-center gap-1.5 transition-transform duration-200 ease-in-out transform hover:scale-110">
                      <span className={`text-2xl ${isLikedByUser ? 'text-red-500' : 'text-gray-300'}`}>❤️</span>
                      <span className="font-semibold">{issue.issue_likes[0]?.count || 0}</span>
                    </button>
                    <Link to={`/dashboard/issue/${issue.id}`} className="flex items-center gap-1.5 hover:text-blue-600 transition">
                      <span>💬</span>
                      <span className="font-semibold">{issue.comments[0]?.count || 0}</span>
                    </Link>
                  </div>
                  <Link to={`/dashboard/issue/${issue.id}`} className="text-blue-600 font-semibold hover:underline">View Details</Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6 sticky top-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold mb-4">Community Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="font-semibold">Total Issues:</span><span>{issues.length}</span></div>
              <div className="flex justify-between"><span className="font-semibold text-green-600">Resolved:</span><span>{issues.filter(i => i.status === 'Resolved').length}</span></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold mb-4">🔥 Top Reports</h3>
            <ul className="space-y-3">
              {trendingIssues.length > 0 ? trendingIssues.map(issue => (
                <li key={issue.id} className="text-sm border-b pb-2 last:border-b-0">
                  <Link to={`/dashboard/issue/${issue.id}`} className="text-gray-700 hover:text-blue-600">
                    <p className="font-semibold truncate hover:underline">{issue.title}</p>
                    <p className="text-xs text-gray-500">{issue.issue_likes[0]?.count || 0} Likes</p>
                  </Link>
                </li>
              )) : <p className="text-sm text-gray-500">No trending issues right now.</p>}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/dashboard/report-issue" className="text-blue-600 hover:underline">➕ Report a New Issue</Link></li>
              <li><Link to="/dashboard/my-activity" className="text-blue-600 hover:underline">📊 View My Activity</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
