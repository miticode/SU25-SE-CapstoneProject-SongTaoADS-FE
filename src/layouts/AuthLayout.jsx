import React from "react";
import { Link, Outlet } from "react-router-dom";
import { SiProbot } from "react-icons/si";
import AIChatbot from "../components/AIChatbot";

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Brand info and visual */}
      <div className="w-full md:w-1/2 bg-custom-primary text-white p-8 md:p-12 lg:p-16 flex flex-col justify-between">
        <div>
          {/* Logo and brand name */}
          <div className="flex items-center space-x-3 mb-12">
            <SiProbot className="text-3xl text-custom-secondary" />
            <span className="font-extrabold text-transparent text-2xl bg-clip-text bg-gradient-to-r from-white to-[#FF5F13]">
              Song Tạo ADS
            </span>
          </div>

          {/* Value proposition */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
              Đột phá quảng cáo <br />
              <span className="text-custom-secondary">
                với trí tuệ nhân tạo
              </span>
            </h1>
            <p className="text-lg opacity-80 max-w-md">
              Tạo ra những quảng cáo thu hút và chuyển đổi cao với sự hỗ trợ của
              công nghệ AI tiên tiến
            </p>
          </div>

          {/* Feature highlights */}
          <div className="hidden md:block">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-yellow-300/20 flex items-center justify-center mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-custom-secondary"
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
              <p className="font-medium">
                Tạo quảng cáo thu hút chỉ trong vài phút
              </p>
            </div>
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-yellow-300/20 flex items-center justify-center mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-custom-secondary"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                </svg>
              </div>
              <p className="font-medium">
                Phân tích và tối ưu chiến dịch marketing
              </p>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-yellow-300/20 flex items-center justify-center mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-custom-secondary"
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
              <p className="font-medium">Hỗ trợ khách hàng 24/7</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-sm opacity-70">
          <p>© 2024 Song Tạo ADS. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="w-full md:w-1/2 bg-white p-8 md:p-12 lg:p-16 flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Router Outlet for auth components (login, register, etc) */}
          <Outlet />

          {/* Back to home link */}
          <div className="mt-8 text-center">
            <Link
              to="/"
              className="text-[#2B2F4A] hover:text-blue-600 font-medium flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
      <AIChatbot />
    </div>
  );
};

export default AuthLayout;
