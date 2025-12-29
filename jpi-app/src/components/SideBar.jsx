import React, { useEffect, useState, useRef } from "react";
import { Clock, Play, Pause, Maximize } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getGenerations,
  getUser,
} from "../../firebase/functions/UserFunctions";
import { auth } from "../../firebase/config";

export const SideBar = () => {
  const user = auth.currentUser;
  const navigate = useNavigate();

  const [generations, setGenerations] = useState([]);
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState(null);

  const videoRefs = useRef({});
  const lastTapRef = useRef(0);

  // ---------------- FETCH DATA ----------------
  useEffect(() => {
    if (!user?.uid) return;

    const fetchData = async () => {
      setLoading(true);
      const [gens, userInfo] = await Promise.all([
        getGenerations(user.uid),
        getUser(user.uid),
      ]);
      setGenerations(gens);
      setUserData(userInfo);
      setLoading(false);
    };

    fetchData();
  }, [user?.uid]);

  // ---------------- VIDEO CONTROLS ----------------
  const togglePlay = (id) => {
    const video = videoRefs.current[id];
    if (!video) return;

    if (video.paused) {
      video.play();
      setPlayingId(id);
    } else {
      video.pause();
      setPlayingId(null);
    }
  };

  const handleTap = (id) => {
    const video = videoRefs.current[id];
    if (!video) return;

    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      video.currentTime = Math.min(video.currentTime + 2, video.duration);
    }
    lastTapRef.current = now;
  };

  const openFullscreen = (id) => {
    const video = videoRefs.current[id];
    if (!video) return;

    if (video.requestFullscreen) video.requestFullscreen();
    else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
  };

  const handleLogout = () => navigate("/login");
  if (!generations)
    return (
      <div className="nogens w-full h-screen bg-neutral-900 border-r border-neutral-800 flex flex-col">
        <div className="flex-shrink-0 p-4 border-b border-neutral-800 bg-neutral-900">
          <h1 className="text-xl font-semibold text-white">Generations</h1>
        </div>
        <div className="nogenstext text-center text-gray-400 mt-2">
          No Generations
        </div>
      </div>
    );

  // ---------------- UI ----------------
  return (
    <div className="w-full h-screen bg-neutral-900 border-r border-neutral-800 flex flex-col">
      {/* Header (fixed height, no shrink) */}
      <div className="flex-shrink-0 p-4 border-b border-neutral-800 bg-neutral-900">
        <h1 className="text-xl font-semibold text-white">Generations</h1>
      </div>

      {/* Scrollable Video List (ONLY this scrolls) */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
        {loading && <p className="text-neutral-500 text-sm">Loading...</p>}
        {!loading && generations.length === 0 && (
          <p className="text-neutral-500 text-sm">No generations yet</p>
        )}

        {generations.map((gen) => (
          <div key={gen.id} className="p-3 rounded-xl flex flex-col gap-3">
            {/* VIDEO */}
            <div
              className="relative w-full group"
              onClick={() => handleTap(gen.id)}
            >
              <video
                ref={(el) => (videoRefs.current[gen.id] = el)}
                src={gen.video}
                className="w-full rounded-lg bg-black object-cover"
                muted
                playsInline
                preload="metadata"
                controls={false}
                disablePictureInPicture
                controlsList="nodownload noplaybackrate nofullscreen"
              />

              {/* Play / Pause */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay(gen.id);
                }}
                className="absolute inset-0 flex items-center justify-center
                           bg-black/30 opacity-0 group-hover:opacity-100 transition"
              >
                {playingId === gen.id ? (
                  <Pause className="w-10 h-10 text-white" />
                ) : (
                  <Play className="w-10 h-10 text-white" />
                )}
              </button>

              {/* Fullscreen */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openFullscreen(gen.id);
                }}
                className="absolute bottom-3 right-3 p-2 rounded-full
                           bg-black/60 opacity-0 group-hover:opacity-100 transition"
              >
                <Maximize className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* META */}
            <div>
              <p className="text-sm text-white font-medium">
                Generation #{gen.id.slice(0, 6)}
              </p>
              <div className="flex items-center gap-1 text-neutral-500 text-xs mt-1">
                <Clock size={12} />
                {new Date(gen.createdAt?.seconds * 1000).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer (fixed height, no shrink) */}
      <div className="flex-shrink-0 h-25 p-4 border-t border-neutral-800 bg-neutral-900">
        <div className="flex  items-center gap-3">
          <div className="details flex">
            <img
              src={user?.photoURL || "https://placehold.co/40x40"}
              className="w-9 h-9 rounded-full border border-neutral-700"
            />
            <div className="flex flex-col ml-2">
              <span className="text-sm text-white">
                {userData?.name || "User"}
              </span>
              <span className="text-xs text-neutral-500">{user?.email}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-white mt-1 bg-red-600 p-2 rounded-2xl"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
