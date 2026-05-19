import { useEffect, useRef, useState } from "react";
import { useMessages } from "../../hooks/useMessages";
import { useAuth }     from "../../context/AuthContext";
import { Avatar, OnlineLabel, RoleBadge, formatFullTime, formatTime } from "../ui";

export default function ChatWindow({ conversationId, conversation, onBack }) {
  const { user }                              = useAuth();
  const { messages, loading, sending, typing, typingUser, sendMessage, sendFile, emitTyping, deleteMessage } = useMessages(conversationId);
  const [input,  setInput] = useState("");
  const [filePreview, setFilePreview] = useState(null);
  const [ctxMenu, setCtxMenu] = useState(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const fileRef = useRef(null);

  const other = conversation?.participants?.find((p) => p._id !== user?._id);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Auto-resize textarea
  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text && !filePreview) return;
    if (filePreview) {
      try { await sendFile(filePreview.file); }
      catch { /* toast handled elsewhere */ }
      setFilePreview(null);
    }
    if (text) {
      await sendMessage(text);
      setInput("");
      if (textareaRef.current) { textareaRef.current.style.height = "auto"; }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    setFilePreview({
      file,
      name: file.name,
      url:  isImage ? URL.createObjectURL(file) : null,
      isImage,
    });
    e.target.value = "";
  };

  // Group messages by date
  const grouped = groupByDate(messages);

  // Close context menu on click outside
  useEffect(() => {
    const handler = () => setCtxMenu(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  if (!conversationId) return null;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">

      {/* Top bar */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        {/* Mobile back */}
        {onBack && (
          <button onClick={onBack} className="btn-ghost md:hidden">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <Avatar user={other} size={42} showOnline />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 dark:text-white text-sm truncate">{other?.name}</span>
            <RoleBadge role={other?.role} />
          </div>
          <OnlineLabel isOnline={other?.isOnline} lastSeen={other?.lastSeen} />
        </div>
        <div className="flex items-center gap-1">
          <ActionBtn icon="📞" title="Call" />
          <ActionBtn icon="📹" title="Video" />
          <ActionBtn icon="ℹ️" title="Info" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-brand-500" />
          </div>
        ) : (
          <>
            {grouped.map((item, i) => {
              if (item.type === "date") {
                return <DateDivider key={`d_${i}`} label={item.label} />;
              }
              const isOwn = item.sender?._id === user?._id || item.sender?.id === user?._id;
              const nextMsg = grouped[i + 1];
              const showAvatar = !isOwn && (!nextMsg || nextMsg.type === "date" || nextMsg.sender?._id !== item.sender?._id);
              return (
                <div
                  key={item._id}
                  className="animate-fade-up"
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setCtxMenu({ msgId: item._id, x: e.clientX, y: e.clientY, isOwn });
                  }}
                >
                  <Bubble
                    msg={item}
                    isOwn={isOwn}
                    showAvatar={showAvatar}
                    other={other}
                  />
                </div>
              );
            })}
            {typing && (
              <div className="flex items-end gap-2 py-1">
                <Avatar user={other} size={28} />
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 flex gap-1 items-center">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 inline-block animate-bounce-dot"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
                {typingUser && (
                  <span className="text-xs text-gray-400">{typingUser} is typing…</span>
                )}
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* File preview bar */}
      {filePreview && (
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3 bg-gray-50 dark:bg-gray-900">
          {filePreview.isImage ? (
            <img src={filePreview.url} alt="" className="h-12 w-12 object-cover rounded-lg" />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-xl">📄</div>
          )}
          <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">{filePreview.name}</span>
          <button onClick={() => setFilePreview(null)} className="btn-ghost text-xs text-red-500">Remove</button>
        </div>
      )}

      {/* Input bar */}
      <div className="px-4 pb-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
        <div className="flex items-end gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-3 py-2">
          {/* Emoji stub */}
          <button
            className="text-gray-400 hover:text-yellow-500 transition-colors text-xl flex-shrink-0 pb-0.5"
            title="Emoji"
            onClick={() => {}} // plug in emoji-picker-react if needed
          >
            😊
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            rows={1}
            onChange={(e) => { setInput(e.target.value); emitTyping(); resizeTextarea(); }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            className="flex-1 bg-transparent resize-none text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none py-1 max-h-[120px] overflow-y-auto"
          />

          {/* File attach */}
          <input ref={fileRef} type="file" className="hidden" multiple onChange={handleFileChange} />
          <button
            onClick={() => fileRef.current?.click()}
            className="text-gray-400 hover:text-brand-500 transition-colors flex-shrink-0 pb-0.5"
            title="Attach file"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          {/* Send */}
          <button
            onClick={handleSend}
            disabled={(!input.trim() && !filePreview) || sending}
            className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
              (input.trim() || filePreview) && !sending
                ? "bg-brand-500 hover:bg-brand-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            {sending ? (
              <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-1.5 ml-1">
          Enter to send · Shift+Enter for new line
        </p>
      </div>

      {/* Right-click context menu */}
      {ctxMenu && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 min-w-[140px]"
          style={{ top: ctxMenu.y, left: ctxMenu.x }}
        >
          {ctxMenu.isOwn && (
            <button
              onClick={() => { deleteMessage(ctxMenu.msgId); setCtxMenu(null); }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              🗑 Delete
            </button>
          )}
          <button
            onClick={() => {
              const msg = messages.find((m) => m._id === ctxMenu.msgId);
              if (msg) navigator.clipboard?.writeText(msg.content);
              setCtxMenu(null);
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            📋 Copy text
          </button>
        </div>
      )}
    </div>
  );
}

// Sub-components 

function ActionBtn({ icon, title }) {
  return (
    <button
      title={title}
      className="btn-ghost w-8 h-8 rounded-lg text-base"
    >
      {icon}
    </button>
  );
}

function DateDivider({ label }) {
  return (
    <div className="flex items-center gap-3 my-3">
      <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
      <span className="text-[11px] font-medium text-gray-400 dark:text-gray-600">{label}</span>
      <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
    </div>
  );
}

function Bubble({ msg, isOwn, showAvatar, other }) {
  if (msg.isDeleted) {
    return (
      <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-0.5`}>
        <span className="text-xs text-gray-400 dark:text-gray-600 italic px-3 py-1.5 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
          This message was deleted
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-2 mb-0.5 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      <div className="w-7 flex-shrink-0">
        {!isOwn && showAvatar && <Avatar user={other} size={28} />}
      </div>
      <div className={`flex flex-col max-w-[68%] ${isOwn ? "items-end" : "items-start"}`}>
        {/* File / image */}
        {msg.type === "image" && msg.fileUrl && (
          <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="mb-1">
            <img src={msg.fileUrl} alt={msg.fileName || "image"} className="max-w-[220px] rounded-xl border border-gray-100 dark:border-gray-700 object-cover" />
          </a>
        )}
        {msg.type === "file" && msg.fileUrl && (
          <a
            href={msg.fileUrl}
            target="_blank"
            rel="noreferrer"
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border mb-1 text-sm font-medium transition-colors ${
              isOwn
                ? "bg-brand-600 border-brand-700 text-white"
                : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            📎 {msg.fileName || "File"}
          </a>
        )}
        {/* Text bubble */}
        {msg.content && (
          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
            isOwn
              ? "bg-brand-500 text-white rounded-br-sm"
              : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm"
          }`}>
            {msg.content}
          </div>
        )}
        {/* Meta */}
        <div className={`flex items-center gap-1.5 mt-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            {formatFullTime(msg.createdAt)}
          </span>
          {isOwn && (
            <span className={`text-[11px] ${msg.readBy?.length > 1 ? "text-brand-500" : "text-gray-400"}`}>
              {msg.readBy?.length > 1 ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Helpers
function groupByDate(messages) {
  const groups = [];
  let lastDate = null;
  for (const msg of messages) {
    const dateStr = new Date(msg.createdAt).toLocaleDateString();
    if (dateStr !== lastDate) {
      const today     = new Date().toLocaleDateString();
      const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();
      groups.push({
        type:  "date",
        label: dateStr === today ? "Today" : dateStr === yesterday ? "Yesterday" : dateStr,
      });
      lastDate = dateStr;
    }
    groups.push({ type: "message", ...msg });
  }
  return groups;
}