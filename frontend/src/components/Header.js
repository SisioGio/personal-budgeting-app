import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaFileAlt } from 'react-icons/fa';

const particleVariants = {
  float: {
    y: [0, -15, 0],
    x: [0, 8, 0],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const colors = ['text-blue-400', 'text-pink-400', 'text-purple-400', 'text-fuchsia-400'];

const Header = () => {
  return (
    <header className="relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-950 flex items-center justify-center text-white px-4 py-16 overflow-hidden">

      {/* --- Neon Glow Floating Icons --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute opacity-30 ${colors[i % colors.length]}`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              fontSize: `${18 + Math.random(1,100) * 18}px`,
              filter: 'drop-shadow(0 0 12px currentColor)',
            }}
            variants={particleVariants}
            animate="float"
          >
            <FaFileAlt />
          </motion.div>
        ))}
      </div>

      {/* --- Central Content --- */}
      <div className="relative z-10 text-center max-w-2xl">
        <motion.h1
          className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-400 to-purple-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.25)]"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Revolutionize Your Document Data Extraction
        </motion.h1>

        <motion.p
          className="mt-6 text-gray-300 text-lg sm:text-xl leading-relaxed drop-shadow-[0_0_6px_rgba(255,255,255,0.08)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          Intelligent Document extraction at $ 0.01 per page.<br/>
          No training, no labeling, only high accuracy.
        </motion.p>

        <motion.div
          className="mt-10 d-flex flex-column"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <Link
            to="/extract"
            className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold text-lg shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:brightness-125 hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] transition-all duration-300"
          >
            Try It For Free
          </Link>

          
        </motion.div>

        <motion.div
          className="mt-10 d-flex flex-column"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
             <a
            href="/#video-intro"
            className="px-8 py-2 rounded-full bg-indigo-600 bg-opacity-40 text-white font-light text-lg  hover:brightness-125 hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] transition-all duration-300"
          >
            Watch the Video
          </a>

          
        </motion.div>

     
      </div>

     {/* --- Bottom Fade Out Effect --- */}
<div className="absolute bottom-0 left-0 right-0 h-32 z-10 pointer-events-none bg-gradient-to-b from-transparent to-[#0f172a]" />

    </header>
  );
};

export default Header;
