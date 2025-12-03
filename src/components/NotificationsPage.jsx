import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) {
      setNotifications(data);

      // 🚀 Mark page opened time in localStorage
      const now = new Date().toISOString();
      localStorage.setItem("lastOpenedNotifications", now);
    }
    setLoading(false);
  };

  const handleNotificationClick = (notification) => {
    if (notification.issue_id) {
      navigate(`/dashboard/issue/${notification.issue_id}`);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading notifications...</div>;
  }

  const lastOpened = localStorage.getItem("lastOpenedNotifications");

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">All Notifications</h1>
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notif) => {
            const isNew =
              lastOpened &&
              new Date(notif.created_at) > new Date(lastOpened);

            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 border rounded-lg cursor-pointer ${
                  isNew ? "bg-blue-100 hover:bg-blue-200" : "bg-white hover:bg-gray-50"
                }`}
              >
                <p className="text-gray-800">{notif.message}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(notif.created_at).toLocaleString()}
                </p>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500">You have no notifications.</p>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
