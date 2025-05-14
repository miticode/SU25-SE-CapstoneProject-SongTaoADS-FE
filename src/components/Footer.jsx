import {
  FaFacebookF,
  FaLinkedinIn,
  FaTwitter,
  FaInstagram,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaEnvelope,
  FaChevronUp,
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
    <footer className="bg-gradient-to-b from-[#f9f9f9] to-[#f1f1f1] text-gray-700 mt-auto">
      <div className="flex justify-center">
        <button
          onClick={scrollToTop}
          className="bg-[#2B2F4A] text-white p-3 rounded-full -mt-5 shadow-lg hover:bg-blue-700 transition-all duration-300"
        >
          <FaChevronUp />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-10 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-6 md:mb-0">
            <SiProbot className="text-3xl text-[#2B2F4A]" />
            <h2 className="font-bold text-2xl text-[#2B2F4A]">Song Tạo ADS</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            <div className="flex items-center space-x-2">
              <FaPhoneAlt className="text-[#2B2F4A]" />
              <span>(+84) 123 456 789</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaEnvelope className="text-[#2B2F4A]" />
              <span>contact@songtaoads.vn</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaMapMarkerAlt className="text-[#2B2F4A]" />
              <span>Thành phố Hồ Chí Minh, Việt Nam</span>
            </div>
          </div>
        </div>

        <div className="w-full py-8 border-b border-gray-200">
          <div className="w-full h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden shadow-md">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3912.3306543844674!2d106.12970737584239!3d11.310524849113442!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310b6b6c881683b7%3A0xfff688886496fc5a!2zUXXhuqNuZyBjw6FvIFNvbmcgVOG6oW8!5e0!3m2!1svi!2s!4v1747258288228!5m2!1svi!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Vị trí Song Tạo ADS"
              className="rounded-lg"
            ></iframe>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 py-10">
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-[#2B2F4A]">Về Chúng Tôi</h3>
            <p className="text-gray-600">
              Nền tảng tạo quảng cáo AI hàng đầu Việt Nam, giúp doanh nghiệp tối
              ưu hóa chiến lược marketing và tăng hiệu quả quảng cáo.
            </p>
            <div className="flex space-x-4 mt-6">
              <a
                href="#"
                className="bg-[#2B2F4A] text-white p-2 rounded-full hover:bg-blue-600 transition-colors duration-300"
              >
                <FaFacebookF />
              </a>
              <a
                href="#"
                className="bg-[#2B2F4A] text-white p-2 rounded-full hover:bg-blue-600 transition-colors duration-300"
              >
                <FaLinkedinIn />
              </a>
              <a
                href="#"
                className="bg-[#2B2F4A] text-white p-2 rounded-full hover:bg-blue-600 transition-colors duration-300"
              >
                <FaTwitter />
              </a>
              <a
                href="#"
                className="bg-[#2B2F4A] text-white p-2 rounded-full hover:bg-blue-600 transition-colors duration-300"
              >
                <FaInstagram />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg text-[#2B2F4A] mb-4">Sản Phẩm</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-[#2B2F4A] transition-colors duration-200"
                >
                  Tạo Quảng Cáo AI
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-[#2B2F4A] transition-colors duration-200"
                >
                  Mẫu Quảng Cáo
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-[#2B2F4A] transition-colors duration-200"
                >
                  Công Cụ Marketing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-[#2B2F4A] transition-colors duration-200"
                >
                  Giải Pháp Doanh Nghiệp
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-[#2B2F4A] transition-colors duration-200"
                >
                  Báo Giá
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg text-[#2B2F4A] mb-4">Hỗ Trợ</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-[#2B2F4A] transition-colors duration-200"
                >
                  Trung Tâm Trợ Giúp
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-[#2B2F4A] transition-colors duration-200"
                >
                  Hướng Dẫn Sử Dụng
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-[#2B2F4A] transition-colors duration-200"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-[#2B2F4A] transition-colors duration-200"
                >
                  Liên Hệ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-[#2B2F4A] transition-colors duration-200"
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg text-[#2B2F4A] mb-4">Pháp Lý</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-[#2B2F4A] transition-colors duration-200"
                >
                  Điều Khoản Sử Dụng
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-[#2B2F4A] transition-colors duration-200"
                >
                  Chính Sách Bảo Mật
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-[#2B2F4A] transition-colors duration-200"
                >
                  Quy Định Sử Dụng
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-[#2B2F4A] transition-colors duration-200"
                >
                  Về Chúng Tôi
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 pb-4">
          <div className="max-w-md mx-auto">
            <h3 className="font-bold text-lg text-[#2B2F4A] mb-4 text-center">
              Đăng Ký Nhận Thông Báo
            </h3>
            <div className="flex">
              <input
                type="email"
                placeholder="Email của bạn"
                className="flex-1 px-4 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B2F4A]"
              />
              <button className="bg-[#2B2F4A] text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition-colors duration-300">
                Đăng Ký
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#2B2F4A] text-white py-4">
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
