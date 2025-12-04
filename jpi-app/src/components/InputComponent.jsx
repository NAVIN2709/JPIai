import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

export default function InputComponent({ onSend, loading }) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);

  return (
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
          onClick={() => onSend(file)}
          className="bg-white text-black px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50 shadow-md"
          disabled={!file || loading}
        >
          {loading ? "Processing..." : "Send"}
        </button>
      </div>
    </div>
  );
}
