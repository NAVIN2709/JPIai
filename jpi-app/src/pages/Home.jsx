import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import Logo from "../assets/logo.jpg";
import SkeletonVideo from "../components/SkeletonVideo.jsx";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  const handleSend = async () => {
    if (!file || loading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      file: URL.createObjectURL(file),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setFile(null);

    try {
      // Upload image
      const formData = new FormData();
      formData.append("image", file);

      const generateRes = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/generate`,
        {
          method: "POST",
          body: formData,
        }
      );

      const genData = await generateRes.json();

      if (!genData.job_id)
        throw new Error(genData.error || "No job_id returned");

      const jobId = genData.job_id;

      // Polling function
      const pollStatus = async () => {
        try {
          const statusRes = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/status/${jobId}`
          );
          const statusData = await statusRes.json();

          if (statusData.status === "done" && statusData.url) {
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now(),
                type: "response",
                file: statusData.url,
              },
            ]);
            setLoading(false);
          } else if (statusData.status === "failed") {
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now(),
                type: "response",
                file: null,
                error: statusData.error || "Processing failed",
              },
            ]);
            setLoading(false);
          } else if (
            ["queued", "processing", "rendering"].includes(statusData.status)
          ) {
            setTimeout(pollStatus, 5000);
          } else {
            console.warn("Unknown job status:", statusData.status);
            setLoading(false);
          }
        } catch (err) {
          console.error("Polling error:", err);
          setTimeout(pollStatus, 5000);
        }
      };

      pollStatus();
    } catch (err) {
      console.error("Upload error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "response",
          file: null,
          error: err.message,
        },
      ]);
      setLoading(false);
    }

    setFile(null);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col p-4 md:p-8">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <img src={Logo} alt="Logo" className="h-16 w-auto md:h-20" />
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
              {msg.type === "user" && msg.file && (
                <img
                  src={msg.file}
                  alt="User"
                  className="rounded-lg shadow-md"
                />
              )}

              {msg.type === "response" && msg.file && (
                <video
                  src={msg.file}
                  controls
                  className="rounded-lg bg-black border border-white shadow-md"
                />
              )}

              {msg.type === "response" && msg.error && (
                <div className="p-4 rounded-lg bg-red-600 text-white shadow-md">
                  {msg.error}
                </div>
              )}

              {msg.type === "response" &&
                !msg.file &&
                !msg.error &&
                loading && <SkeletonVideo />}
            </div>
          </div>
        ))}
      </div>

      {/* File upload + Send button */}
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

          {/* Upload button */}
          {!loading && (<div
            onClick={() => fileInputRef.current.click()}
            className={`p-2 md:p-3 rounded-lg bg-white text-black cursor-pointer hover:bg-gray-300 transition flex items-center justify-center shadow-md ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Upload className="h-6 w-6 md:h-7 md:w-7" />
          </div>)}

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!file || loading}
            className="bg-white text-black px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50 shadow-md"
          >
            {loading ? "Processing..." : "Send"}
          </button>
        </div>
      </div>
      {/* Test Button - Remove in production */}
      {/* <button
        onClick={() => {
          setMessages([
            ...messages,
            {
              id: Date.now(),
              type: "response",
              file: null,
              error: null,
            },
          ]);
          setLoading(true);
        }}
        className="mt-4 bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 hover:bg-gray-700 transition"
      >
        🧪 Test Skeleton Loader
      </button> */}
    </div>
  );
}
