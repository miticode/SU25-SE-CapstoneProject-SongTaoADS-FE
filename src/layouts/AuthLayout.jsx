import React from "react";
import { Link, Outlet } from "react-router-dom";
import { SiProbot } from "react-icons/si";
import AIChatbot from "../components/AIChatbot";

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Left side - Brand info and visual */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-[#2B2F4A] via-[#3B4164] to-[#2B2F4A] text-white p-8 md:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-yellow-400 rounded-full blur-3xl animate-float delay-1000"></div>
          <div className="absolute top-1/2 left-10 w-24 h-24 bg-blue-400 rounded-full blur-2xl animate-float delay-500"></div>
        </div>

        <div className="relative z-10">
          {/* Logo and brand name */}
          <div className="flex items-center space-x-4 mb-16">
            <div className="relative">
              <SiProbot className="text-4xl text-yellow-400 animate-bounce" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className="font-black text-transparent text-3xl bg-clip-text bg-gradient-to-r from-white via-yellow-200 to-white">
                Song Tạo ADS
              </span>
              <div className="text-xs text-gray-300 font-medium tracking-wide">AI Marketing Platform</div>
            </div>
          </div>

          {/* Value proposition */}
          <div className="mb-12">
            <h1 className="text-4xl lg:text-5xl font-black leading-tight mb-6">
              🚀 Đột phá quảng cáo{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 animate-pulse">
                với AI
              </span>
            </h1>
            <p className="text-xl text-gray-200 max-w-lg leading-relaxed">
              ⚡ Tạo ra những quảng cáo thu hút và chuyển đổi cao với sự hỗ trợ của
              công nghệ AI tiên tiến nhất thế giới
            </p>
          </div>

          {/* Enhanced Feature highlights */}
          <div className="hidden lg:block space-y-6">
            <div className="flex items-center group hover:translate-x-2 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center mr-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="font-bold text-lg text-white">⚡ Tạo quảng cáo siêu nhanh</p>
                <p className="text-gray-300 text-sm">Chỉ trong vài phút với AI</p>
              </div>
            </div>

            <div className="flex items-center group hover:translate-x-2 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center mr-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-lg text-white">📊 Phân tích thông minh</p>
                <p className="text-gray-300 text-sm">Tối ưu chiến dịch marketing</p>
              </div>
            </div>

            <div className="flex items-center group hover:translate-x-2 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center mr-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="font-bold text-lg text-white">🎯 Hỗ trợ 24/7</p>
                <p className="text-gray-300 text-sm">Luôn sẵn sàng giúp đỡ</p>
              </div>
            </div>
          </div>

          {/* Stats section */}
          <div className="hidden lg:grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/20">
            <div className="text-center">
              <div className="text-3xl font-black text-yellow-400">10K+</div>
              <div className="text-sm text-gray-300">Khách hàng</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-blue-400">50K+</div>
              <div className="text-sm text-gray-300">Quảng cáo</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-green-400">99%</div>
              <div className="text-sm text-gray-300">Hài lòng</div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-sm text-gray-300 relative z-10">
          <p>© 2024 Song Tạo ADS. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-white via-gray-50 to-blue-50 p-8 md:p-12 lg:p-16 flex items-center justify-center relative">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-20 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-purple-500 rounded-full blur-3xl"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Glass card wrapper */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 hover:shadow-3xl transition-shadow duration-500">
            {/* Router Outlet for auth components (login, register, etc) */}
            <Outlet />
          </div>

          {/* Back to home link */}
          <div className="mt-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-white/80 backdrop-blur-sm text-[#2B2F4A] hover:text-blue-600 font-semibold rounded-2xl border border-gray-200/50 hover:bg-white/90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              🏠 Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
      <AIChatbot />
    </div>
  );
};

export default AuthLayout;
