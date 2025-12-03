import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// Icon Components
const AmbulanceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const FireIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-orange-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7.014A8.003 8.003 0 0117.657 18.657z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1014.12 11.88l-4.242 4.242z" /></svg>;
const PoliceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;

const AdminServicesPage = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState(null);
    const [modalImage, setModalImage] = useState(null); // For image preview
    const [statusFilter, setStatusFilter] = useState("");  // Default to all
    const [severityFilter, setSeverityFilter] = useState(""); // Default to all

    const services = [
        { name: 'Ambulance', category: 'accident', Icon: AmbulanceIcon },
        { name: 'Fire Brigade', category: 'fire', Icon: FireIcon },
        { name: 'Traffic Police', category: 'traffic', Icon: PoliceIcon },
    ];

    useEffect(() => {
        const fetchIssues = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('issues')
                    .select('*')
                    .order('created_at', { ascending: false });
                if (error) throw error;
                setIssues(data || []);
            } catch (error) {
                console.error("Error fetching issues:", error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchIssues();
    }, []);

    const handleStatusChange = async (issueId, newStatus) => {
        try {
            const { error } = await supabase.from('issues').update({ status: newStatus }).eq('id', issueId);
            if (error) throw error;
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

    if (loading) return <div>Loading Services...</div>;

    const filteredIssues = selectedService
        ? issues.filter(issue =>
            issue.category === selectedService.category &&
            (statusFilter ? issue.status === statusFilter : true) &&
            (severityFilter ? issue.severity === severityFilter : true)
          )
        : [];

    if (selectedService) {
        return (
            <div className="p-6">
                <button onClick={() => setSelectedService(null)} className="mb-6 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
                    &larr; Back to All Services
                </button>
                <h1 className="text-3xl font-bold mb-6">Issues for {selectedService.name} ({filteredIssues.length})</h1>

                {/* Filters */}
                <div className="flex gap-4 mb-4">
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border px-2 py-1 rounded">
                        <option value="">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                    <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} className="border px-2 py-1 rounded">
                        <option value="">All Severity</option>
                        <option value="emergency">Emergency</option>
                        <option value="critical">Critical</option>
                        <option value="urgent">Urgent</option>
                        <option value="minor">Minor</option>
                    </select>
                </div>

                <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
                     <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">S. No.</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredIssues.map((issue, index) => (
                                <tr key={issue.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {issue.image_url ? (
                                        <img
                                          src={issue.image_url}
                                          alt={issue.title}
                                          className="h-16 w-16 object-cover rounded cursor-pointer"
                                          onClick={() => setModalImage(issue.image_url)}
                                        />
                                      ) : (
                                        <span className="text-gray-400 text-sm">No Image</span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{issue.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {issue.location ? (
                                            <a
                                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(issue.location)}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-blue-500 underline hover:text-blue-700"
                                            >
                                              {issue.location}
                                            </a>
                                        ) : "N/A"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${issue.severity === 'emergency' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {issue.severity}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${issue.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                        {issue.status}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(issue.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <select value={issue.status} onChange={(e) => handleStatusChange(issue.id, e.target.value)} className="border border-gray-300 rounded-md p-1">
                                            <option>Pending</option>
                                            <option>In Progress</option>
                                            <option>Resolved</option>
                                            <option>Rejected</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredIssues.length === 0 && <p className="text-center py-4 text-gray-500">No issues found for this service.</p>}
                </div>

                {/* Image Modal */}
                {modalImage && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={() => setModalImage(null)}>
                        <img src={modalImage} alt="Issue" className="max-h-[100%] max-w-[120%] rounded-lg shadow-lg" />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Emergency Services</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(service => {
                    const issueCount = issues.filter(issue => issue.category === service.category).length;
                    return (
                        <div key={service.name} onClick={() => setSelectedService(service)} className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-xl hover:scale-105 transition-transform duration-200 flex flex-col items-center text-center">
                            <service.Icon />
                            <h2 className="text-xl font-bold text-gray-800">{service.name}</h2>
                            <div className="mt-4 bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">
                                {issueCount} Active Issues
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AdminServicesPage;
