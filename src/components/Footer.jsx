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
    <footer className="bg-gradient-to-b from-[#eef2f7] to-[#e2e8f0] text-gray-700 mt-auto relative">
      {/* Back to top button */}
      <div className="flex justify-center">
        <button
          onClick={scrollToTop}
          className="bg-[#2B2F4A] text-white p-3 rounded-full -mt-5 shadow-lg hover:bg-blue-700 transition-all duration-300 z-10"
        >
          <FaChevronUp />
        </button>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Company info and contact */}
        <div className="flex flex-col md:flex-row justify-between items-start pb-10">
          <div className="md:w-1/2 pr-8">
            <div className="flex items-center space-x-3 mb-6">
              <SiProbot className="text-3xl text-[#2B2F4A]" />
              <h2 className="font-bold text-2xl text-[#2B2F4A]">
                Song Tạo ADS
              </h2>
            </div>

            <p className="text-gray-600 mb-6 max-w-lg">
              Nền tảng tạo quảng cáo AI hàng đầu Việt Nam, giúp doanh nghiệp tối
              ưu hóa chiến lược marketing và tăng hiệu quả quảng cáo.
            </p>

            <div className="flex flex-col gap-3 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#2B2F4A]/10 rounded-full flex items-center justify-center">
                  <FaPhoneAlt className="text-[#2B2F4A]" size={14} />
                </div>
                <span>0899999456</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#2B2F4A]/10 rounded-full flex items-center justify-center">
                  <FaEnvelope className="text-[#2B2F4A]" size={14} />
                </div>
                <span>quangcaosongtao@gmail.com</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#2B2F4A]/10 rounded-full flex items-center justify-center">
                  <FaMapMarkerAlt className="text-[#2B2F4A]" size={14} />
                </div>
                <span>623 Điện Biên Phủ, Ninh Thạnh Tp Tây Ninh, Tây Ninh</span>
              </div>
            </div>

            <div className="flex space-x-3 mt-4">
              <a
                href="#"
                className="w-9 h-9 bg-[#2B2F4A] text-white flex items-center justify-center rounded-full hover:bg-blue-600 transition-colors duration-300"
              >
                <FaFacebookF size={16} />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-[#2B2F4A] text-white flex items-center justify-center rounded-full hover:bg-blue-600 transition-colors duration-300"
              >
                <FaLinkedinIn size={16} />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-[#2B2F4A] text-white flex items-center justify-center rounded-full hover:bg-blue-600 transition-colors duration-300"
              >
                <FaTwitter size={16} />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-[#2B2F4A] text-white flex items-center justify-center rounded-full hover:bg-blue-600 transition-colors duration-300"
              >
                <FaInstagram size={16} />
              </a>
            </div>
          </div>

          {/* Map section */}
          <div className="md:w-1/2 mt-10 md:mt-0">
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
              <div className="p-4 bg-custom-primary text-white flex items-center">
                <FaMapPin className="mr-2" />
                <h3 className="font-semibold">Vị trí của chúng tôi</h3>
              </div>
              <div className="w-full h-60">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3912.3306543844674!2d106.12970737584239!3d11.310524849113442!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310b6b6c881683b7%3A0xfff688886496fc5a!2zUXXhuqNuZyBjw6FvIFNvbmcgVOG6oW8!5e0!3m2!1svi!2s!4v1747258288228!5m2!1svi!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Vị trí Song Tạo ADS"
                ></iframe>
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
