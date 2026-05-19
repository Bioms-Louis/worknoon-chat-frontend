import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/chat/Sidebar";
import ChatWindow from "../components/chat/ChatWindow";
import NewConversationModal from "../components/chat/NewConversationModal";
import { EmptyState } from "../components/ui";
import { useConversations }  from "../hooks/useConversations";
import { useNotifications }  from "../hooks/useNotifications";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import { conversationAPI } from "../api";

export default function InboxPage() {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const { unreadCount } = useNotifications();
  const {
    conversations,
    loading,
    updateLastMessage,
    resetUnread,
    addConversation,
  } = useConversations();

  const [activeId, setActiveId] = useState(paramId || null);
  const [activeConvo, setActiveConvo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [mobileView, setMobileView]  = useState("list"); 

  // Sync URL param → active id
  useEffect(() => {
    if (paramId) setActiveId(paramId);
  }, [paramId]);

  // Load active conversation details
  useEffect(() => {
    if (!activeId) { setActiveConvo(null); return; }
    conversationAPI.getOne(activeId)
      .then(({ data }) => setActiveConvo(data))
      .catch(() => setActiveConvo(null));
  }, [activeId]);

  // Real-time: update sidebar when new message arrives
  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      const isOwn = msg.sender?._id === user?._id;
      updateLastMessage(msg.conversation, msg, isOwn);
    };
    socket.on("message:new", handler);
    return () => socket.off("message:new", handler);
  }, [socket, user, updateLastMessage]);

  // Real-time: update online status in conversation list
  useEffect(() => {
    if (!socket) return;
    const onOnline  = ({ userId })           => updateOnlineStatus(userId, true);
    const onOffline = ({ userId, lastSeen }) => updateOnlineStatus(userId, false, lastSeen);
    socket.on("user:online",  onOnline);
    socket.on("user:offline", onOffline);
    return () => { socket.off("user:online", onOnline); socket.off("user:offline", onOffline); };
  }, [socket]); // eslint-disable-line

  const updateOnlineStatus = (userId, isOnline, lastSeen) => {
    setActiveConvo((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        participants: prev.participants?.map((p) =>
          p._id === userId ? { ...p, isOnline, lastSeen: lastSeen || p.lastSeen } : p
        ),
      };
    });
  };

  const selectConversation = (id) => {
    setActiveId(id);
    resetUnread(id);
    setMobileView("chat");
    navigate(`/inbox/${id}`, { replace: true });
  };

  const handleNewConvo = (convo) => {
    addConversation(convo);
    selectConversation(convo._id);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-950">

      {/* Connection status banner */}
      {!connected && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-amber-500 text-white text-xs text-center py-1 font-medium">
          ⚡ Reconnecting to real-time server…
        </div>
      )}

      {/* Sidebar — hidden on mobile when chatting */}
      <div className={`${mobileView === "chat" ? "hidden md:flex" : "flex"} flex-shrink-0`}>
        <Sidebar
          conversations={conversations}
          loading={loading}
          activeId={activeId}
          onSelect={selectConversation}
          onNewConvo={() => setShowModal(true)}
        />
      </div>

      {/* Chat pane — hidden on mobile when viewing list */}
      <main className={`${mobileView === "list" ? "hidden md:flex" : "flex"} flex-1 flex-col min-w-0 overflow-hidden`}>
        {activeId && activeConvo ? (
          <ChatWindow
            conversationId={activeId}
            conversation={activeConvo}
            onBack={() => { setMobileView("list"); navigate("/inbox"); }}
          />
        ) : (
          <EmptyState
            icon="💬"
            title="Select a conversation"
            description="Choose a conversation from the sidebar, or start a new one to begin messaging."
            action={
              <button onClick={() => setShowModal(true)} className="btn-primary mt-2">
                + Start a conversation
              </button>
            }
          />
        )}
      </main>

      {/* New conversation modal */}
      {showModal && (
        <NewConversationModal
          onClose={() => setShowModal(false)}
          onCreated={handleNewConvo}
        />
      )}
    </div>
  );
}