import SessionListItem from "./SessionListItem";

export default function SessionList({ sessions = [], activeSessionId, onSelectSession }) {
  return (
    <div className="h-full overflow-auto glm-scroll p-2 space-y-2">
      {sessions.map((session) => (
        <SessionListItem
          key={session.id}
          session={session}
          active={session.id === activeSessionId}
          onClick={onSelectSession}
        />
      ))}
    </div>
  );
}
