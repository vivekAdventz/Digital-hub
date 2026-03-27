import { useEffect, useRef, useState } from "react";

const logs = [
  "Establishing Secure Corporate Link...",
  "Authenticating Identity...",
  "Synchronizing Departmental Nodes...",
  "Aggregating Dashboards...",
  "Optimizing Synergy Matrix...",
  "Finalizing Digital Handshake...",
];

export default function LoadingOverlay({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [logText, setLogText] = useState(logs[0]);
  const ringRef = useRef(null);
  const totalLength = 502.65;

  useEffect(() => {
    let p = 0;
    const interval = setInterval(() => {
      p += 1;
      setProgress(p);
      if (ringRef.current) {
        ringRef.current.style.strokeDashoffset = totalLength - (p / 100) * totalLength;
      }
      if (p % 17 === 0) {
        setLogText(logs[Math.min(Math.floor(p / 17), logs.length - 1)]);
      }
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => onComplete?.(), 600);
      }
    }, 35);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9500] flex flex-col items-center justify-center overflow-hidden"
         style={{ background: "#0a192f", transition: "opacity 0.8s ease" }}>
      <div className="scan-line" />
      <div className="relative flex flex-col items-center">
        <svg width="200" height="200">
          <circle cx="100" cy="100" r="80" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
          <circle ref={ringRef} className="progress-ring-circle" cx="100" cy="100" r="80"
                  stroke="#ff7d20" strokeWidth="8" fill="none"
                  strokeDasharray={totalLength} strokeDashoffset={totalLength} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-black tracking-tighter text-white">{progress}</span>
          <span className="text-xl font-bold ml-1 text-white">%</span>
        </div>
      </div>
      <p className="mt-5 font-mono text-[10px] text-[#64ffda] opacity-70 uppercase tracking-[2px] h-5">
        {logText}
      </p>
      <p className="text-[10px] text-slate-500 uppercase tracking-[0.5em] mt-12">
        Digital Synergy Matrix
      </p>
    </div>
  );
}
