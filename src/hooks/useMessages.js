import { useState, useEffect, useCallback, useRef } from "react";
import { messageAPI } from "../api";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";

export function useMessages(conversationId) {
  const { socket }   = useSocket();
  const { user }     = useAuth();
  const [messages,  setMessages]  = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [sending,   setSending]   = useState(false);
  const [typing,    setTyping]    = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const typingTimer = useRef(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    if (!conversationId) { setMessages([]); return; }

    const load = async () => {
      try {
        setLoading(true);
        const { data } = await messageAPI.getMessages(conversationId);
        setMessages(data.messages || []);
        
        await messageAPI.markAllRead(conversationId).catch(() => {});
      } catch (e) {
        console.error("Failed to load messages:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [conversationId]);

 
  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.emit("join:conversation", conversationId);

    const onNewMessage = (msg) => {
      setMessages((prev) => {
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      
      if (msg.sender._id !== user?._id && msg.sender?.id !== user?._id) {
        socket.emit("message:read", { messageId: msg._id, conversationId });
      }
    };

    const onDeleted = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, isDeleted: true, content: "" } : m
        )
      );
    };

    const onRead = ({ messageId, userId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId && !m.readBy?.includes(userId)
            ? { ...m, readBy: [...(m.readBy || []), userId] }
            : m
        )
      );
    };

    const onTypingStart = ({ userId: tid, userName }) => {
      if (tid === user?._id) return;
      setTyping(true);
      setTypingUser(userName);
    };

    const onTypingStop = ({ userId: tid }) => {
      if (tid === user?._id) return;
      setTyping(false);
      setTypingUser(null);
    };

    socket.on("message:new",     onNewMessage);
    socket.on("message:deleted", onDeleted);
    socket.on("message:read",    onRead);
    socket.on("typing:start",    onTypingStart);
    socket.on("typing:stop",     onTypingStop);

    return () => {
      socket.off("message:new",     onNewMessage);
      socket.off("message:deleted", onDeleted);
      socket.off("message:read",    onRead);
      socket.off("typing:start",    onTypingStart);
      socket.off("typing:stop",     onTypingStop);
      socket.emit("leave:conversation", conversationId);
    };
  }, [socket, conversationId, user]);

  const sendMessage = useCallback(async (content) => {
    if (!content?.trim() || !conversationId) return;
    setSending(true);
    try {
      
      socket?.emit("message:send", { conversationId, content: content.trim(), type: "text" });
      } catch (e) {
      console.error("Send failed:", e);
    } finally {
      setSending(false);
    }
  }, [socket, conversationId]);

  const sendFile = useCallback(async (file) => {
    if (!file || !conversationId) return;
    setSending(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("type", file.type.startsWith("image/") ? "image" : "file");
      const { data } = await messageAPI.sendFile(conversationId, form);
      setMessages((prev) => {
        if (prev.find((m) => m._id === data._id)) return prev;
        return [...prev, data];
      });
    } catch (e) {
      console.error("File send failed:", e);
      throw e;
    } finally {
      setSending(false);
    }
  }, [conversationId]);

  const emitTyping = useCallback(() => {
    if (!socket || !conversationId) return;
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("typing:start", { conversationId });
    }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit("typing:stop", { conversationId });
    }, 1500);
  }, [socket, conversationId]);

  const deleteMessage = useCallback(async (messageId) => {
    try {
      socket?.emit("message:delete", { messageId, conversationId });
      await messageAPI.deleteMsg(messageId);
    } catch (e) {
      console.error("Delete failed:", e);
    }
  }, [socket, conversationId]);

  return {
    messages, loading, sending, typing, typingUser,
    sendMessage, sendFile, emitTyping, deleteMessage,
  };
}