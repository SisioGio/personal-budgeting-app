import React, { useState } from "react";

const MainNav = () => {

  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = () => {
    setIsOpen(false); // Close the mobile menu when a link is clicked
  };

  return (
    <nav className="custom-gradient-nav fixed top-0 left-0 w-full shadow-xl h-20 z-50 rounded-b-md bg-blue-600 bg-opacity-90 backdrop-blur-md transition-all duration-300 ease-in-out">
      <div className=" mx-auto flex justify-around items-center px-6 h-full">
        {/* Logo */}
        <a
          href="/"
          className="text-3xl font-extrabold text-white tracking-wide hover:text-yellow-400 transition duration-300 transform"
        >
          <span className="text-white neon-text text-shadow-xl">ArchIntel</span>
        </a>

        {/* Mobile Menu Button */}
        <button
          className="xl:hidden text-white text-3xl focus:outline-none hover:text-yellow-400 transition duration-300"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        {/* Nav Links */}
        <ul
  className={`z-30 absolute xl:static top-20 left-0 w-full xl:w-auto bg-black xl:bg-transparent xl:flex xl:items-center xl:space-x-6 px-6 py-4 xl:px-0 transition-all duration-300 ease-in-out transform ${
    isOpen ? "block " : "hidden xl:block "
  }`}
>
  <li className="py-3 px-2  text-center hover:text-gold transition duration-300 transform  relative hover:bg-indigo-700 rounded-lg hover:bg-opacity-30 ">
    <a href="/#home" onClick={handleLinkClick} className="text-white text-xl font-light hover:text-gray-100">
      Home
    </a>
   
  </li>
<li className="py-3 px-2  text-center hover:text-gold transition duration-300 transform  relative hover:bg-indigo-700 rounded-lg hover:bg-opacity-30 ">
    <a href="/modelli" onClick={handleLinkClick} className="text-white text-xl font-light hover:text-gray-100">
      Modelli
    </a>
   
  </li>
 
 
</ul>

      </div>

      
    </nav>
  );
};

export default MainNav;
