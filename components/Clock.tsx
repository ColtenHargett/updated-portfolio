"use client";

import { useEffect, useState } from "react";

export default function Clock({ className = "" }: { className?: string }) {
  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "America/New_York",
      timeZoneName: "short",
    });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className={`tabular-nums ${className}`}>{now || " "}</span>;
}
