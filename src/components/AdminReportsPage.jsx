import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function AdminReportsPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initial data fetch
  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);

      // Fetch issues (with category + severity)
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching issues:", error.message);
      } else {
        setIssues(data);
      }

      setLoading(false);
    };

    fetchIssues();
  }, []);

  // 🔑 Mapping categories → departments
  const categoryToDepartment = {
    fire: "Fire Department",
    accident: "Traffic Police",
    traffic: "Traffic Management",
    water: "Water Works",
    roads: "Public Works",
    nature: "Environment Dept.",
    electricity: "Electricity Board",
    sanitation: "Sanitation Dept.",
  };

  // Update status of issue
  const handleStatusChange = async (issueId, newStatus) => {
    try {
      const { error } = await supabase
        .from('issues')
        .update({ status: newStatus })
        .eq('id', issueId);

      if (error) throw error;

      // Update UI instantly
      setIssues(currentIssues =>
        currentIssues.map(issue =>
          issue.id === issueId ? { ...issue, status: newStatus } : issue
        )
      );

      alert('Status updated!');
    } catch (error) {
      alert("Error updating status: " + error.message);
    }
  };

  if (loading) return <p>Loading reports...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">All Reported Issues</h1>
      <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {issues.map(issue => (
              <tr key={issue.id}>
                <td className="px-6 py-4 whitespace-nowrap">{issue.title}</td>

                {/* Category */}
                <td className="px-6 py-4 whitespace-nowrap font-semibold capitalize">
                  {issue.category || <span className="text-gray-400">Unknown</span>}
                </td>

                {/* Severity */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      issue.severity === 'emergency' ? 'bg-red-100 text-red-800' :
                      issue.severity === 'critical' ? 'bg-orange-100 text-orange-800' :
                      issue.severity === 'urgent' ? 'bg-yellow-100 text-yellow-800' :
                      issue.severity === 'needs attention' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                  }`}>
                    {issue.severity}
                  </span>
                </td>

                {/* Department auto-mapped */}
                <td className="px-6 py-4 whitespace-nowrap font-semibold">
                  {categoryToDepartment[issue.category] || "General Dept."}
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      issue.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      issue.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                  }`}>
                    {issue.status}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(issue.created_at).toLocaleDateString()}
                </td>

                {/* Actions (only Status change remains) */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <select
                    value={issue.status}
                    onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                    className="border border-gray-300 rounded-md p-1"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminReportsPage;
