import { useState, useEffect, useCallback } from 'react';
import { notificationAPI } from '../api';
import { useSocket } from '../context/SocketContext';

export function useNotifications() {
    const { socket } = useSocket();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetch = useCallback(async () => {
        try {
            const { data } = await notificationAPI.getAll();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (e) {
            console.error("Failed to fetch notifications", e);
        }
    }, []);

    useEffect (() => { fetch(); }, [fetch]);

    useEffect(() => {
        if (!socket) return;
        const handler = (notif) => {
            setNotifications((prev) => [notif, ...prev]);
            setUnreadCount((prev) => prev + 1);
        };
        socket.on('notification:new', handler);
        return () => socket.off('notification:new', handler);
    }, [socket]);

    const markRead = useCallback(async (id) => {
    await notificationAPI.markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationAPI.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);
 
  return { notifications, unreadCount, fetch, markRead, markAllRead };

}