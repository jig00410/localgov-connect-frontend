import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon for Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Generic icon for department cards
const DepartmentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
);

const AdminDepartmentsPage = () => {
    const [departments, setDepartments] = useState([]);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDept, setSelectedDept] = useState(null);
    const [modalImage, setModalImage] = useState(null);
    const [filters, setFilters] = useState({ severity: 'all', status: 'all' });

    const servicesToRemove = ["Fire brigade ", "Traffic Police", "Ambulance "];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [deptsRes, issuesRes] = await Promise.all([
                    supabase.from('departments').select('*').order('name', { ascending: true }),
                    supabase.from('issues').select('*').order('created_at', { ascending: false })
                ]);
                if (deptsRes.error) throw deptsRes.error;
                if (issuesRes.error) throw issuesRes.error;
                setDepartments(deptsRes.data || []);
                setIssues(issuesRes.data || []);
            } catch (error) {
                console.error("Error fetching data:", error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleStatusChange = async (issueId, newStatus) => {
        try {
            const { error } = await supabase.from('issues').update({ status: newStatus }).eq('id', issueId);
            if (error) throw error;
            setIssues(prev => prev.map(issue => issue.id === issueId ? { ...issue, status: newStatus } : issue));
            alert("Status updated!");
        } catch (error) {
            alert("Error updating status: " + error.message);
        }
    };

    if (loading) return <div>Loading...</div>;

    const filteredDepartments = departments.filter(dept => !servicesToRemove.includes(dept.name));

    const filteredIssues = selectedDept
        ? issues.filter(issue => issue.department_id === selectedDept.id
            && (filters.severity === 'all' || issue.severity === filters.severity)
            && (filters.status === 'all' || issue.status === filters.status)
        )
        : [];

    return (
        <div className="p-6">
            {selectedDept ? (
                <div>
                    <button onClick={() => setSelectedDept(null)} className="mb-4 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
                        ← Back to All Departments
                    </button>
                    <h1 className="text-3xl font-bold mb-4">
                        Issues for {selectedDept.name} ({filteredIssues.length})
                    </h1>

                    {/* Filter Controls */}
                    <div className="flex gap-4 mb-4">
                        <select
                            value={filters.severity}
                            onChange={e => setFilters({ ...filters, severity: e.target.value })}
                            className="border border-gray-300 rounded-md p-2"
                        >
                            <option value="all">All Severities</option>
                            <option value="critical">Critical</option>
                            <option value="urgent">Urgent</option>
                            <option value="needs attention">Needs Attention</option>
                            <option value="minor">Minor</option>
                        </select>

                        <select
                            value={filters.status}
                            onChange={e => setFilters({ ...filters, status: e.target.value })}
                            className="border border-gray-300 rounded-md p-2"
                        >
                            <option value="all">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Rejected">Rejected</option>
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
                                        <td className="px-6 py-4">
                                            {issue.location ? (
                                                <a
                                                    href={
                                                        issue.latitude && issue.longitude
                                                            ? `https://www.google.com/maps?q=${issue.latitude},${issue.longitude}`
                                                            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(issue.location)}`
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 underline hover:text-blue-700 whitespace-nowrap"
                                                >
                                                    {issue.location}
                                                </a>
                                            ) : ( "N/A" )}

                                            {issue.latitude && issue.longitude && (
                                                <div className="mt-2">
                                                    <MapContainer
                                                        center={[issue.latitude, issue.longitude]}
                                                        zoom={13}
                                                        scrollWheelZoom={false}
                                                        style={{ height: '150px', width: '200px' }}
                                                    >
                                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                                        <Marker position={[issue.latitude, issue.longitude]}>
                                                            <Popup>
                                                                <strong>{issue.title}</strong>
                                                                <br />
                                                                <a href={`https://www.google.com/maps?q=${issue.latitude},${issue.longitude}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                                                    Open in Google Maps
                                                                </a>
                                                            </Popup>
                                                        </Marker>
                                                    </MapContainer>
                                                </div>
                                            )}
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
                        {filteredIssues.length === 0 && <p className="text-center py-4 text-gray-500">No issues found for this department.</p>}
                    </div>
                </div>
            ) : (
                <div>
                    <h1 className="text-3xl font-bold mb-6">Civic Departments</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredDepartments.map(dept => {
                            const issueCount = issues.filter(issue => issue.department_id === dept.id).length;
                            return (
                                <div key={dept.id} onClick={() => setSelectedDept(dept)} className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-xl hover:scale-105 transition-transform duration-200 flex flex-col items-center text-center">
                                    <DepartmentIcon />
                                    <h2 className="text-xl font-bold text-gray-800">{dept.name}</h2>
                                    <p className="text-gray-500 mt-2">{dept.description}</p>
                                    <div className="mt-4 bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                                        {issueCount} Open Issues
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Modal for viewing image */}
            {modalImage && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={() => setModalImage(null)}>
                    <img src={modalImage} alt="Issue" className="max-h-[100%] max-w-[120%] rounded-lg shadow-lg" />
                </div>
            )}
        </div>
    );
};

export default AdminDepartmentsPage;