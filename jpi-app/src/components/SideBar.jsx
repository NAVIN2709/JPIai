import React, { useEffect, useState, useRef } from "react";
import { Clock } from "lucide-react";
import { getGenerations, getUser } from "../../firebase/functions/UserFunctions";
import { auth } from "../../firebase/config";

export const SideBar = () => {
  const user = auth.currentUser;
  const [generations, setGenerations] = useState([]);
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null); // Reference to the fullscreen video

  useEffect(() => {
    const fetchGenerations = async () => {
      if (!user?.uid) return;
      setLoading(true);
      const data = await getGenerations(user.uid);
      setGenerations(data);
      setLoading(false);
    };
    fetchGenerations();
  }, [user?.uid]);

  useEffect(() => {
    const getUserData = async () => {
      if (!user?.uid) return;
      setLoading(true);
      const data = await getUser(user.uid);
      setUserData(data);
      setLoading(false);
    };
    getUserData();
  }, [user?.uid]);

  // Open video in fullscreen
  const openFullscreen = (videoUrl) => {
    const video = document.createElement("video");
    video.src = videoUrl;
    video.controls = true;
    video.autoplay = true;
    video.style.width = "100%";
    video.style.height = "100%";
    video.style.objectFit = "contain";
    videoRef.current = video;

    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "100vw";
    container.style.height = "100vh";
    container.style.backgroundColor = "black";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.appendChild(video);

    container.onclick = () => {
      // Exit fullscreen on click outside video
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      document.body.removeChild(container);
    };

    document.body.appendChild(container);

    // Request fullscreen
    container.requestFullscreen().catch((err) => {
      console.error("Fullscreen request failed:", err);
    });
  };

  return (
    <div className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col flex-1">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800">
        <h1 className="text-xl font-semibold text-white">Generations</h1>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading && <p className="text-neutral-500 text-sm">Loading...</p>}

        {!loading && generations.length === 0 && (
          <p className="text-neutral-500 text-sm">No generations yet</p>
        )}

        {generations.map((gen) => (
          <div
            key={gen.id}
            className="p-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 cursor-pointer transition flex items-center gap-3"
            onClick={() => openFullscreen(gen.video)} // Open fullscreen
          >
            <video
              src={gen.video}
              className="w-14 h-14 rounded-lg object-cover bg-black"
              muted
              preload="metadata"
              playsInline
            />

            <div className="flex flex-col">
              <p className="text-sm text-white font-medium">
                Generation #{gen.id.slice(0, 6)}
              </p>

              <div className="flex items-center gap-1 text-neutral-500 text-xs mt-1">
                <Clock size={12} />
                <span>
                  {new Date(gen.createdAt?.seconds * 1000).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-800 bg-neutral-900">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={user?.photoURL || "https://placehold.co/40x40"}
              alt="user"
              className="w-9 h-9 rounded-full object-cover border border-neutral-700"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-medium text-white">
                {userData?.name || "User"}
              </span>
              <span className="text-xs text-neutral-500 truncate max-w-[140px]">
                {user?.email}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
