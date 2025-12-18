import React from "react";
import { Clock } from "lucide-react";

// ---- MOCK DATA (matches your schema) ----
const mockGenerations = [
  {
    id: "1",
    video: "https://example.com/video1.mp4",
    generatedBy: "user_123",
    createdAt: "2025-01-03 10:45 AM",
    image: "https://placehold.co/80x80.png",
  },
  {
    id: "2",
    video: "https://example.com/video2.mp4",
    generatedBy: "user_123",
    createdAt: "2025-01-02 08:10 PM",
    image: "https://placehold.co/80x80.png",
  },
  {
    id: "3",
    video: "https://example.com/video3.mp4",
    generatedBy: "user_123",
    createdAt: "2025-01-01 04:30 PM",
    image: "https://placehold.co/80x80.png",
  },
];

export const SideBar = () => {
  return (
    <div className="w-64 h-screen bg-neutral-900 border-r border-neutral-800 flex flex-col">

      {/* Header */}
      <div className="p-4 border-b border-neutral-800">
        <h1 className="text-xl font-semibold text-white">Generations</h1>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">

        {mockGenerations.map((gen) => (
          <div
            key={gen.id}
            className="p-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 cursor-pointer transition flex items-center gap-3"
          >
            {/* Thumbnail */}
            <img
              src={gen.image}
              alt="generation"
              className="w-14 h-14 rounded-lg object-cover"
            />

            <div className="flex flex-col">
              <p className="text-sm text-white font-medium">Generation #{gen.id}</p>

              <div className="flex items-center gap-1 text-neutral-500 text-xs mt-1">
                <Clock size={12} />
                <span>{gen.createdAt}</span>
              </div>
            </div>
          </div>
        ))}

      </div>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-800 text-neutral-600 text-xs">
        © 2025 JPI
      </div>
    </div>
  );
};
