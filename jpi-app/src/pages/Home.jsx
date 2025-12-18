import { useState, useRef } from "react";
import { Menu, Upload, X } from "lucide-react";
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

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [canGenerate, setCanGenerate] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);

  // FCM Modal
  const [showFCMModal, setShowFCMModal] = useState(false);
  const [fcmDone, setFcmDone] = useState(false);

  const fileInputRef = useRef(null);

  const addResponsePlaceholder = () => {
    const id = Date.now() + Math.random();
    setMessages((prev) => [
      ...prev,
      {
        id,
        type: "response",
        status: "loading",
        file: null,
        error: null,
      },
    ]);
    return id;
  };

  const handleSend = async () => {
    if (!file || loading) return;

    try {
      const userData = await getUser(auth.currentUser.uid);

      // ---------- FCM CHECK ----------
      if (!fcmDone) {
        if (!userData?.fcmToken) {
          // User has NOT allowed notifications → show modal
          setShowFCMModal(true);
          return;
        } else {
          // User ALREADY has token → don't ask again
          setFcmDone(true);
        }
      }

      // ---------- GENERATIONS LEFT CHECK ----------
      if (userData.Timesleft <= 0) {
        setCanGenerate(false);
        alert("You have no generations left. Please upgrade your plan.");
        return;
      }
    } catch (err) {
      console.error("User fetch error:", err);
      alert("Error fetching user data. Please try again.");
      return;
    }

    // ---------- START GENERATION ----------
    const userMessage = {
      id: Date.now(),
      type: "user",
      file: URL.createObjectURL(file),
    };
    setMessages((prev) => [...prev, userMessage]);

    const placeholderId = addResponsePlaceholder();
    setFile(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const generateRes = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/generate`,
        { method: "POST", body: formData }
      );

      const genData = await generateRes.json();
      if (!genData.job_id)
        throw new Error(genData.error || "No job_id returned");

      const jobId = genData.job_id;

      const pollStatus = async () => {
        try {
          const statusRes = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/status/${jobId}`
          );
          const statusData = await statusRes.json();

          if (statusData.status === "done" && statusData.url) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === placeholderId
                  ? { ...m, status: "done", file: statusData.url }
                  : m
              )
            );
            await updateGeneration(auth.currentUser.uid);
            await createGeneration(auth.currentUser.uid, statusData.url);
            setLoading(false);
          } else if (statusData.status === "failed") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === placeholderId
                  ? {
                      ...m,
                      status: "failed",
                      error: statusData.error || "Processing failed",
                    }
                  : m
              )
            );
            setLoading(false);
          } else if (
            ["queued", "processing", "rendering"].includes(statusData.status)
          ) {
            setTimeout(pollStatus, 10000);
          } else {
            console.warn("Unknown job status:", statusData.status);
            setLoading(false);
          }
        } catch (err) {
          console.error("Polling error:", err);
          setTimeout(pollStatus, 10000);
        }
      };

      pollStatus();
    } catch (err) {
      console.error("Upload error:", err);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId
            ? { ...m, status: "failed", error: err.message }
            : m
        )
      );

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col p-4 md:p-8">
      {/* ---------- FCM PERMISSION MODAL ---------- */}
      {showFCMModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-6">
          <div className="bg-white text-black p-6 rounded-lg max-w-sm w-full shadow-lg">
            <h2 className="text-xl font-bold mb-3">
              Generation takes a little while ⚡
            </h2>

            <p className="mb-4">
              Meanwhile, try solving the question yourself — but stay updated
              while your result processes!
            </p>

            <button
              className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition"
              onClick={async () => {
                await requestPermissionAndSaveToken(auth.currentUser.uid);
                setFcmDone(true);
                setShowFCMModal(false);
                handleSend(); // resume generation
              }}
            >
              Enable Notifications
            </button>

            <button
              className="w-full mt-2 bg-gray-300 text-black py-2 rounded-lg hover:bg-gray-400 transition"
              onClick={() => {
                setFcmDone(true);
                setShowFCMModal(false);
                handleSend(); // continue without permission
              }}
            >
              Skip for Now
            </button>
          </div>
        </div>
      )}

      {/* Logo */}
      <div className="flex justify-center mb-6">
        <img src={Logo} alt="Logo" className="h-16 w-auto md:h-20" />
      </div>
      <div className="absolute top-4 left-4">
        <button
          onClick={() => setShowSidebar(true)}
          className="bg-white text-black px-3 py-2 rounded-lg shadow-md hover:bg-gray-300 transition"
        >
          <Menu/>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div className="max-w-xs md:max-w-md relative">
              {/* User Image */}
              {msg.type === "user" && msg.file && (
                <img
                  src={msg.file}
                  alt="User"
                  className="rounded-lg shadow-md"
                />
              )}

              {/* Response Placeholder */}
              {msg.type === "response" && msg.status === "loading" && (
                <SkeletonVideo />
              )}

              {/* Final Video */}
              {msg.type === "response" && msg.status === "done" && msg.file && (
                <video
                  src={msg.file}
                  controls
                  className="rounded-lg bg-black border border-white shadow-md"
                />
              )}

              {/* Error */}
              {msg.type === "response" && msg.status === "failed" && (
                <div className="p-4 rounded-lg bg-red-600 text-white shadow-md">
                  {msg.error}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Upload + Send Buttons */}
      <div className="flex flex-col gap-3 md:gap-4">
        {file && (
          <div className="relative flex justify-center">
            <img
              src={URL.createObjectURL(file)}
              alt="Preview"
              className="h-32 w-auto md:h-40 rounded-lg border-2 border-white shadow-lg"
            />

            <button
              onClick={() => setFile(null)}
              className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 bg-red-600 text-white rounded-full p-1 md:p-2 hover:bg-red-700 shadow-md transition"
            >
              <X className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 md:gap-4">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
          />

          {!loading && (
            <div
              onClick={() => fileInputRef.current.click()}
              className={`p-2 md:p-3 rounded-lg bg-white text-black cursor-pointer hover:bg-gray-300 transition flex items-center justify-center shadow-md ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Upload className="h-6 w-6 md:h-7 md:w-7" />
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={!file || loading || !canGenerate}
            className="bg-white text-black px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50 shadow-md"
          >
            {loading ? "Processing..." : "Send"}
          </button>
        </div>
      </div>
      <SidebarModal open={showSidebar} onClose={() => setShowSidebar(false)} />
    </div>
  );
}
