// Avatar
const ROLE_PALETTE = {
    admin: "bg-amber-100  text-amber-800  dark:bg-amber-900  dark:text-amber-200",
    agent: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    customer: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    designer: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
    merchant: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
};

export function Avatar({ user, size = 40, showOnline = false, className = "" }) {
  const initials = (user?.name || "?")
    .split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const palette  = ROLE_PALETTE[user?.role] || ROLE_PALETTE.customer;
  const px       = typeof size === "number" ? `${size}px` : size;
 
  return (
    <div className={`relative flex-shrink-0 ${className}`} style={{ width: px, height: px }}>
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <div
          className={`w-full h-full rounded-full flex items-center justify-center font-semibold ${palette}`}
          style={{ fontSize: `${parseInt(px) * 0.36}px` }}
        >
          {initials}
        </div>
      )}
      {showOnline && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-gray-900 ${user?.isOnline ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}
          style={{ width: `${parseInt(px) * 0.28}px`, height: `${parseInt(px) * 0.28}px` }}
        />
      )}
    </div>
  );
}

// RoleBadge
const BADGE_PALETTE = {
  admin:    "bg-amber-100  text-amber-800  dark:bg-amber-900/40  dark:text-amber-300",
  agent:    "bg-blue-100   text-blue-800   dark:bg-blue-900/40   dark:text-blue-300",
  customer: "bg-gray-100   text-gray-600   dark:bg-gray-800      dark:text-gray-400",
  designer: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
  merchant: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
};

export function RoleBadge({ role, className = "" }) {
  const palette = BADGE_PALETTE[role] || BADGE_PALETTE.customer;
  return (
    <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${palette} ${className}`}>
      {role}
    </span>
  );
}

// Spinner
export function Spinner({ size = 20, className = "" }) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-gray-200 dark:border-gray-700 border-t-brand-500 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

// EmptyState
export function EmptyState({ icon = "💬", title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-10 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-3xl">
        {icon}
      </div>
      {title && (
        <p className="font-semibold text-gray-800 dark:text-gray-200 text-base">{title}</p>
      )}
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

// Onlinr dot label
export function OnlineLabel({ isOnline, lastSeen }) {
  if (isOnline) {
    return <span className="text-xs text-green-500 font-medium">● Online</span>;
  }
  const ago = lastSeen
    ? (() => {
        const diff = Date.now() - new Date(lastSeen);
        const m = Math.floor(diff / 60000);
        if (m < 1)   return "just now";
        if (m < 60)  return `${m}m ago`;
        const h = Math.floor(m / 60);
        if (h < 24)  return `${h}h ago`;
        return `${Math.floor(h / 24)}d ago`;
      })()
    : null;
  return (
    <span className="text-xs text-gray-400 dark:text-gray-500">
      {ago ? `Last seen ${ago}` : "Offline"}
    </span>
  );
}

// Toast
export function formatTime(date) {
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  const m = Math.floor(diff / 60000);
  if (m < 1)   return "just now";
  if (m < 60)  return `${m}m`;
  if (m < 1440) return `${Math.floor(m / 60)}h`;
  if (m < 10080) return `${Math.floor(m / 1440)}d`;
  return d.toLocaleDateString();
}
 
export function formatFullTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}