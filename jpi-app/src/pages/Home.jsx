import { useState, useRef } from "react";
import { Loader2, Menu, Send, Upload, X, Camera } from "lucide-react";
import Logo from "../assets/logo.jpg";
import SkeletonVideo from "../components/SkeletonVideo.jsx";
import {
  updateGeneration,
  getUser,
  createGeneration,
} from "../../firebase/functions/UserFunctions.js";
import { auth } from "../../firebase/config.js";
import { requestPermissionAndSaveToken } from "../utils/notification.js";
import SidebarModal from "../components/SideBarModal.jsx";
import useTypewriter from "../components/useTypeWriter.js";

export default function Home() {
  const PLACEHOLDERS = [
    "Drop in your image to generate a video…",
    "Upload a diagram → get an explainer video",
    "Turn images into animations in minutes",
    "Snap a question. Get a visual answer.",
    "From image to explainer video ✨",
  ];

  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [canGenerate, setCanGenerate] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);

  // FCM Modal
  const [showFCMModal, setShowFCMModal] = useState(false);
  const [fcmDone, setFcmDone] = useState(false);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const placeholder = useTypewriter(PLACEHOLDERS);

  const addResponsePlaceholder = () => {
    const id = Date.now() + Math.random();
    setMessages((prev) => [
      ...prev,
      { id, type: "response", status: "loading", file: null, error: null },
    ]);
    return id;
  };

  const handleSend = async () => {
    if (!file || loading) return;

    try {
      const userData = await getUser(auth.currentUser.uid);

      if (!fcmDone) {
        if (!userData?.fcmToken) {
          setShowFCMModal(true);
          return;
        }
        setFcmDone(true);
      }

      if (userData.Timesleft <= 0) {
        setCanGenerate(false);
        alert("You have no generations left. Please upgrade your plan.");
        return;
      }
    } catch {
      alert("Error fetching user data.");
      return;
    }

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: "user", file: URL.createObjectURL(file) },
    ]);

    const placeholderId = addResponsePlaceholder();
    setLoading(true);
    setFile(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/generate`,
        { method: "POST", body: formData }
      );
      const { job_id } = await res.json();
      if (!job_id) throw new Error("No job ID");

      const poll = async () => {
        const statusRes = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/status/${job_id}`
        );
        const data = await statusRes.json();

        if (data.status === "done") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === placeholderId
                ? { ...m, status: "done", file: data.url }
                : m
            )
          );
          await updateGeneration(auth.currentUser.uid);
          await createGeneration(auth.currentUser.uid, data.url);
          setLoading(false);
        } else if (data.status === "failed") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === placeholderId
                ? { ...m, status: "failed", error: data.error }
                : m
            )
          );
          setLoading(false);
        } else {
          setTimeout(poll, 10000);
        }
      };

      poll();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col p-4 md:p-8">
      {/* FCM MODAL */}
      {showFCMModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-6">
          <div className="bg-white text-black p-6 rounded-lg max-w-sm w-full">
            <h2 className="text-xl font-bold mb-3">
              Generation takes a little while ⚡
            </h2>
            <p className="mb-4">
              Enable notifications to get notified when your video is ready.
            </p>
            <button
              className="w-full bg-black text-white py-2 rounded-lg mb-2"
              onClick={async () => {
                await requestPermissionAndSaveToken(auth.currentUser.uid);
                setFcmDone(true);
                setShowFCMModal(false);
                handleSend();
              }}
            >
              Enable Notifications
            </button>
            <button
              className="w-full bg-gray-300 py-2 rounded-lg"
              onClick={() => {
                setFcmDone(true);
                setShowFCMModal(false);
                handleSend();
              }}
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-center mb-6">
        <img src={Logo} className="h-16 md:h-20" />
      </div>

      <button
        onClick={() => setShowSidebar(true)}
        className="absolute top-4 left-4 bg-white text-black p-2 rounded-lg"
      >
        <Menu />
      </button>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div className="max-w-xs md:max-w-md">
              {msg.type === "user" && (
                <img src={msg.file} className="rounded-lg" />
              )}
              {msg.status === "loading" && <SkeletonVideo />}
              {msg.status === "done" && (
                <video src={msg.file} controls className="rounded-lg" />
              )}
              {msg.status === "failed" && (
                <div className="bg-red-600 p-4 rounded-lg">
                  {msg.error}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* IMAGE INPUT BAR */}
      <div className="w-full max-w-3xl mx-auto px-2">
        {file && (
          <div className="relative mb-2 inline-block">
            <img
              src={URL.createObjectURL(file)}
              className="h-28 rounded-xl"
            />
            <button
              onClick={() => setFile(null)}
              className="absolute -top-2 -right-2 bg-black/70 text-white rounded-full p-1"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 rounded-2xl border border-white bg-neutral-900 px-4 py-3 shadow-lg">
          {/* Gallery */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
          />

          {/* Camera */}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={cameraInputRef}
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
          />

          <button onClick={() => fileInputRef.current.click()}>
            <Upload size={18} className="text-neutral-400" />
          </button>

          <button onClick={() => cameraInputRef.current.click()}>
            <Camera size={18} className="text-neutral-400" />
          </button>

          <div className="flex-1 text-sm text-neutral-400 select-none">
            {placeholder}
            <span className="animate-pulse ml-0.5">|</span>
          </div>

          <button
            onClick={handleSend}
            disabled={!file || loading || !canGenerate}
            className="p-2 rounded-xl bg-white text-black disabled:opacity-40"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </div>

      <SidebarModal open={showSidebar} onClose={() => setShowSidebar(false)} />
    </div>
  );
}
