import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function OfficialLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (loginError) throw loginError;

      const { data: { user } } = await supabase.auth.getUser();
      
      if (user?.user_metadata?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        await supabase.auth.signOut();
      setError('You are not authorized to access the admin panel.');
      }

    } catch (error) {
      setError(error.message);
      console.error('Login Error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden">
        
        {/* Left Informational Panel */}
        <div className="relative w-full md:w-1/2 p-8 md:p-12 text-white flex flex-col justify-center items-center text-center bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=3600')"}}>
          <div className="absolute inset-0 bg-gray-900 bg-opacity-60"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-4">Official Portal</h1>
            <p className="mb-8">Access the dashboard to manage, track, and resolve citizen-reported issues efficiently.</p>
          </div>
        </div>

        {/* Right Login Form Panel */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Official Login</h2>
          
          {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg text-center mb-4">{error}</p>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="email" 
                placeholder="Email Address" 
                className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <input 
                type="password" 
                placeholder="Password" 
                className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-900 transition-colors font-bold disabled:bg-gray-600"
              disabled={loading}
            >
              {loading ? 'Logging In...' : 'LOGIN AS OFFICIAL'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default OfficialLoginPage;
