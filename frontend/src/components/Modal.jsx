import { FiX } from "react-icons/fi";
import { createPortal } from "react-dom";

export default function Modal({ isOpen, onClose, title, children, size = "md" }) {
  if (!isOpen) return null;

  const sizeClass = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }[size];

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-2.5 sm:p-6 md:p-10 bg-slate-900/60 backdrop-blur-sm shadow-inner">
      <div className="fixed inset-0" onClick={onClose} />
      <div className={`relative w-full ${sizeClass} max-h-[96vh] sm:max-h-[92vh] overflow-hidden rounded-2xl sm:rounded-[2rem] bg-white shadow-2xl flex flex-col transition-all duration-300 transform scale-100`}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-slate-50 px-4 sm:px-8 py-3.5 sm:py-5">
          <h2 className="text-xs sm:text-sm font-black text-[#1b3a8b] uppercase tracking-[0.15em] sm:tracking-[0.2em] truncate mr-2">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-all flex-shrink-0"
            title="Close"
          >
            <FiX size={18} />
          </button>
        </div>
        <div className="p-4 sm:p-7 md:p-10 overflow-y-auto custom-scrollbar">{children}</div>
      </div>
    </div>,
    document.body
  );
}
