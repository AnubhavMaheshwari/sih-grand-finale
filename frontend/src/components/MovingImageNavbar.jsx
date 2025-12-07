// src/components/MovingImageNavbar.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

import logo1 from "../assets/images/logo1.jpg";
import logo2 from "../assets/images/logo2.jpg";
import logo3 from "../assets/images/logo3.jpg";
import logo4 from "../assets/images/logo4.jpg";

const navItems = [
  { img: logo1, label: "Students Intake", path: "/" },
  { img: logo2, label: "Research Papers", path: "/" },
  { img: logo3, label: "Budget", path: "/" },
  { img: logo4, label: "Expense Ratio", path: "/" },
];

const AUTOPLAY_DELAY = 2500; // ms

const MovingImageNavbar = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % navItems.length);
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + navItems.length) % navItems.length);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(goToNext, AUTOPLAY_DELAY);
    return () => clearInterval(intervalId);
  }, [goToNext]);

  const currentItem = navItems[currentIndex];

  const handleCardClick = () => {
    navigate(currentItem.path);
  };

  return (
    <div className="w-full py-1 ">
      <div className="relative flex items-center max-w-4xl px-2 mx-auto">
        {/* Left Arrow */}
        <button
          type="button"
          onClick={goToPrev}
          className="flex items-center justify-center p-2 mr-3 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50"
        >
          <FiChevronLeft className="text-lg text-gray-700" />
        </button>

        {/* Main Card */}
        <div
          onClick={handleCardClick}
          className="flex items-center flex-1 gap-4 px-2 py-3 transition-shadow bg-white border border-gray-200 shadow-sm cursor-pointer rounded-xl hover:shadow-md"
        >
          <img
            src={currentItem.img}
            alt={currentItem.label}
            className="object-cover w-20 h-20 border border-gray-200 rounded-lg sm:w-30 sm:h-24"
          />
          <div className="flex flex-col">
            <span className="text-base font-semibold text-gray-900 sm:text-lg">
              {currentItem.label}
            </span>
            {/* <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              Click to open detailed analytics.
            </p> */}
          </div>
        </div>

        {/* Right Arrow */}
        <button
          type="button"
          onClick={goToNext}
          className="flex items-center justify-center p-2 ml-3 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50"
        >
          <FiChevronRight className="text-lg text-gray-700" />
        </button>
      </div>
    </div>
  );
};

export default MovingImageNavbar;
