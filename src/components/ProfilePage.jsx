import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';


// Modal component
const Modal = ({ children, onClose }) => (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
    onClick={onClose}
  >
    <div
      className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

const ProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // State to control modals
  const [modalView, setModalView] = useState(null);

  // Profile details state
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Statistics State
  const [stats, setStats] = useState({ total: 0 });

  // 🎖️ Achievement milestones
  const achievements = [
    { milestone: 1, icon: '🎯', name: 'First Responder' },
    { milestone: 5, icon: '🏅', name: 'Community Hero' },
    { milestone: 10, icon: '🛡️', name: 'Top Reporter' },
    { milestone: 20, icon: '🌟', name: 'Legend of Service' },
  ];

  // Use a ref to track achievements shown in the current session
  const achievementsShown = useRef(new Set());

  useEffect(() => {
    // 💡 FIX: Load the history of shown achievements from localStorage on mount
    const storedAchievements = localStorage.getItem('achievementsShown');
    if (storedAchievements) {
      achievementsShown.current = new Set(JSON.parse(storedAchievements));
    }

    const fetchAllData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUser(user);
        setFullName(user.user_metadata?.full_name || '');
        setAvatarUrl(user.user_metadata?.avatar_url);
        fetchStats(user.id);
      } else {
        navigate('/login');
      }
      setLoading(false);
    };
    fetchAllData();
  }, [navigate]);

  const fetchStats = async (userId) => {
    const { count: totalCount } = await supabase
      .from('issues')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const total = totalCount || 0;
    setStats({ total });

    let newAchievementEarned = false;
    // Check for newly earned achievements
    achievements.forEach((ach) => {
      if (total >= ach.milestone && !achievementsShown.current.has(ach.milestone)) {
        // If earned and not shown before, show toast and add to set
        achievementsShown.current.add(ach.milestone);
        toast.success(`🎉 Achievement Unlocked: ${ach.name}!`);
        newAchievementEarned = true;
      }
    });

    // 💡 FIX: If a new achievement was shown, save the updated list to localStorage
    if (newAchievementEarned) {
      localStorage.setItem(
        'achievementsShown',
        JSON.stringify(Array.from(achievementsShown.current))
      );
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const uploadAvatar = async (event) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}.${fileExt}`;

    const { error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (error) {
      toast.error('Error uploading avatar: ' + error.message);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl },
    });

    if (updateError) {
      toast.error('Error updating avatar URL: ' + updateError.message);
    } else {
      setAvatarUrl(publicUrl);
      toast.success('Profile picture updated!');
    }
  };

  const handleUpdateProfile = async () => {
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName },
    });
    if (error) {
      toast.error('Error updating profile: ' + error.message);
    } else {
      toast.success('Profile updated successfully!');
      setModalView(null);
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      setUser(updatedUser);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error('Error updating password: ' + error.message);
    } else {
      toast.success('Password updated successfully!');
      setModalView(null);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading profile...</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="bg-white shadow rounded-2xl p-6 text-center">
        <img
          src={avatarUrl || 'https://via.placeholder.com/100'}
          alt="Profile Avatar"
          className="w-24 h-24 rounded-full mx-auto mb-4"
        />
        <h2 className="text-xl font-bold">{fullName || 'No Name'}</h2>
        <p className="text-gray-500 mb-4">{user?.email}</p>

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg mr-2"
          onClick={() => setModalView('editProfile')}
        >
          Edit Profile
        </button>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded-lg mr-2"
          onClick={() => setModalView('changePassword')}
        >
          Change Password
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded-lg"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {/* Stats */}
      <div className="bg-gray-50 shadow rounded-2xl p-6 mt-6">
        <h3 className="text-lg font-bold mb-4">📊 Your Stats</h3>
        <p>Total Issues Posted: <span className="font-bold">{stats.total}</span></p>
      </div>

      {/* Achievements */}
      <div className="bg-yellow-50 shadow rounded-2xl p-6 mt-6">
        <h3 className="text-lg font-bold mb-4">🏆 Achievements</h3>
        <div className="grid grid-cols-2 gap-4">
          {achievements
            .filter((ach) => stats.total >= ach.milestone) // only show earned
            .map((ach) => (
              <div
                key={ach.milestone}
                className="p-4 rounded-xl shadow text-center bg-green-100"
              >
                <div className="text-3xl">{ach.icon}</div>
                <p className="font-bold">{ach.name}</p>
                <small>{ach.milestone} Issues</small>
              </div>
            ))}
        </div>
      </div>

      {/* Modals */}
      {modalView === 'editProfile' && (
        <Modal onClose={() => setModalView(null)}>
          <h2 className="text-lg font-bold mb-4">Edit Profile</h2>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg mb-4"
            placeholder="Full Name"
          />
          <input
            type="file"
            accept="image/*"
            onChange={uploadAvatar}
            className="mb-4"
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            onClick={handleUpdateProfile}
          >
            Save Changes
          </button>
        </Modal>
      )}

      {modalView === 'changePassword' && (
        <Modal onClose={() => setModalView(null)}>
          <h2 className="text-lg font-bold mb-4">Change Password</h2>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg mb-4"
            placeholder="New Password"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg mb-4"
            placeholder="Confirm Password"
          />
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-lg"
            onClick={handleUpdatePassword}
          >
            Update Password
          </button>
        </Modal>
      )}
    </div>
  );
};

export default ProfilePage;