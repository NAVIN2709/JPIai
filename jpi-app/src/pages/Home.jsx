import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import Logo from "../assets/logo.jpg";

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
  setMessages([...messages, userMessage]);
  setLoading(true);
  setFile(null);

  try {
    // Upload image
    const formData = new FormData();
    formData.append("image", file);

    const generateRes = await fetch("http://localhost:8000/generate", {
      method: "POST",
      body: formData,
    });
    const genData = await generateRes.json();

    if (!genData.job_id) throw new Error(genData.error || "No job_id returned");
    const jobId = genData.job_id;

    // Polling function
    const pollStatus = async () => {
      try {
        const statusRes = await fetch(`http://localhost:8000/status/${jobId}`);
        const statusData = await statusRes.json();

        if (statusData.status === "done" && statusData.url) {
          // Job finished successfully
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              type: "response",
              file: statusData.url,
            },
          ]);
          setLoading(false);
        } else if (statusData.status === "failed") {
          // Job failed
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              type: "response",
              file: null,
              error: statusData.error || "Processing failed",
            },
          ]);
          setLoading(false);
        } else if (statusData.status === "queued" || statusData.status === "processing" || statusData.status === "rendering") {
          // Job not finished yet → poll again after 10 sec
          setTimeout(pollStatus, 10000);
        } else {
          // Unknown status → stop polling
          console.warn("Unknown job status:", statusData.status);
          setLoading(false);
        }
      } catch (err) {
        console.error("Polling error:", err);
        // Retry after 10 sec
        setTimeout(pollStatus, 10000);
      }
    };

    pollStatus();
  } catch (err) {
    console.error("Upload error:", err);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + 1,
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

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className="max-w-xs md:max-w-md relative">
              {msg.type === "user" && msg.file && (
                <img src={msg.file} alt="user-upload" className="rounded-lg shadow-md" />
              )}
              {msg.type === "response" && msg.file && (
                <video
                  src={msg.file}
                  controls
                  className="rounded-lg bg-black border border-white shadow-md"
                />
              )}
              {msg.type === "response" && !msg.file && msg.error && (
                <div className="p-4 rounded-lg bg-red-600 text-white shadow-md">
                  {msg.error}
                </div>
              )}
              {msg.type === "response" && !msg.file && !msg.error && loading && (
                <div className="p-4 rounded-lg bg-gray-800 text-white shadow-md">
                  Processing...
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* File input & send */}
      <div className="flex flex-col gap-3 md:gap-4">
        {file && (
          <div className="relative flex justify-center">
            <img
              src={URL.createObjectURL(file)}
              alt="preview"
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
          <div
            onClick={() => fileInputRef.current.click()}
            className={`p-2 md:p-3 rounded-lg bg-white text-black cursor-pointer hover:bg-gray-300 transition flex items-center justify-center shadow-md ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Upload className="h-6 w-6 md:h-7 md:w-7" />
          </div>
          <button
            onClick={handleSend}
            className="bg-white text-black px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50 shadow-md"
            disabled={!file || loading}
          >
            {loading ? "Processing..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
