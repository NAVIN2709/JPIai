import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { SideBar } from "./SideBar";

export default function SidebarModal({ open, onClose }) {
  const [visible, setVisible] = useState(open);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      setClosing(false);
    }
  }, [open]);

  const handleClose = () => {
    setClosing(true);

    setTimeout(() => {
      setVisible(false);
      setClosing(false);
      onClose();
    }, 250);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      
      {/* Sidebar */}
      <div
        className={`w-full h-full bg-neutral-900 border-r border-neutral-800
          ${closing ? "animate-slide-out-right" : "animate-slide-in-left"}
        `}
      >
        <div className="flex justify-end p-2">
          <button onClick={handleClose}>
            <X className="text-white" />
          </button>
        </div>
        <SideBar />
      </div>

      {/* Backdrop */}
      <div
        className={`flex-1 bg-black/60 transition-opacity duration-200
          ${closing ? "opacity-0" : "opacity-100"}
        `}
        onClick={handleClose}
      />
    </div>
  );
}
