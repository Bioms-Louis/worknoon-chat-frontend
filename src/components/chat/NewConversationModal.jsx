import { useState, useEffect } from "react";
import { userAPI, conversationAPI } from "../../api";
import { Avatar, RoleBadge, Spinner } from "../ui";

const TYPES = [
  { type: "support",  emoji: "🎧", label: "Customer Support",  desc: "Help with orders & issues" },
  { type: "designer", emoji: "🎨", label: "Talk to a Designer", desc: "Custom design requests" },
  { type: "merchant", emoji: "🛍️",  label: "Contact Merchant",  desc: "Questions about products or stores" },
];

const TYPE_TO_ROLE = { support: "agent", designer: "designer", merchant: "merchant" };

export default function NewConversationModal({ onClose, onCreated }) {
  const [step,     setStep]     = useState(1);
  const [type,     setType]     = useState(null);
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [creating, setCreating] = useState(false);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    if (!type) return;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await userAPI.getAgents(TYPE_TO_ROLE[type]);
        setUsers(data);
      } catch {
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [type]);

  const handleSelectUser = async (userId) => {
    setCreating(true);
    try {
      const { data } = await conversationAPI.create({ participantId: userId, type });
      onCreated(data.conversation);
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to start conversation");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            {step === 2 && (
              <button onClick={() => { setStep(1); setUsers([]); }} className="btn-ghost w-7 h-7 rounded-lg mr-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h2 className="font-bold text-gray-900 dark:text-white text-base">
              {step === 1 ? "New Conversation" : `Select a ${TYPE_TO_ROLE[type]}`}
            </h2>
          </div>
          <button onClick={onClose} className="btn-ghost w-7 h-7 rounded-lg text-lg leading-none">×</button>
        </div>

        {/* Body */}
        <div className="p-4">
          {error && (
            <div className="mb-3 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-2">
              {TYPES.map((t) => (
                <button
                  key={t.type}
                  onClick={() => { setType(t.type); setStep(2); }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-all text-left"
                >
                  <span className="text-2xl">{t.emoji}</span>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{t.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.desc}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8"><Spinner /></div>
              ) : users.length === 0 ? (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-6">
                  No {TYPE_TO_ROLE[type]}s available right now
                </p>
              ) : (
                users.map((u) => (
                  <button
                    key={u._id}
                    onClick={() => handleSelectUser(u._id)}
                    disabled={creating}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-all text-left disabled:opacity-50"
                  >
                    <Avatar user={u} size={40} showOnline />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">{u.name}</span>
                        <RoleBadge role={u.role} />
                      </div>
                      <span className={`text-xs ${u.isOnline ? "text-green-500" : "text-gray-400"}`}>
                        {u.isOnline ? "● Online" : "Offline"}
                      </span>
                    </div>
                    {creating ? <Spinner size={16} /> : (
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}