import { useEffect, useMemo, useRef, useState } from "react";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export default function SplitPane({
  left,
  center,
  right,
  showLeft = true,
  showRight = true,
  storageKey = "splitpane",
  minLeft = 240,
  maxLeft = 460,
  minRight = 260,
  maxRight = 520,
}) {
  const defaults = useMemo(() => ({ left: 300, right: 340 }), []);
  const [sizes, setSizes] = useState(defaults);
  const [narrow, setNarrow] = useState(false);
  const dragRef = useRef({ side: null, startX: 0, startLeft: 0, startRight: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setSizes({
        left: clamp(parsed.left ?? defaults.left, minLeft, maxLeft),
        right: clamp(parsed.right ?? defaults.right, minRight, maxRight),
      });
    } catch {
      setSizes(defaults);
    }
  }, [defaults, maxLeft, maxRight, minLeft, minRight, storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify(sizes));
  }, [sizes, storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    function onResize() {
      const width = window.innerWidth;
      setNarrow(width < 1024);
      setSizes((prev) => ({
        left: clamp(prev.left, minLeft, Math.min(maxLeft, Math.floor(width * 0.36))),
        right: clamp(prev.right, minRight, Math.min(maxRight, Math.floor(width * 0.36))),
      }));
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [maxLeft, maxRight, minLeft, minRight]);

  useEffect(() => {
    function onMove(e) {
      const drag = dragRef.current;
      if (!drag.side) return;
      const dx = e.clientX - drag.startX;

      if (drag.side === "left") {
        setSizes((prev) => ({ ...prev, left: clamp(drag.startLeft + dx, minLeft, maxLeft) }));
      }

      if (drag.side === "right") {
        setSizes((prev) => ({ ...prev, right: clamp(drag.startRight - dx, minRight, maxRight) }));
      }
    }

    function onUp() {
      dragRef.current.side = null;
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [maxLeft, maxRight, minLeft, minRight]);

  function startDrag(side, e) {
    e.preventDefault();
    dragRef.current = { side, startX: e.clientX, startLeft: sizes.left, startRight: sizes.right };
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  }

  const effectiveShowLeft = showLeft && !narrow;
  const effectiveShowRight = showRight && !narrow;

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden">
      {effectiveShowLeft ? <div style={{ width: sizes.left }} className="h-full min-h-0 overflow-hidden">{left}</div> : null}

      {effectiveShowLeft ? (
        <button
          className="w-2 cursor-col-resize bg-[rgba(var(--glm-border),0.55)] hover:bg-[rgba(var(--glm-purple),0.4)]"
          onMouseDown={(e) => startDrag("left", e)}
          type="button"
          aria-label="Resize left panel"
        />
      ) : null}

      <div className="h-full min-h-0 min-w-0 flex-1 overflow-hidden">{center}</div>

      {effectiveShowRight ? (
        <button
          className="w-2 cursor-col-resize bg-[rgba(var(--glm-border),0.55)] hover:bg-[rgba(var(--glm-purple),0.4)]"
          onMouseDown={(e) => startDrag("right", e)}
          type="button"
          aria-label="Resize right panel"
        />
      ) : null}

      {effectiveShowRight ? <div style={{ width: sizes.right }} className="h-full min-h-0 overflow-hidden">{right}</div> : null}
    </div>
  );
}
