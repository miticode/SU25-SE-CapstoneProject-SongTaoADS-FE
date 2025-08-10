import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const StepIndicator = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="flex flex-col items-center mb-16 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Desktop View */}
      <div className="hidden lg:flex items-center justify-center w-full relative">
        {/* Background Progress Line */}
        <div className="absolute h-2 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 top-1/2 left-0 right-0 -translate-y-1/2 rounded-full shadow-inner" />

        {/* Active Progress Line */}
        <motion.div
          className="absolute h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 top-1/2 left-0 -translate-y-1/2 rounded-full shadow-lg z-10"
          initial={{ width: "0%" }}
          animate={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Animated glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 rounded-full blur-sm opacity-50 animate-pulse" />
        </motion.div>

        {/* Steps Container */}
        <div className="flex justify-between w-full relative z-20">
          {steps.map((step, index) => (
            <motion.div 
              key={step.number} 
              className="flex flex-col items-center group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <motion.button
                onClick={() => onStepClick(step.number)}
                disabled={step.number > currentStep}
                whileHover={step.number <= currentStep ? { 
                  scale: 1.15, 
                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)" 
                } : {}}
                whileTap={step.number <= currentStep ? { scale: 0.95 } : {}}
                className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 font-bold text-lg border-2 shadow-lg group-hover:shadow-xl ${
                  step.number === currentStep
                    ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white border-blue-300 shadow-blue-200"
                    : step.number < currentStep
                    ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white border-green-300 shadow-green-200"
                    : "bg-white text-gray-500 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                } ${step.number <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              >
                {step.number < currentStep ? (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                    className="w-7 h-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </motion.svg>
                ) : (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                  >
                    {step.number}
                  </motion.span>
                )}

                {/* Current Step Pulse Animation */}
                {step.number === currentStep && (
                  <>
                    <motion.span
                      className="absolute w-full h-full rounded-full border-4 border-blue-400 opacity-60"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.6, 0.2, 0.6],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    <motion.span
                      className="absolute w-full h-full rounded-full border-2 border-purple-400 opacity-40"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.4, 0.1, 0.4],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5,
                      }}
                    />
                  </>
                )}
              </motion.button>

              {/* Step Label */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index * 0.1) + 0.3, duration: 0.6 }}
                className="text-center mt-4 max-w-24"
              >
                <span
                  className={`text-sm font-semibold leading-tight block ${
                    step.number <= currentStep
                      ? step.number === currentStep
                        ? "text-blue-600"
                        : "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {step.label}
                </span>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile/Tablet View */}
      <div className="flex lg:hidden flex-col w-full space-y-3">
        {/* Mobile Progress Bar */}
        <div className="relative w-full h-3 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-full shadow-inner overflow-hidden">
          <motion.div
            className="absolute h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full shadow-lg"
            initial={{ width: "0%" }}
            animate={{
              width: `${(currentStep / steps.length) * 100}%`,
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 rounded-full blur-sm opacity-50 animate-pulse" />
          </motion.div>
          
          {/* Progress Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-700 drop-shadow-sm">
              {currentStep} / {steps.length}
            </span>
          </div>
        </div>

        {/* Current Step Display */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-md ${
                currentStep > 0 
                  ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                  : "bg-white text-gray-500 border-2 border-gray-300"
              }`}>
                {currentStep}
              </div>
              <div>
                <h3 className="text-lg font-bold text-blue-900">
                  {steps.find(s => s.number === currentStep)?.label}
                </h3>
                <p className="text-sm text-blue-600">
                  Bước {currentStep} / {steps.length}
                </p>
              </div>
            </div>
            
            {/* Next Step Preview */}
            {currentStep < steps.length && (
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Tiếp theo:</p>
                <p className="text-sm font-medium text-gray-700">
                  {steps.find(s => s.number === currentStep + 1)?.label}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Mobile Step Navigation */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mt-4">
          {steps.map((step, index) => (
            <motion.button
              key={step.number}
              onClick={() => onStepClick(step.number)}
              disabled={step.number > currentStep}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className={`relative h-12 rounded-lg flex flex-col items-center justify-center transition-all duration-300 border-2 ${
                step.number === currentStep
                  ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white border-blue-300 shadow-md"
                  : step.number < currentStep
                  ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white border-green-300 shadow-md"
                  : "bg-gray-50 text-gray-400 border-gray-200"
              } ${step.number <= currentStep ? 'cursor-pointer hover:shadow-lg' : 'cursor-not-allowed'}`}
            >
              {step.number < currentStep ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-sm font-bold">{step.number}</span>
              )}
              <span className="text-xs font-medium mt-0.5 leading-none">
                {step.label.split(' ')[0]}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepIndicator;
