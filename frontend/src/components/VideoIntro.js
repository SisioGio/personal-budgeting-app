import React, { useState, useRef } from 'react';
import { Play } from 'lucide-react'; // Import Play icon from lucide-react

const VideoIntro = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const handlePlay = () => {
    setIsPlaying(true);
    videoRef.current.play();
  };

  return (
    <div
      className="flex flex-col items-center justify-center text-center p-8 md:p-12 lg:p-16"
      id="video-intro"
      style={{
        background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.3))', // Subtle dark gradient for contrast
      }}
    >
      {/* Heading text */}
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-500">
        Unlock the Power of AI Document Extraction
      </h1>

      {/* Video Container */}
      <div className="w-full lg:w-2/3 mx-auto relative overflow-hidden rounded-2xl shadow-xl group">
        <video
          ref={videoRef}
          className="w-full h-full object-cover cursor-pointer"
          src="https://finbotix-public-files.s3.eu-central-1.amazonaws.com/AiDocExtractor.mp4"
          controls={isPlaying}
          playsInline
        />

   

        {/* Play button */}
        {!isPlaying && (
          <button
            onClick={handlePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-all duration-300 ease-in-out transform hover:scale-110"
          >
            <Play className="w-16 h-16 text-white" />
          </button>
        )}
      </div>

      {/* Subheading text */}
      <p className="mt-6 text-xl sm:text-2xl font-medium text-gray-200 opacity-90">
        Experience seamless document processing with cutting-edge AI technology.
      </p>
    </div>
  );
};

export default VideoIntro;
