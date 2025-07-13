import React, { useEffect, useState } from "react";
import { FaChartLine, FaRegLightbulb } from "react-icons/fa";
import { SiProbot } from "react-icons/si";
import Carousel from "../components/Carousel";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import { useSelector } from "react-redux";
import { getProfileApi } from "../api/authService";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { user: authUser, isAuthenticated } = useSelector(
    (state) => state.auth
  );
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfileApi();

        if (res.success && res.data) {
          setUser(res.data);
        } else {
          console.error("Profile API response missing data:", res);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    if (isAuthenticated) {
      if (authUser) {
        setUser(authUser);
      } else if (!user) {
        fetchProfile();
      }
    } else {
      setUser(null);
    }
  }, [authUser, isAuthenticated]);

  const carouselItems = [
    {
      image: "https://placehold.co/1200x600/2B2F4A/FFF?text=AI+Marketing+Tool",
      title: "AI Marketing Tool",
      description:
        "Tự động tạo nội dung tiếp thị hấp dẫn với công nghệ AI tiên tiến",
    },
    {
      image: "https://placehold.co/1200x600/3B4164/FFF?text=Banner+Designer",
      title: "Banner Designer",
      description: "Thiết kế banner quảng cáo chuyên nghiệp chỉ trong vài phút",
    },
    {
      image:
        "https://placehold.co/1200x600/505694/FFF?text=Analytics+Dashboard",
      title: "Analytics Dashboard",
      description:
        "Theo dõi hiệu suất chiến dịch với bảng điều khiển phân tích toàn diện",
    },
  ];
  const handleDesignClick = () => {
    if (isAuthenticated) {
      navigate("/ai-design");
    } else {
      setShowLoginDialog(true);
    }
  };
  const handleLoginRedirect = () => {
    setShowLoginDialog(false);
    navigate("/auth/login");
  };
  const handleCancel = () => {
    setShowLoginDialog(false);
  };
  const LoginDialog = ({ isOpen, onClose, onLogin }) => {
    return (
      <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle className="text-center">
          <div className="flex flex-col items-center">
            <div className="mb-2">
              <SiProbot className="h-8 w-8 text-blue-600" />
            </div>
            Yêu cầu đăng nhập
          </div>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" className="text-center text-gray-600">
            Bạn cần đăng nhập để sử dụng tính năng thiết kế . Hãy đăng nhập để
            tiếp tục trải nghiệm!
          </Typography>
        </DialogContent>
        <DialogActions className="justify-center pb-4">
          <Button
            onClick={onLogin}
            variant="contained"
            color="primary"
            className="mr-2"
          >
            Đăng nhập ngay
          </Button>
          <Button onClick={onClose} variant="outlined" color="secondary">
            Hủy
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  return (
    <div className="flex flex-col min-h-screen">
      <AnimatePresence>
        {showLoginDialog && (
          <LoginDialog
            isOpen={showLoginDialog}
            onClose={handleCancel}
            onLogin={handleLoginRedirect}
          />
        )}
      </AnimatePresence>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-gradient-to-br from-[#2B2F4A] via-[#3B4164] to-[#2B2F4A] py-24 px-6 overflow-hidden"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:w-1/2 text-white mb-12 lg:mb-0"
            >
              <div className="mb-6">
                <span className="inline-block px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-full text-sm uppercase tracking-wide">
                  🚀 AI Technology
                </span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-black leading-tight mb-6">
                Tạo quảng cáo{" "}
                <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent animate-pulse">
                  đột phá
                </span>
                <br />
                với{" "}
                <span className="relative">
                  <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    trí tuệ nhân tạo
                  </span>
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3"
                    viewBox="0 0 100 12"
                    fill="none"
                  >
                    <path
                      d="M2 10C20 6 40 8 60 6C80 4 90 8 98 6"
                      stroke="url(#gradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient
                        id="gradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#60A5FA" />
                        <stop offset="100%" stopColor="#A855F7" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h1>

              <p className="mt-8 text-xl leading-relaxed text-gray-200 max-w-xl">
                🎯 Song Tạo ADS giúp doanh nghiệp tạo ra các quảng cáo hấp dẫn
                và hiệu quả thông qua công nghệ AI tiên tiến nhất. Tiết kiệm
                thời gian, tăng ROI và chinh phục khách hàng.
              </p>

              <div className="mt-12 flex flex-wrap gap-4 ">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDesignClick}
                  className="cursor-pointer group relative px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black rounded-2xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    🎨 Thiết kế ngay
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.button>
              </div>

              {/* Stats */}
              <div className="mt-16 grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-black text-yellow-400">
                    10K+
                  </div>
                  <div className="text-sm text-gray-300">Khách hàng</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-blue-400">50K+</div>
                  <div className="text-sm text-gray-300">Quảng cáo tạo</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-green-400">99%</div>
                  <div className="text-sm text-gray-300">Hài lòng</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:w-1/2 flex justify-center relative"
            >
              <div className="relative group">
                {/* Glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>

                <img
                  src="/images/SongTao.png"
                  alt="AI Advertising"
                  className="relative rounded-3xl shadow-2xl max-w-full h-auto border-4 border-white/20 backdrop-blur-sm hover:scale-105 transition-transform duration-500 -mt-8"
                />

                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-black font-bold animate-bounce">
                  AI
                </div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold animate-pulse">
                  🚀
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 120"
            className="fill-white pointer-events-none"
          >
            <path d="M0,64L60,80C120,96,240,128,360,128C480,128,600,96,720,80C840,64,960,64,1080,69.3C1200,75,1320,85,1380,90.7L1440,96L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
          </svg>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-20 px-6 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-bold">
                ✨ Sản phẩm nổi bật
              </span>
            </div>
            <h2 className="text-4xl lg:text-6xl font-black text-gray-800 mb-6">
              Công cụ AI{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                đỉnh cao
              </span>
            </h2>
            <p className="mt-6 text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              🎯 Khám phá các công cụ và giải pháp quảng cáo AI tiên tiến của
              chúng tôi - Nơi công nghệ gặp gỡ sáng tạo
            </p>
          </motion.div>

          <div className="relative">
            {/* Enhanced carousel with better styling */}
            <div className="mb-8">
              <Carousel items={carouselItems} autoSlideInterval={5000} />
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-white font-bold">AI</span>
                </div>
                <h3 className="font-bold text-lg text-gray-800 mb-2">
                  Công nghệ tiên tiến
                </h3>
                <p className="text-gray-600">
                  Sử dụng AI mới nhất để tạo nội dung chất lượng cao
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-white font-bold">⚡</span>
                </div>
                <h3 className="font-bold text-lg text-gray-800 mb-2">
                  Tốc độ siêu nhanh
                </h3>
                <p className="text-gray-600">
                  Tạo quảng cáo chuyên nghiệp chỉ trong vài phút
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -5 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-white font-bold">📊</span>
                </div>
                <h3 className="font-bold text-lg text-gray-800 mb-2">
                  Phân tích thông minh
                </h3>
                <p className="text-gray-600">
                  Theo dõi hiệu suất với dashboard chi tiết
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-20 px-6 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden"
      >
        {/* Enhanced background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-500 to-blue-500 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <div className="inline-block px-6 py-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full mb-8">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 font-bold text-lg">
                🚀 Giải pháp thông minh
              </span>
            </div>
            <h2 className="text-4xl lg:text-6xl font-black text-gray-800 mb-8">
              Quảng cáo{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 animate-pulse">
                siêu thông minh
              </span>
            </h2>
            <p className="mt-6 text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              ⚡ Trải nghiệm sức mạnh của AI trong việc tạo ra các chiến dịch
              quảng cáo độc đáo và hiệu quả vượt trội
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <SiProbot className="text-[#2B2F4A] text-3xl" />,
                bgGradient: "from-blue-500 to-purple-600",
                bgLight: "from-blue-50 to-purple-50",
                title: "🤖 AI Tạo Nội Dung",
                description:
                  "Tự động tạo nội dung quảng cáo sáng tạo và thu hút khách hàng mục tiêu của bạn với độ chính xác cao.",
                features: ["Tự động hóa 100%", "Đa ngôn ngữ", "Tối ưu SEO"],
              },
              {
                icon: <FaChartLine className="text-green-600 text-3xl" />,
                bgGradient: "from-green-500 to-emerald-600",
                bgLight: "from-green-50 to-emerald-50",
                title: "📊 Phân Tích Hiệu Suất",
                description:
                  "Theo dõi và phân tích hiệu suất quảng cáo bằng các báo cáo chi tiết và trực quan thời gian thực.",
                features: [
                  "Real-time Analytics",
                  "ROI Tracking",
                  "A/B Testing",
                ],
              },
              {
                icon: <FaRegLightbulb className="text-purple-600 text-3xl" />,
                bgGradient: "from-purple-500 to-pink-600",
                bgLight: "from-purple-50 to-pink-50",
                title: "💡 Tối Ưu Hóa Tự Động",
                description:
                  "Hệ thống AI tự động đề xuất và áp dụng các cải tiến để tối ưu hiệu quả chiến dịch tốt nhất.",
                features: [
                  "Auto Optimization",
                  "Smart Bidding",
                  "Predictive AI",
                ],
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`group relative p-8 bg-gradient-to-br ${item.bgLight} rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/50 backdrop-blur-sm overflow-hidden`}
              >
                {/* Hover effect background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${item.bgGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`}
                ></div>

                {/* Floating icon background */}
                <div
                  className={`relative w-16 h-16 bg-gradient-to-br ${item.bgGradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}
                >
                  <div className="text-white text-2xl">{item.icon}</div>
                </div>

                <h3 className="text-2xl font-black text-gray-800 mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-blue-600 transition-all duration-500">
                  {item.title}
                </h3>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {item.description}
                </p>

                {/* Feature list */}
                <div className="space-y-2 mb-6">
                  {item.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center text-sm text-gray-500"
                    >
                      <div
                        className={`w-2 h-2 bg-gradient-to-r ${item.bgGradient} rounded-full mr-3`}
                      ></div>
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Action button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-3 bg-gradient-to-r ${item.bgGradient} text-white font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 shadow-lg hover:shadow-xl`}
                >
                  Tìm hiểu thêm →
                </motion.button>

                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-white/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500"></div>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-16"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDesignClick}
              className="px-12 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black rounded-2xl text-lg shadow-2xl hover:shadow-3xl transition-all duration-300"
            >
              🎯 Bắt đầu tạo quảng cáo ngay
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-16 px-6 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              Cách hoạt động
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Chỉ với vài bước đơn giản, bạn có thể tạo ra những quảng cáo độc
              đáo và hiệu quả
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                number: "1",
                title: "Nhập mô tả sản phẩm",
                description:
                  "Mô tả sản phẩm hoặc dịch vụ của bạn và đối tượng khách hàng mục tiêu",
              },
              {
                number: "2",
                title: "AI phân tích và tạo",
                description:
                  "Hệ thống AI của chúng tôi phân tích đầu vào và tạo ra nhiều phương án quảng cáo",
              },
              {
                number: "3",
                title: "Chọn và triển khai",
                description:
                  "Lựa chọn phương án phù hợp nhất và triển khai ngay lập tức trên các nền tảng",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-16 h-16 bg-[#2B2F4A] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4"
                >
                  {step.number}
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-16 px-6 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              Khách hàng nói gì về chúng tôi
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Nguyễn Văn A",
                position: "CEO, Công ty XYZ",
                comment:
                  "Song Tạo ADS đã giúp chúng tôi tiết kiệm thời gian và nguồn lực đáng kể trong việc tạo nội dung quảng cáo. Kết quả đạt được vượt xa mong đợi của chúng tôi.",
              },
              {
                name: "Trần Thị B",
                position: "Marketing Director, Công ty ABC",
                comment:
                  "Nhờ công nghệ AI tiên tiến, chúng tôi đã tăng tỷ lệ chuyển đổi lên 45% chỉ trong vòng 3 tháng. Song Tạo ADS thực sự là một công cụ tuyệt vời!",
              },
              {
                name: "Lê Văn C",
                position: "Founder, Startup DEF",
                comment:
                  "Với ngân sách hạn chế của một startup, Song Tạo ADS đã giúp chúng tôi tạo ra các chiến dịch quảng cáo chuyên nghiệp và hiệu quả như một công ty lớn.",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                  <div>
                    <h4 className="text-lg font-semibold">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {testimonial.position}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 italic">{testimonial.comment}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-16 px-6 bg-custom-primary text-white"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Sẵn sàng nâng cao hiệu quả quảng cáo?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Đăng ký dùng thử miễn phí ngay hôm nay và trải nghiệm sức mạnh của
              AI trong quảng cáo
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-custom-secondary text-white font-medium rounded-md hover:bg-yellow-300 transition-colors shadow-lg"
              >
                Bắt đầu miễn phí
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 border border-white text-white font-medium rounded-md hover:bg-white hover:text-[#2B2F4A] transition-colors"
              >
                Liên hệ với chúng tôi
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;
