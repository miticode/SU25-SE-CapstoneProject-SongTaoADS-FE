import { useState, useEffect } from "react";
import {
  FaBell,
  FaBars,
  FaChevronDown,
  FaSearch,
  FaUserCircle,
} from "react-icons/fa";
import { SiProbot } from "react-icons/si";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/features/auth/authSlice";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hideAnnouncement, setHideAnnouncement] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
      setHideAnnouncement(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  useEffect(() => {
    const closeUserMenu = () => {
      setUserMenuOpen(false);
    };

    if (userMenuOpen) {
      document.addEventListener("click", closeUserMenu);
    }

    return () => {
      document.removeEventListener("click", closeUserMenu);
    };
  }, [userMenuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "shadow-md bg-white"
          : "bg-gradient-to-r from-[#f8f9fa] to-[#ffffff]"
      }`}
    >
      <div
        className={`text-sm px-4 py-2 flex items-center justify-center bg-custom-primary text-white transition-all duration- overflow-hidden ${
          hideAnnouncement ? "max-h-0 py-0 opacity-0" : "max-h-20 opacity-100"
        }`}
      >
        <FaBell className="mr-2 text-custom-secondary animate-pulse" />
        <span className="font-medium tracking-wide">
          Khám phá sức mạnh của AI trong quảng cáo – Hãy tạo quảng cáo của bạn
          ngay hôm nay!
        </span>
      </div>

      <div
        className={`px-6 py-3 flex items-center justify-between transition-all duration-300 ${
          isScrolled ? "bg-white" : "bg-transparent"
        }`}
      >
        <div className="flex items-center space-x-2">
          <SiProbot className="text-custom-primary text-2xl transform hover:rotate-12 transition-all duration-300" />
          <span className="font-extrabold text-transparent text-xl bg-clip-text bg-gradient-to-r from-[#040C20] to-[#323768]">
            Song Tạo ADS
          </span>
        </div>

        <div className="md:hidden">
          <button
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <FaBars size={20} className="text-[#2B2F4A]" />
          </button>
        </div>

        <nav className="hidden md:flex space-x-1 items-center">
          <a
            href="/"
            className="px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium transition-colors"
          >
            Trang chủ
          </a>
          <div className="relative group">
            <button className="px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium flex items-center space-x-1 transition-colors">
              <span>Giải pháp</span>
              <FaChevronDown
                size={12}
                className="text-gray-500 group-hover:rotate-180 transition-transform duration-300"
              />
            </button>
            <div className="absolute left-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform translate-y-2 group-hover:translate-y-0">
              <div className="py-1">
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Quảng cáo AI
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Phân tích dữ liệu
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Tối ưu hóa quảng cáo
                </a>
              </div>
            </div>
          </div>
          <a
            href="/service"
            className="px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium transition-colors"
          >
            Dịch vụ
          </a>
          <a
            href="/aboutus"
            className="px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium transition-colors"
          >
            Giới thiệu
          </a>
          <a
            href="/blog"
            className="px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 font-medium transition-colors"
          >
            Blog
          </a>
        </nav>

        <div className="hidden md:flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="pl-8 pr-4 py-1.5 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B2F4A] focus:border-transparent text-sm w-36 transition-all duration-300 focus:w-48"
            />
            <FaSearch
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={14}
            />
          </div>
          {isAuthenticated && (
            <button
              onClick={() => navigate("/order-history")}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Lịch sử đơn hàng"
            >
              <ShoppingCartIcon />
            </button>
          )}

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleUserMenu();
                }}
                className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <FaUserCircle size={20} className="text-[#2B2F4A]" />
                <span className="font-medium text-gray-700">
                  {user?.fullName || user?.email || "Tài khoản"}
                </span>
                <FaChevronDown size={12} className="text-gray-500" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Thông tin cá nhân
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="px-4 py-2 border border-[#2B2F4A] text-[#2B2F4A] rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/auth/signup"
                className="px-4 py-2 bg-custom-secondary text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden px-6 pb-4 bg-white space-y-3 text-gray-700 text-sm font-medium border-t border-gray-100 animate-fadeIn">
          <a href="/" className="block py-2 hover:text-[#2B2F4A]">
            Trang chủ
          </a>
          <div className="py-2">
            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer hover:text-[#2B2F4A]">
                Giải pháp
                <FaChevronDown
                  size={12}
                  className="text-gray-500 group-open:rotate-180 transition-transform"
                />
              </summary>
              <div className="mt-2 ml-4 space-y-2">
                <a
                  href="#"
                  className="block py-1 text-gray-600 hover:text-[#2B2F4A]"
                >
                  Quảng cáo AI
                </a>
                <a
                  href="#"
                  className="block py-1 text-gray-600 hover:text-[#2B2F4A]"
                >
                  Phân tích dữ liệu
                </a>
                <a
                  href="#"
                  className="block py-1 text-gray-600 hover:text-[#2B2F4A]"
                >
                  Tối ưu hóa quảng cáo
                </a>
              </div>
            </details>
          </div>
          <a href="/service" className="block py-2 hover:text-[#2B2F4A]">
            Dịch vụ
          </a>
          <a href="/aboutus" className="block py-2 hover:text-[#2B2F4A]">
            Về chúng tôi
          </a>
          <a href="/blog" className="block py-2 hover:text-[#2B2F4A]">
            Blog
          </a>

          <div className="pt-3 mt-3">
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full pl-8 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B2F4A] focus:border-transparent text-sm"
              />
              <FaSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={14}
              />
            </div>

            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md mb-2">
                  <FaUserCircle size={18} className="text-[#2B2F4A]" />
                  <span className="font-medium text-gray-700 text-sm">
                    {user?.fullName || user?.email || "Tài khoản"}
                  </span>
                </div>
                <Link
                  to="/dashboard"
                  className="block w-full px-4 py-2 border border-[#2B2F4A] text-[#2B2F4A] rounded-md text-sm font-medium hover:bg-gray-50 transition-colors mb-2 text-center"
                >
                  Bảng điều khiển
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition-colors text-center"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="block w-full px-4 py-2 border border-[#2B2F4A] text-[#2B2F4A] rounded-md text-sm font-medium hover:bg-gray-50 transition-colors mb-2 text-center"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/auth/signup"
                  className="block w-full px-4 py-2 bg-custom-secondary text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity text-center"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
