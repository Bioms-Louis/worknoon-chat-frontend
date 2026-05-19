import { useState } from "react";
import { Avatar, RoleBadge, formatTime } from "../ui";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const FILTERS = ["all", "support", "designer", "merchant"];

export default function Sidebar({
  conversations,
  loading,
  activeId,
  onSelect,
  onNewConvo,
}) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = conversations.filter((c) => {
    const other = c.participants?.find((p) => p._id !== user?._id);
    const matchSearch =
      !search ||
      other?.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage?.content?.toLowerCase().includes(search.toLowerCase()) ||
      c.subject?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || c.type === filter;
    return matchSearch && matchFilter;
  });

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <aside className="flex flex-col h-full w-80 min-w-[260px] max-w-xs bg-gray-50 dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800">

      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <Avatar user={user} size={36} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user?.name}
              </p>
              <RoleBadge role={user?.role} />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="btn-ghost w-8 h-8 rounded-lg"
              title="Toggle theme"
            >
              {dark ? "☀️" : "🌙"}
            </button>
            {/* Logout */}
            <button
              onClick={logout}
              className="btn-ghost w-8 h-8 rounded-lg"
              title="Logout"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Title + new convo button */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-gray-900 dark:text-white text-base">Messages</h1>
            {totalUnread > 0 && (
              <span className="bg-brand-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {totalUnread > 99 ? "99+" : totalUnread}
              </span>
            )}
          </div>
          <button
            onClick={onNewConvo}
            className="btn-primary !py-1.5 !px-3 text-xs rounded-lg"
          >
            + New
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations…"
            className="input-base !pl-9 !py-2 text-xs"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 px-3 py-2 border-b border-gray-100 dark:border-gray-800 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === f
                ? "bg-brand-500 text-white"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto py-2 px-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-brand-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-400 dark:text-gray-600 text-sm">
            {search ? "No conversations found" : "No conversations yet"}
          </div>
        ) : (
          filtered.map((c) => <ConvoItem key={c._id} convo={c} isActive={c._id === activeId} onSelect={onSelect} currentUserId={user?._id} />)
        )}
      </div>
    </aside>
  );
}

function ConvoItem({ convo, isActive, onSelect, currentUserId }) {
  const other   = convo.participants?.find((p) => p._id !== currentUserId);
  const preview = convo.lastMessage?.content || "No messages yet";
  const isOwn   = convo.lastMessage?.sender?._id === currentUserId ||
                  convo.lastMessage?.sender === currentUserId;

  return (
    <button
      onClick={() => onSelect(convo._id)}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-150 mb-0.5 ${
        isActive
          ? "bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800/40"
          : "hover:bg-gray-100 dark:hover:bg-gray-800/60"
      }`}
    >
      <Avatar user={other} size={44} showOnline />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className={`text-sm truncate ${convo.unreadCount > 0 ? "font-bold text-gray-900 dark:text-white" : "font-medium text-gray-800 dark:text-gray-200"}`}>
            {other?.name || "Unknown"}
          </span>
          <span className="text-[11px] text-gray-400 dark:text-gray-500 flex-shrink-0 ml-1">
            {convo.lastMessage?.createdAt
              ? formatTime(convo.lastMessage.createdAt)
              : formatTime(convo.updatedAt)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-xs truncate ${convo.unreadCount > 0 ? "text-gray-700 dark:text-gray-300 font-medium" : "text-gray-400 dark:text-gray-500"}`}>
            {isOwn ? "You: " : ""}{preview.length > 45 ? preview.slice(0, 45) + "…" : preview}
          </span>
          {convo.unreadCount > 0 && (
            <span className="ml-2 bg-brand-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 flex-shrink-0">
              {convo.unreadCount > 99 ? "99+" : convo.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}