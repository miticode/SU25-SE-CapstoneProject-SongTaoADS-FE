import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const StepIndicator = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="flex flex-col items-center mb-12 w-full max-w-3xl mx-auto px-4">
      <div className="flex items-center justify-center w-full relative">
        <div className="absolute h-1 bg-gray-200 top-1/2 left-0 right-0 -translate-y-1/2 rounded-full z-0" />

        <motion.div
          className="absolute h-1 bg-custom-primary top-1/2 left-0 -translate-y-1/2 rounded-full z-10"
          initial={{ width: "0%" }}
          animate={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
          transition={{ duration: 0.5 }}
        />

        <div className="flex justify-between w-full relative z-20">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center">
              <motion.button
                onClick={() => onStepClick(step.number)}
                disabled={step.number > currentStep}
                whileHover={step.number <= currentStep ? { scale: 1.1 } : {}}
                whileTap={step.number <= currentStep ? { scale: 0.95 } : {}}
                className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  step.number === currentStep
                    ? "bg-custom-primary text-white shadow-lg"
                    : step.number < currentStep
                    ? "bg-custom-secondary text-white"
                    : "bg-white text-gray-400 border-2 border-gray-200"
                }`}
              >
                {step.number < currentStep ? (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <span>{step.number}</span>
                )}

                {step.number === currentStep && (
                  <motion.span
                    className="absolute w-full h-full rounded-full border-4 border-custom-tertiary"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [1, 0.8, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}
              </motion.button>

              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * step.number }}
                className={`text-sm mt-3 font-medium ${
                  step.number <= currentStep
                    ? "text-custom-dark"
                    : "text-gray-500"
                }`}
              >
                {step.label}
              </motion.span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepIndicator;
