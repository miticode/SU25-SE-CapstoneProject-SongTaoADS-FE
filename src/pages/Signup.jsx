import { useState } from "react";
import { Link } from "react-router-dom";
import PageTransition from "../components/PageTransition";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Xử lý đăng ký
    console.log("Register with:", { name, email, password });
  };

  return (
    <PageTransition className="w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Tạo tài khoản</h2>
        <p className="text-gray-600">
          Tham gia cùng Song Tạo ADS để tạo quảng cáo bằng AI
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Họ và tên
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2B2F4A] focus:border-transparent"
            placeholder="Nguyễn Văn A"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2B2F4A] focus:border-transparent"
            placeholder="your.email@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Mật khẩu
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2B2F4A] focus:border-transparent"
            placeholder="••••••••"
          />
          <p className="mt-1 text-xs text-gray-500">
            Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ, số và ký tự đặc biệt
          </p>
        </div>

        <div className="flex items-center">
          <input
            id="terms"
            type="checkbox"
            required
            className="h-4 w-4 text-[#2B2F4A] border-gray-300 rounded focus:ring-[#2B2F4A]"
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
            Tôi đồng ý với{" "}
            <Link to="/terms" className="text-[#2B2F4A] hover:underline">
              Điều khoản sử dụng
            </Link>{" "}
            và{" "}
            <Link to="/privacy" className="text-[#2B2F4A] hover:underline">
              Chính sách bảo mật
            </Link>
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-custom-primary text-white py-2 px-4 rounded-md hover:opacity-90 transition-opacity font-medium"
        >
          Đăng ký
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-600">
          Đã có tài khoản?{" "}
          <Link
            to="/auth/login"
            className="text-[#2B2F4A] hover:underline font-medium"
          >
            Đăng nhập
          </Link>
        </p>
      </div>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Hoặc đăng ký với
            </span>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button className="flex items-center justify-center py-2 w-full border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <svg
              className="h-5 w-5 mr-2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Đăng nhập với Google
          </button>
        </div>
      </div>
    </PageTransition>
  );
};

export default Signup;
