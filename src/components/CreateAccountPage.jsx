import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function CreateAccountPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSignUp(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName,
            // default role for new signups
            role: 'citizen',
          }
        }
      });

      if (error) throw error;
      
      alert('Account created successfully! Please check your email to verify your account.');
      navigate('/login');

    } catch (error) {
      setError(error.message);
      console.error('Signup Error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden">
        
        {/* Left Informational Panel - Added 'relative' to contain the overlay */}
        <div className="relative w-full md:w-1/2 p-8 md:p-12 text-white flex flex-col justify-center items-center text-center bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1594114532499-23c8e4a7a9d2?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=3600')"}}>
          <div className="absolute inset-0 bg-blue-800 bg-opacity-75"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-4">Join the Community</h1>
            <p className="mb-8">Create an account to report issues, track their progress, and contribute to a better, smarter city.</p>
            <Link to="/" className="px-6 py-2 border border-white rounded-full hover:bg-white hover:text-blue-700 transition-colors">
              Learn More
            </Link>
          </div>
        </div>

        {/* Right Signup Form Panel */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h2 className="text-3xl font-bold text-blue-600 text-center mb-6">Create Your Citizen Account</h2>
          
          {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg text-center mb-4">{error}</p>}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <input 
                type="text" 
                placeholder="Full Name" 
                className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
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
                placeholder="Password (min. 6 characters)" 
                className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength="6"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-bold disabled:bg-blue-400"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-6">
            Already have an account? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Log In</Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default CreateAccountPage;

