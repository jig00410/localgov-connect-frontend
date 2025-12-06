import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- Map Components ---
const MapSearch = () => {
  const map = useMap();
  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({ provider, style: 'bar', showMarker: false });
    map.addControl(searchControl);
    return () => map.removeControl(searchControl);
  }, [map]);
  return null;
};

function LocationMarker({ onLocationSelect }) {
  const [position, setPosition] = useState(null);
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng);
    },
  });
  return position === null ? null : (
    <Marker 
      position={position}
      eventHandlers={{ dblclick: () => { setPosition(null); onLocationSelect(null); } }}
    />
  );
}

// --- Main Page Component ---
function ReportIssuePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [errorMsg, setErrorMsg] = useState('');
  const [mlResult, setMlResult] = useState(null);
  const [submissionDone, setSubmissionDone] = useState(false);
  const [checkingLocation, setCheckingLocation] = useState(false);
  const [similarIssue, setSimilarIssue] = useState(null);

  // **Departments fetched from Supabase**
  const [departments, setDepartments] = useState([]);

  const navigate = useNavigate();

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      const { data, error } = await supabase.from('departments').select('id, name');
      if (error) {
        console.error('Error fetching departments:', error);
      } else {
        setDepartments(data);
      }
    };
    fetchDepartments();
  }, []);

  // 🔎 Check nearby issues
  const checkForSimilarIssues = async (latlng) => {
    if (!latlng) { setSimilarIssue(null); return; }
    setCheckingLocation(true);
    setSimilarIssue(null);
    try {
      const { data, error } = await supabase.rpc('find_nearby_issues', {
        lat_query: latlng.lat,
        lng_query: latlng.lng
      });
      if (error) throw error;
      if (data && data.length > 0) setSimilarIssue(data[0]);
    } catch (error) {
      console.error("Error checking for similar issues:", error.message);
    } finally {
      setCheckingLocation(false);
    }
  };

  // 🔔 Show toast notifications
  const showNotification = (severity, category) => {
    if (severity === 'emergency' && category === 'accident') {
      toast.info('🚑 Emergency! Ambulance has been dispatched.', { position: 'top-right', autoClose: 5000 });
    } else if (severity === 'emergency' && category === 'fire') {
      toast.info('🔥 Alert! Fire brigade is on the way.', { position: 'top-right', autoClose: 5000 });
    } else if (severity === 'urgent' && category === 'traffic') {
      toast.info('🚓 Urgent! Traffic police notified.', { position: 'top-right', autoClose: 5000 });
    }
  };

  // 📌 Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setMlResult(null);
    setSubmissionDone(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }
      if (!location) { setErrorMsg('Please pin the location on the map.'); return; }

      // --- Upload image (optional) ---
      let imageUrl = null;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('issue-images').upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('issue-images').getPublicUrl(fileName);
        imageUrl = data.publicUrl;
      }

        // --- Call ML Backend ---
        const response = await fetch('https://techxnova-localgov-backend.hf.space/predict-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `Issue Title: ${title}.`, image_url: imageUrl }),
          } );
      const prediction = await response.json();
      if (prediction.error) throw new Error(prediction.error);

      const finalSeverity = prediction.result?.final_severity || 'minor';
      const finalCategory = prediction.result?.final_category || 'unknown';
      setMlResult({ severity: finalSeverity, category: finalCategory });

      // 🔔 Show toast notification
      showNotification(finalSeverity, finalCategory);

      // --- Map ML category to department ---
      const mlCategoryToDeptName = {
        'water': 'Water Management',
        'roads': 'Road maintainance service',
        'nature': 'Nature Management',
        'electricity': 'Electrical Department',
        'sanitation': 'Sanitation & Waste Management',
        'accident': 'Ambulance',
        'fire': 'Fire brigade',
        'traffic': 'Traffic Police',
      };
      const targetDeptName = mlCategoryToDeptName[finalCategory];
      const targetDept = departments.find(d => d.name.trim() === targetDeptName);
      if (!targetDept) throw new Error(`No department found for category "${finalCategory}"`);

      // --- Save to Supabase ---
      const { error: insertError } = await supabase.from('issues').insert({
        title,
        description,
        status: 'Pending', 
        location: `${location.lat},${location.lng}`,
        department_id: targetDept.id,
        category: finalCategory,
        severity: finalSeverity,
        user_id: user.id,
        user_full_name: user.user_metadata?.full_name || 'Anonymous',
        user_avatar_url: user.user_metadata?.avatar_url || null,
        image_url: imageUrl,
      });
      if (insertError) throw insertError;

      setSubmissionDone(true);
      setTitle('');
      setDescription('');
      setLocation(null);
      setImageFile(null);

    } catch (error) {
      console.error(error);
      setErrorMsg('Error submitting issue: ' + error.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Form */}
      <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Report an Issue</h2>
        {errorMsg && <p className="mb-4 text-red-600 font-semibold">{errorMsg}</p>}
        {!submissionDone ? (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="issue-title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" id="issue-title" placeholder="e.g. Large pothole on Main Street" className="w-full px-4 py-2 border rounded-lg" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Describe the issue</label>
                <textarea id="description" rows="5" className="w-full px-4 py-2 border rounded-lg" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
              </div>
              <div className="h-64 rounded-lg overflow-hidden border">
                <MapContainer center={[19.45, 72.8]} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapSearch />
                  <LocationMarker onLocationSelect={(latlng) => { setLocation(latlng); checkForSimilarIssues(latlng); }} />
                </MapContainer>
              </div>
            </div>

            <div>
              <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-1">Add a Photo (Optional)</label>
              <input type="file" id="photo" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])}/>
            </div>

            <div className="text-right">
              <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Submit Issue</button>
            </div>
          </form>
        ) : (
          <div className="mt-6 p-6 bg-green-50 rounded-lg border-l-4 border-green-600">
            <h3 className="text-lg font-semibold text-green-700">✅ Your issue is now live in the feed!</h3>
            <div className="mt-4 flex gap-4">
              <Link to="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Go to Feed</Link>
              <button onClick={() => setSubmissionDone(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Report Another Issue</button>
            </div>
          </div>
        )}

        {mlResult && !submissionDone && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg border-l-4 border-blue-600">
            <h3 className="text-lg font-semibold">ML Prediction:</h3>
            <p>Severity: <strong>{mlResult.severity}</strong></p>
            <p>Category: <strong>{mlResult.category}</strong></p>
          </div>
        )}
      </div>

      {/* Right: Insights & Existing Reports */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Issue Insights</h3>
          {mlResult ? (
            <p className="text-gray-600">This issue is categorized as <span className="font-semibold text-blue-600">{mlResult.category}</span> with severity <span className="font-semibold text-red-600">{mlResult.severity}</span>.</p>
          ) : <p className="text-gray-600">Enter details to get predictions.</p>}
          <p className="text-xs text-gray-400 mt-2">(Automated ML prediction)</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Existing Reports Check</h3>
          {checkingLocation ? (
            <p className="text-gray-500 animate-pulse">Checking for similar issues at this location...</p>
          ) : similarIssue ? (
            <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
              <h4 className="font-bold text-red-700">⚠️ A similar issue already exists!</h4>
              <p className="text-sm text-red-600 mt-1">"{similarIssue.title}" was reported nearby.</p>
              <Link to={`/dashboard/issue/${similarIssue.id}`} className="text-sm text-blue-600 hover:underline mt-2 inline-block font-semibold">View Existing Report →</Link>
            </div>
          ) : (
            <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
              <h4 className="font-bold text-green-700">✅ All Clear!</h4>
              <p className="text-sm text-green-600 mt-1">No similar issues found at this location.</p>
            </div>
          )}
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}

export default ReportIssuePage;