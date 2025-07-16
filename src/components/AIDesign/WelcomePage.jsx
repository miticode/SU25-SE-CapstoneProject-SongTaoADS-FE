import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FaRobot } from "react-icons/fa";

const WelcomePage = ({ onGetStarted }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  const features = [
    {
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      ),
      title: "Nhanh chóng",
      description: "Thiết kế hoàn thành trong vài phút",
      bgColor: "from-blue-500 to-blue-600",
    },
    {
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      ),
      title: "Thông minh",
      description: "AI hiểu được ý tưởng của bạn",
      bgColor: "from-emerald-500 to-emerald-600",
    },
    {
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
        />
      ),
      title: "Chuyên nghiệp",
      description: "Chất lượng thiết kế cao cấp",
      bgColor: "from-purple-500 to-purple-600",
    },
  ];

  return (
    <motion.div
      className="relative flex items-center justify-center bg-gradient-to-br from-gray-50 to-white overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-custom-primary/10 to-custom-secondary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-custom-secondary/5 to-custom-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-100/30 to-purple-100/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 text-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* AI Icon */}
        <motion.div
          className="inline-flex items-center justify-center w-20 h-20 bg-black rounded-2xl mb-8 shadow-2xl"
          variants={itemVariants}
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <FaRobot className="w-10 h-10 text-white" />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed"
          variants={itemVariants}
        >
          Tạo ra những biển hiệu{" "}
          <span className="text-custom-primary font-semibold">đẹp mắt</span>,{" "}
          <span className="text-custom-secondary font-semibold">
            chuyên nghiệp
          </span>{" "}
          chỉ trong{" "}
          <span className="text-custom-primary font-semibold">vài phút</span>{" "}
          với công nghệ AI tiên tiến
        </motion.p>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto"
          variants={containerVariants}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div
                className={`w-12 h-12 bg-gradient-to-br ${feature.bgColor} rounded-xl flex items-center justify-center mb-4 mx-auto`}
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {feature.icon}
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div className="space-y-6" variants={itemVariants}>
          <motion.button
            onClick={onGetStarted}
            className="cursor-pointer group relative inline-flex items-center justify-center px-12 py-4 text-lg font-semibold text-white bg-black rounded-2xl shadow-2xl hover:shadow-custom-primary/25 transition-all duration-300 overflow-hidden"
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-custom-secondary to-custom-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative flex items-center">
              Bắt đầu thiết kế ngay
              <svg
                className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </span>
          </motion.button>

          <motion.p className="text-sm text-gray-500" variants={itemVariants}>
            ✨ Miễn phí tạo và xem trước thiết kế
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WelcomePage;
