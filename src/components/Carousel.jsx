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
    <div className="relative group">
      {/* Carousel items */}
      <div className="overflow-hidden rounded-3xl shadow-2xl border border-gray-200/50">
        <div 
          className="flex transition-transform duration-700 ease-out" 
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {items.map((item, index) => (
            <div key={index} className="w-full flex-shrink-0 relative">
              <div className="relative overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-[500px] object-cover transition-transform duration-700 hover:scale-105"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                
                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white transform translate-y-4 opacity-0 animate-fadeInUp">
                  <div className="max-w-2xl">
                    <h3 className="text-4xl font-black mb-4 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                      {item.title}
                    </h3>
                    <p className="text-xl leading-relaxed text-gray-200 font-medium">
                      {item.description}
                    </p>
                    <div className="mt-6">
                      <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl">
                        Khám phá ngay →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-6 right-6 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute bottom-20 right-20 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      <button 
        onClick={prevSlide}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-md z-10 transition-all duration-300 hover:scale-110 group border border-white/20 opacity-0 group-hover:opacity-100"
      >
        <FaChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform duration-300" />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-md z-10 transition-all duration-300 hover:scale-110 group border border-white/20 opacity-0 group-hover:opacity-100"
      >
        <FaChevronRight size={24} className="group-hover:translate-x-1 transition-transform duration-300" />
      </button>

      {/* Indicator dots */}
      <div className="flex justify-center mt-8 space-x-3">
        {items.map((_, index) => (
          <button 
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full border-2 ${
              index === current 
                ? 'bg-gradient-to-r from-[#2B2F4A] to-[#3B4164] w-12 h-4 border-[#2B2F4A] shadow-lg' 
                : 'bg-gray-300 hover:bg-gray-400 w-4 h-4 border-gray-300 hover:scale-110'
            }`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;