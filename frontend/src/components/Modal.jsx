import { FiX } from "react-icons/fi";

export default function Modal({ isOpen, onClose, title, children, size = "md" }) {
  if (!isOpen) return null;

  const sizeClass = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }[size];

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md">
      <div className="fixed inset-0" onClick={onClose} />
      <div className={`relative w-full ${sizeClass} max-h-[90vh] overflow-hidden rounded-[2rem] bg-white shadow-2xl flex flex-col`}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-slate-50 px-10 py-6">
          <h2 className="text-sm font-black text-[#1b3a8b] uppercase tracking-[0.2em]">{title}</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-all">
            <FiX size={20} />
          </button>
        </div>
        <div className="p-10 overflow-y-auto no-scrollbar">{children}</div>
      </div>
    </div>
  );
}
