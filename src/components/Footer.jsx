import {
  FaFacebookF,
  FaLinkedinIn,
  FaTwitter,
  FaInstagram,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaEnvelope,
  FaChevronUp,
  FaMapPin,
} from "react-icons/fa";
import { SiProbot } from "react-icons/si";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="bg-gradient-to-br from-[#f8fafb] via-[#ffffff] to-[#f1f5f9] text-gray-700 mt-auto relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#2B2F4A] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#3B4164] rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-[#2B2F4A] to-[#3B4164] rounded-full blur-3xl"></div>
      </div>

      {/* Back to top button */}
      <div className="flex justify-center relative z-10">
        <button
          onClick={scrollToTop}
          className="bg-gradient-to-r from-[#2B2F4A] to-[#3B4164] text-white p-4 rounded-2xl -mt-6 shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 z-10 group border-4 border-white"
        >
          <FaChevronUp className="group-hover:-translate-y-1 transition-transform duration-300" />
        </button>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        {/* Company info and contact */}
        <div className="flex flex-col lg:flex-row justify-between items-start pb-16">
          <div className="lg:w-1/2 pr-8">
            <div className="flex items-center space-x-4 mb-8">
              <div className="relative">
                <SiProbot className="text-4xl text-[#2B2F4A]" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h2 className="font-black text-3xl bg-gradient-to-r from-[#2B2F4A] to-[#3B4164] bg-clip-text text-transparent">
                  Song Tạo ADS
                </h2>
                <p className="text-sm text-gray-500 font-medium">AI Marketing Platform</p>
              </div>
            </div>

            <p className="text-gray-600 mb-8 max-w-lg text-lg leading-relaxed">
              🚀 Nền tảng tạo quảng cáo AI hàng đầu Việt Nam, giúp doanh nghiệp tối
              ưu hóa chiến lược marketing và tăng hiệu quả quảng cáo với công nghệ
              tiên tiến nhất.
            </p>

            <div className="flex flex-col gap-4 mb-8">
              <div className="flex items-center space-x-4 group hover:translate-x-2 transition-transform duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-[#2B2F4A] to-[#3B4164] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <FaPhoneAlt className="text-white" size={16} />
                </div>
                <span className="text-lg font-medium">0899999456</span>
              </div>

              <div className="flex items-center space-x-4 group hover:translate-x-2 transition-transform duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-[#2B2F4A] to-[#3B4164] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <FaEnvelope className="text-white" size={16} />
                </div>
                <span className="text-lg font-medium">quangcaosongtao@gmail.com</span>
              </div>

              <div className="flex items-center space-x-4 group hover:translate-x-2 transition-transform duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-[#2B2F4A] to-[#3B4164] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <FaMapMarkerAlt className="text-white" size={16} />
                </div>
                <span className="text-lg font-medium">623 Điện Biên Phủ, Ninh Thạnh Tp Tây Ninh, Tây Ninh</span>
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <a
                href="#"
                className="w-12 h-12 bg-gradient-to-r from-[#2B2F4A] to-[#3B4164] text-white flex items-center justify-center rounded-2xl hover:scale-110 hover:rotate-12 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <FaFacebookF size={18} />
              </a>
              <a
                href="#"
                className="w-12 h-12 bg-gradient-to-r from-[#2B2F4A] to-[#3B4164] text-white flex items-center justify-center rounded-2xl hover:scale-110 hover:rotate-12 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <FaLinkedinIn size={18} />
              </a>
              <a
                href="#"
                className="w-12 h-12 bg-gradient-to-r from-[#2B2F4A] to-[#3B4164] text-white flex items-center justify-center rounded-2xl hover:scale-110 hover:rotate-12 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <FaTwitter size={18} />
              </a>
              <a
                href="#"
                className="w-12 h-12 bg-gradient-to-r from-[#2B2F4A] to-[#3B4164] text-white flex items-center justify-center rounded-2xl hover:scale-110 hover:rotate-12 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <FaInstagram size={18} />
              </a>
            </div>
          </div>

          {/* Map section */}
          <div className="lg:w-1/2 mt-12 lg:mt-0">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-200/50 hover:shadow-3xl transition-shadow duration-500">
              <div className="p-6 bg-gradient-to-r from-[#2B2F4A] to-[#3B4164] text-white flex items-center">
                <FaMapPin className="mr-3 text-xl" />
                <h3 className="font-bold text-lg">📍 Vị trí của chúng tôi</h3>
              </div>
              <div className="w-full h-72 relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3912.3306543844674!2d106.12970737584239!3d11.310524849113442!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310b6b6c881683b7%3A0xfff688886496fc5a!2zUXXhuqNuZyBjw6FvIFNvbmcgVOG6oW8!5e0!3m2!1svi!2s!4v1747258288228!5m2!1svi!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Vị trí Song Tạo ADS"
                  className="hover:grayscale-0 grayscale transition-all duration-500"
                ></iframe>
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider with gradient */}
        <div className="relative py-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-gradient-to-r from-[#eef2f7] to-[#e2e8f0] text-[#2B2F4A]">
              <SiProbot className="text-2xl" />
            </span>
          </div>
        </div>

        {/* Newsletter section - MOVED UP */}
        <div className="bg-custom-primary rounded-xl shadow-md p-8 mb-12 border border-blue-100">
          <div className="max-w-xl mx-auto text-center">
            <h3 className="font-bold text-xl text-white mb-4">
              Đăng Ký Nhận Thông Báo
            </h3>
            <p className="text-white mb-6">
              Nhận các bản cập nhật mới nhất về các tính năng AI và khuyến mãi
              đặc biệt
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Email của bạn"
                className="flex-1 px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B2F4A] focus:border-transparent bg-white"
              />
              <button className="bg-custom-secondary text-white px-6 py-3 rounded-md hover:opacity-90 transition-opacity shadow-sm font-medium">
                Đăng Ký
              </button>
            </div>
          </div>
        </div>

        {/* Links section - MOVED DOWN */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-10 py-8">
          <div>
            <h3 className="font-bold text-lg text-[#2B2F4A] mb-6 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-16 after:h-0.5 after:bg-[#2B2F4A] after:mt-2 pb-3">
              Sản Phẩm
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-[#2B2F4A] transition-colors duration-200 flex items-center"
                >
                  <span className="mr-2 w-1.5 h-1.5 bg-[#2B2F4A] rounded-full opacity-70"></span>
                  Tạo Quảng Cáo AI
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-[#2B2F4A] transition-colors duration-200 flex items-center"
                >
                  <span className="mr-2 w-1.5 h-1.5 bg-[#2B2F4A] rounded-full opacity-70"></span>
                  Mẫu Quảng Cáo
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-[#2B2F4A] transition-colors duration-200 flex items-center"
                >
                  <span className="mr-2 w-1.5 h-1.5 bg-[#2B2F4A] rounded-full opacity-70"></span>
                  Công Cụ Marketing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-[#2B2F4A] transition-colors duration-200 flex items-center"
                >
                  <span className="mr-2 w-1.5 h-1.5 bg-[#2B2F4A] rounded-full opacity-70"></span>
                  Giải Pháp Doanh Nghiệp
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-[#2B2F4A] transition-colors duration-200 flex items-center"
                >
                  <span className="mr-2 w-1.5 h-1.5 bg-[#2B2F4A] rounded-full opacity-70"></span>
                  Báo Giá
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg text-[#2B2F4A] mb-6 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-16 after:h-0.5 after:bg-[#2B2F4A] after:mt-2 pb-3">
              Hỗ Trợ
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-[#2B2F4A] transition-colors duration-200 flex items-center"
                >
                  <span className="mr-2 w-1.5 h-1.5 bg-[#2B2F4A] rounded-full opacity-70"></span>
                  Trung Tâm Trợ Giúp
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-[#2B2F4A] transition-colors duration-200 flex items-center"
                >
                  <span className="mr-2 w-1.5 h-1.5 bg-[#2B2F4A] rounded-full opacity-70"></span>
                  Hướng Dẫn Sử Dụng
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-[#2B2F4A] transition-colors duration-200 flex items-center"
                >
                  <span className="mr-2 w-1.5 h-1.5 bg-[#2B2F4A] rounded-full opacity-70"></span>
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-[#2B2F4A] transition-colors duration-200 flex items-center"
                >
                  <span className="mr-2 w-1.5 h-1.5 bg-[#2B2F4A] rounded-full opacity-70"></span>
                  Liên Hệ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-[#2B2F4A] transition-colors duration-200 flex items-center"
                >
                  <span className="mr-2 w-1.5 h-1.5 bg-[#2B2F4A] rounded-full opacity-70"></span>
                  Blog
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg text-[#2B2F4A] mb-6 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-16 after:h-0.5 after:bg-[#2B2F4A] after:mt-2 pb-3">
              Pháp Lý
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-[#2B2F4A] transition-colors duration-200 flex items-center"
                >
                  <span className="mr-2 w-1.5 h-1.5 bg-[#2B2F4A] rounded-full opacity-70"></span>
                  Điều Khoản Sử Dụng
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-[#2B2F4A] transition-colors duration-200 flex items-center"
                >
                  <span className="mr-2 w-1.5 h-1.5 bg-[#2B2F4A] rounded-full opacity-70"></span>
                  Chính Sách Bảo Mật
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-[#2B2F4A] transition-colors duration-200 flex items-center"
                >
                  <span className="mr-2 w-1.5 h-1.5 bg-[#2B2F4A] rounded-full opacity-70"></span>
                  Quy Định Sử Dụng
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-[#2B2F4A] transition-colors duration-200 flex items-center"
                >
                  <span className="mr-2 w-1.5 h-1.5 bg-[#2B2F4A] rounded-full opacity-70"></span>
                  Về Chúng Tôi
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright section */}
      <div className="bg-custom-primary text-white py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">
            © 2024 Song Tạo ADS. Tất cả quyền được bảo lưu.
          </p>
          <p className="text-sm mt-2 md:mt-0">Việt Nam | Tiếng Việt</p>
        </div>
      </div>
    </footer>
  );
}
