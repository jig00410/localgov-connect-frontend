import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const BellIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

const NotificationIcon = () => {
  const [hasNew, setHasNew] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkForNew();

    const channel = supabase
      .channel("realtime-notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => {
          console.log("Change detected in notifications, checking for new...");
          checkForNew();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkForNew = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("notifications")
      .select("created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (!error && data && data.length > 0) {
      const lastNotif = new Date(data[0].created_at);
      const lastOpened = localStorage.getItem("lastOpenedNotifications");

      if (!lastOpened || lastNotif > new Date(lastOpened)) {
        setHasNew(true);
      } else {
        setHasNew(false);
      }
    }
  };

  const handleClick = () => {
    // 🚀 Mark current time as "last opened"
    const now = new Date().toISOString();
    localStorage.setItem("lastOpenedNotifications", now);
    setHasNew(false);

    navigate("/dashboard/notifications");
  };

  return (
    <button onClick={handleClick} className="relative text-gray-600">
      <BellIcon />
      {hasNew && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      )}
    </button>
  );
};

export default NotificationIcon;
