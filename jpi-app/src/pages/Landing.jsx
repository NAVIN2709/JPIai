import React, { useState, useEffect } from "react";
import { Upload, Zap, Video, ArrowRight, Sparkles } from "lucide-react";
import Image1 from "../assets/image1.png";
import Image2 from "../assets/image2.png";
import Image3 from "../assets/image3.png";

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const steps = [
    {
      icon: <Upload className="h-8 w-8" />,
      title: "Upload Your Image",
      description:
        "Take a photo or select an image of the question from your device",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "AI Processing",
      description: "Our advanced AI analyzes and processes your question",
    },
    {
      icon: <Video className="h-8 w-8" />,
      title: "Get Video Output",
      description: "Receive a detailed AI-generated explanation video",
    },
  ];

  return (
    <>
      <style jsx global>{`
        /* Custom Scrollbar Styles */
        ::-webkit-scrollbar {
          width: 12px;
        }

        ::-webkit-scrollbar-track {
          background: #000000;
          border-left: 1px solid #1a1a1a;
        }

        ::-webkit-scrollbar-thumb {
          background: #333333;
          border-radius: 6px;
          border: 2px solid #000000;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #ffffff;
        }

        /* Firefox Scrollbar */
        * {
          scrollbar-width: thin;
          scrollbar-color: #333333 #000000;
        }

        /* Hide video controls */
        video::-webkit-media-controls {
          display: none !important;
        }
        video::-webkit-media-controls-enclosure {
          display: none !important;
        }
        video::-webkit-media-controls-panel {
          display: none !important;
        }
        video::-moz-media-controls {
          display: none !important;
        }
      `}</style>

      <div className="min-h-screen bg-black text-white overflow-x-hidden">
        {/* Subtle Grid Background */}
        <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000,transparent)]"></div>

        {/* Hero Section */}
        <div className="relative min-h-screen flex flex-col items-center justify-center px-4 md:px-8">
          {/* Logo & Title */}
          <div
            className={`relative z-10 text-center mb-16 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="flex justify-center mb-8">
              <div className="relative group">
                <div className="absolute inset-0 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                <div className="relative p-6 rounded-full">
                  <img
                    src="/logo.jpg"
                    alt="JPI.ai Logo"
                    className="h-20 w-20 md:h-20 md:w-20"
                  />
                </div>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight">
              JPI.ai
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              Transform your questions into AI-powered video explanations in
              minutes
            </p>
          </div>

          {/* Examples: Image → Video (3 samples) */}
          <div
            className={`relative z-10 mb-20 transition-all duration-1000 delay-300 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="space-y-12 max-w-5xl mx-auto px-4">
              {/* Sample 1 */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
                {/* Input Image */}
                <div className="group relative overflow-hidden rounded-xl border border-gray-800 hover:border-white transition-all duration-500 bg-black w-full md:w-auto">
                  <div className="relative overflow-hidden">
                    <img
                      src={Image1}
                      alt="Math Question"
                      className="w-full md:w-80 h-64 object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500"></div>
                  </div>

                  <div className="p-4 border-t border-gray-800">
                    <p className="text-white font-medium">Math Problem</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Input Question
                    </p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="transform md:rotate-0 rotate-90">
                  <ArrowRight className="h-10 w-10 md:h-12 md:w-12 text-white animate-pulse" />
                </div>

                {/* Output Video */}
                <div className="group relative overflow-hidden rounded-xl border border-gray-800 hover:border-white transition-all duration-500 bg-black w-full md:w-auto">
                  <div className="relative overflow-hidden">
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      disablePictureInPicture
                      controlsList="nodownload nofullscreen noremoteplayback"
                      className="w-full md:w-80 h-64 object-cover pointer-events-none"
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      <source
                        src="https://res.cloudinary.com/dosaigy3m/video/upload/v1764184146/manim-renders/gvxewfa5gmj0n7b5s4ez.mp4"
                        type="video/mp4"
                      />
                    </video>
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500 pointer-events-none"></div>
                  </div>

                  <div className="p-4 border-t border-gray-800">
                    <p className="text-white font-medium">AI Explanation</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Step-by-step Video
                    </p>
                  </div>
                </div>
              </div>

              {/* Sample 2 */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
                {/* Input Image */}
                <div className="group relative overflow-hidden rounded-xl border border-gray-800 hover:border-white transition-all duration-500 bg-black w-full md:w-auto">
                  <div className="relative overflow-hidden">
                    <img
                      src={Image1}
                      alt="Science Question"
                      className="w-full md:w-80 h-64 object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500"></div>
                  </div>

                  <div className="p-4 border-t border-gray-800">
                    <p className="text-white font-medium">Physics Problem</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Input Question
                    </p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="transform md:rotate-0 rotate-90">
                  <ArrowRight className="h-10 w-10 md:h-12 md:w-12 text-white animate-pulse" />
                </div>

                {/* Output Video */}
                <div className="group relative overflow-hidden rounded-xl border border-gray-800 hover:border-white transition-all duration-500 bg-black w-full md:w-auto">
                  <div className="relative overflow-hidden">
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      disablePictureInPicture
                      controlsList="nodownload nofullscreen noremoteplayback"
                      className="w-full md:w-80 h-64 object-cover pointer-events-none"
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      <source
                        src="https://res.cloudinary.com/dosaigy3m/video/upload/v1764872225/manim-renders/ujthvb0xfqgud0visele.mp4"
                        type="video/mp4"
                      />
                    </video>
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500 pointer-events-none"></div>
                  </div>

                  <div className="p-4 border-t border-gray-800">
                    <p className="text-white font-medium">AI Explanation</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Detailed Breakdown
                    </p>
                  </div>
                </div>
              </div>

              {/* Sample 3 */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
                {/* Input Image */}
                <div className="group relative overflow-hidden rounded-xl border border-gray-800 hover:border-white transition-all duration-500 bg-black w-full md:w-auto">
                  <div className="relative overflow-hidden">
                    <img
                      src={Image3}
                      alt="Chemistry Question"
                      className="w-full md:w-80 h-64 object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500"></div>
                  </div>

                  <div className="p-4 border-t border-gray-800">
                    <p className="text-white font-medium">Chemistry Formula</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Input Question
                    </p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="transform md:rotate-0 rotate-90">
                  <ArrowRight className="h-10 w-10 md:h-12 md:w-12 text-white animate-pulse" />
                </div>

                {/* Output Video */}
                <div className="group relative overflow-hidden rounded-xl border border-gray-800 hover:border-white transition-all duration-500 bg-black w-full md:w-auto">
                  <div className="relative overflow-hidden">
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      disablePictureInPicture
                      controlsList="nodownload nofullscreen noremoteplayback"
                      className="w-full md:w-80 h-64 object-cover pointer-events-none"
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      <source
                        src="https://res.cloudinary.com/dosaigy3m/video/upload/v1764188547/manim-renders/oirn9injpyrfsr4tgvq0.mp4"
                        type="video/mp4"
                      />
                    </video>
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500 pointer-events-none"></div>
                  </div>

                  <div className="p-4 border-t border-gray-800">
                    <p className="text-white font-medium">AI Explanation</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Visual Tutorial
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="relative py-32 px-4 md:px-8 border-t border-gray-900">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                How It Works
              </h2>
              <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
                Three simple steps to transform your images into intelligent
                video explanations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
              {steps.map((step, idx) => (
                <div key={idx} className="relative group">
                  {/* Connection Line */}
                  {idx < steps.length - 1 && (
                    <div className="hidden md:block absolute top-20 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-white to-gray-800"></div>
                  )}

                  <div className="relative bg-black border border-gray-800 hover:border-white rounded-2xl p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-white/5">
                    {/* Step Number */}
                    <div className="absolute -top-4 -right-4 bg-white text-black rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl border-4 border-black">
                      {idx + 1}
                    </div>

                    {/* Icon */}
                    <div className="bg-white text-black rounded-xl p-4 inline-block mb-6">
                      {step.icon}
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold mb-3 text-white">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative py-32 px-4 md:px-8 border-t border-gray-900">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Ready to Experience
              <br />
              <span className="text-gray-400">AI Magic?</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Upload your image and watch as our AI transforms it into an
              engaging video explanation
            </p>

            <button
              onClick={() => (window.location.href = "/think")}
              className="group relative inline-flex items-center gap-3 bg-white text-black text-lg font-semibold px-10 py-5 rounded-full hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-2xl shadow-white/10"
            >
              <span>Try It Now</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
            </button>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-4 mt-16">
              <div className="bg-black border border-gray-800 rounded-full px-6 py-3 text-gray-400 hover:border-white hover:text-white transition-all duration-300">
                ⚡ Lightning Fast
              </div>
              <div className="bg-black border border-gray-800 rounded-full px-6 py-3 text-gray-400 hover:border-white hover:text-white transition-all duration-300">
                🎯 AI-Powered
              </div>
              <div className="bg-black border border-gray-800 rounded-full px-6 py-3 text-gray-400 hover:border-white hover:text-white transition-all duration-300">
                🎬 Video Output
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative py-8 px-4 border-t border-gray-900">
          <p className="text-center text-gray-600 text-sm">
            © 2025 JPIai. Powered by Advanced AI Technology.
          </p>
        </div>
      </div>
    </>
  );
}