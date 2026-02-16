import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, CloseIcon, IconButton } from "../ui/Icons";

export default function NotificationsPanel({
  notifications = [],
  onMarkAllRead,
  onClose,
}) {
  const [openIds, setOpenIds] = useState([]);

  function toggleNotification(id) {
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <div className="h-full min-h-0 grid grid-rows-[auto_1fr] gap-3 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Notifications</h3>
          <IconButton title="Close Notifications" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </div>
        <button className="glm-btn glm-btn--ghost" onClick={onMarkAllRead} type="button">
          Mark all read
        </button>
      </div>

      <div className="space-y-2 overflow-auto glm-scroll pr-1">
        {notifications.length === 0 ? (
          <p className="text-sm text-[rgb(var(--glm-text-2))]">No notifications.</p>
        ) : (
          notifications.map((item) => {
            const open = openIds.includes(item.id);
            return (
              <article
                key={item.id}
                className={`rounded-xl border p-3 ${
                  item.read
                    ? "border-[rgba(var(--glm-border),0.8)]"
                    : "border-[rgba(var(--glm-purple),0.7)] bg-[rgba(var(--glm-purple),0.08)]"
                }`}
              >
                <button
                  className="flex w-full items-center justify-between text-left"
                  onClick={() => toggleNotification(item.id)}
                  type="button"
                >
                  <p className="text-sm font-medium">{item.title}</p>
                  <span className="text-xs text-[rgb(var(--glm-text-2))]" title={open ? "Collapse" : "Expand"}>
                    {open ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                  </span>
                </button>

                {open ? (
                  <p className="mt-2 text-xs text-[rgb(var(--glm-text-2))]">{item.description}</p>
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
