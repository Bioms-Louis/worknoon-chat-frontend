import { useState, useEffect, useCallback } from "react";
import { conversationAPI } from "../api";

export function useConversations() {
  const [conversations, setConversations] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await conversationAPI.getAll();
      setConversations(data.conversations || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const updateLastMessage = useCallback((conversationId, message, isOwn) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c._id !== conversationId) return c;
        return {
          ...c,
          lastMessage: message,
          unreadCount: isOwn ? c.unreadCount : (c.unreadCount || 0) + 1,
          updatedAt: new Date().toISOString(),
        };
      }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    );
  }, []);

  const resetUnread = useCallback((conversationId) => {
    setConversations((prev) =>
      prev.map((c) =>
        c._id === conversationId ? { ...c, unreadCount: 0 } : c
      )
    );
  }, []);

  const addConversation = useCallback((convo) => {
    setConversations((prev) => {
      const exists = prev.find((c) => c._id === convo._id);
      if (exists) return prev;
      return [convo, ...prev];
    });
  }, []);

  const removeConversation = useCallback((id) => {
    setConversations((prev) => prev.filter((c) => c._id !== id));
  }, []);

  return {
    conversations,
    loading,
    error,
    refetch: fetch,
    updateLastMessage,
    resetUnread,
    addConversation,
    removeConversation,
  };
}