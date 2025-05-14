import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Carousel = ({ items, autoSlideInterval = 5000 }) => {
  const [current, setCurrent] = useState(0);
  
  // Auto slide carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(current => (current === items.length - 1 ? 0 : current + 1));
    }, autoSlideInterval);
    return () => clearInterval(interval);
  }, [items.length, autoSlideInterval]);

  // Handlers for navigation
  const nextSlide = () => {
    setCurrent(current === items.length - 1 ? 0 : current + 1);
  };

  const prevSlide = () => {
    setCurrent(current === 0 ? items.length - 1 : current - 1);
  };

  const goToSlide = (index) => {
    setCurrent(index);
  };

  return (
    <div className="relative">
      {/* Carousel items */}
      <div className="overflow-hidden rounded-xl">
        <div 
          className="flex transition-transform duration-500 ease-in-out" 
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {items.map((item, index) => (
            <div key={index} className="w-full flex-shrink-0">
              <div className="relative">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-[400px] object-cover rounded-xl"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                  <p className="text-lg">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      <button 
        onClick={prevSlide}
        className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full shadow-lg backdrop-blur-sm z-10 transition-all"
      >
        <FaChevronLeft size={20} />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full shadow-lg backdrop-blur-sm z-10 transition-all"
      >
        <FaChevronRight size={20} />
      </button>

      {/* Indicator dots */}
      <div className="flex justify-center mt-4 space-x-2">
        {items.map((_, index) => (
          <button 
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === current ? 'bg-[#2B2F4A] w-6' : 'bg-gray-300'
            }`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;