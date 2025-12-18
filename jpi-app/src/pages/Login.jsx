import React, { useState } from "react";
import { FaGoogle } from "react-icons/fa";
import logo from "../assets/logo.jpg";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useNavigate } from "react-router-dom";
import { createUser } from "../../firebase/functions/UserFunctions";

export default function Login() {
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
    
      await signInWithPopup(auth, provider);
      await createUser(auth.currentUser);

      navigate("/think");
      setIsLoading(false);
    } catch (error) {
      console.log("Google login error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-950 px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-10">
        {/* LOGO */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-full overflow-hidden border border-white/20 bg-black">
            <img src={logo} className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-semibold text-white tracking-tight">
            Welcome Back !
          </h1>
          <p className="text-neutral-400 mt-2 text-sm">Sign in to continue</p>
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 
                               rounded-xl bg-white text-black font-medium 
                               hover:bg-neutral-200 transition-colors 
                               disabled:opacity-40 disabled:cursor-not-allowed shadow-lg cursor-pointer"
        >
          <FaGoogle className="w-5 h-5" />
          {isLoading ? "Signing in..." : "Continue with Google"}
        </button>

        {/* Footer */}
        <p className="text-center text-xs text-neutral-500 mt-10">
          By signing in, you agree to our{" "}
          <a href="#" className="text-white hover:underline">
            Terms of Service
          </a>
        </p>
      </div>
    </div>
  );
}
