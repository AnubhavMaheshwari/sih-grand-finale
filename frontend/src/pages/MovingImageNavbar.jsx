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

const AUTOPLAY_DELAY = 3500; // ms

const MovingImageNavbar = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % navItems.length);
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + navItems.length) % navItems.length);
  }, []);

  const goToIndex = useCallback((index) => {
    setCurrentIndex(index);
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
    <div className="relative flex items-center justify-center w-full py-6 shadow-md bg-gradient-to-r from-indigo-700 via-indigo-500 to-blue-500">
      <div className="relative w-full max-w-4xl px-4">
        {/* Left Arrow */}
        <button
          type="button"
          onClick={goToPrev}
          className="absolute flex items-center justify-center p-2 transition-all -translate-y-1/2 border border-gray-200 rounded-full shadow-lg left-2 sm:left-4 top-1/2 bg-white/90 hover:bg-white sm:p-3"
        >
          <FiChevronLeft className="text-xl text-gray-700 sm:text-2xl" />
        </button>

        {/* Main Card */}
        <div
          onClick={handleCardClick}
          className="cursor-pointer flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-white/95 rounded-2xl shadow-2xl px-6 py-5 sm:px-10 sm:py-7 transition-transform hover:scale-[1.02] hover:shadow-[0_20px_45px_rgba(15,23,42,0.25)]"
        >
          <img
            src={currentItem.img}
            alt={currentItem.label}
            className="object-cover w-24 h-24 border border-gray-200 shadow-md sm:w-40 sm:h-32 rounded-2xl"
          />
          <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
            <span className="text-lg font-semibold text-gray-900 sm:text-2xl">
              {currentItem.label}
            </span>
            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              Click to explore detailed analytics and insights.
            </p>
          </div>
        </div>

        {/* Bottom Buttons (each nav item clickable & moves image) */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          {navItems.map((item, index) => {
            const isActive = index === currentIndex;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => goToIndex(index)}
                className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium border transition-all
                  ${
                    isActive
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md scale-105"
                      : "bg-white/80 text-gray-700 border-gray-200 hover:bg-indigo-50 hover:border-indigo-300"
                  }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Right Arrow */}
        <button
          type="button"
          onClick={goToNext}
          className="absolute flex items-center justify-center p-2 transition-all -translate-y-1/2 border border-gray-200 rounded-full shadow-lg right-2 sm:right-4 top-1/2 bg-white/90 hover:bg-white sm:p-3"
        >
          <FiChevronRight className="text-xl text-gray-700 sm:text-2xl" />
        </button>
      </div>
    </div>
  );
};

export default MovingImageNavbar;
