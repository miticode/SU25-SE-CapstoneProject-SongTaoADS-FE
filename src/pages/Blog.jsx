import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FaSearch, FaCalendar, FaUser, FaBookOpen } from "react-icons/fa";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const Blog = () => {
  // Fallback image in case remote URLs are blocked or fail
  const fallbackImage =
    "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=60";

  const blogPosts = useMemo(
    () => [
      {
        id: 1,
        title: "5 xu hướng đang định hình thiết kế biển quảng cáo hiện đại",
        excerpt:
          "Cập nhật những đổi mới về vật liệu, công nghệ và bố cục giúp biển hiệu nổi bật và hiệu quả hơn trong năm 2025.",
        image: "https://images.unsplash.com/photo-1670817978397-fd68cd915094?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        category: "Xu hướng thiết kế",
        date: "15/05/2025",
        author: "Minh Nguyen",
        readTime: "7 phút đọc",
      },
      {
        id: 2,
        title: "Công nghệ LED đang thay đổi quảng cáo ngoài trời như thế nào",
        excerpt:
          "Màn hình LED thế hệ mới giúp truyền tải thông điệp sống động, tiết kiệm năng lượng và dễ bảo trì hơn.",
        image: "https://images.unsplash.com/photo-1699368364033-b8d35b3ad7d6?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        category: "Công nghệ",
        date: "10/05/2025",
        author: "Tran Hoang",
        readTime: "5 phút đọc",
      },
      {
        id: 3,
        title:
          "Vật liệu bền vững cho giải pháp biển hiệu thân thiện môi trường",
        excerpt:
          "Từ mica tái chế đến gỗ FSC và mực in ít VOC – lựa chọn thông minh để giảm tác động môi trường.",
        image: "https://images.unsplash.com/photo-1513757378314-e46255f6ed16?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        category: "Bền vững",
        date: "05/05/2025",
        author: "Linh Pham",
        readTime: "6 phút đọc",
      },
      {
        id: 4,
        title: "Bí quyết thiết kế cửa sổ trưng bày bắt mắt cho bán lẻ",
        excerpt:
          "Tối ưu điểm nhìn, ánh sáng và tương phản để dừng chân khách qua đường và tăng lưu lượng vào cửa hàng.",
        image:
          "https://images.unsplash.com/photo-1736665813752-f15663994b6f?q=80&w=1228&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        category: "Thiết kế bán lẻ",
        date: "28/04/2025",
        author: "Hai Le",
        readTime: "8 phút đọc",
      },
      {
        id: 5,
        title: "Kết hợp biển hiệu số và truyền thống: Chiến lược hybrid",
        excerpt:
          "Xây dựng chiến dịch nhất quán khi phối hợp màn hình số, đèn LED với biển hộp đèn, chữ nổi…",
        image: "https://plus.unsplash.com/premium_photo-1722944969145-f9e57dcc6e75?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        category: "Chiến lược",
        date: "22/04/2025",
        author: "Thao Nguyen",
        readTime: "9 phút đọc",
      },
      {
        id: 6,
        title: "Tâm lý màu sắc trong biển quảng cáo",
        excerpt:
          "Màu nóng – lạnh tác động đến cảm xúc và hành vi như thế nào? Ứng dụng vào bố cục biển hiệu.",
        image: "https://plus.unsplash.com/premium_photo-1723983556172-ee1932896694?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        category: "Lý thuyết thiết kế",
        date: "18/04/2025",
        author: "Duc Tran",
        readTime: "6 phút đọc",
      },
    ],
    []
  );

  // Popular categories
  const categories = [
    "Tất cả",
    "Xu hướng thiết kế",
    "Công nghệ",
    "Bền vững",
    "Thiết kế bán lẻ",
    "Chiến lược",
    "Lý thuyết thiết kế",
    "Vật liệu",
    "Nghiên cứu điển hình",
  ];

  // Recent posts for sidebar
  const recentPosts = useMemo(() => blogPosts.slice(0, 3), [blogPosts]);

  // UI state: search + category filter
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  const filteredPosts = useMemo(() => {
    return blogPosts.filter((p) => {
      const matchCategory =
        selectedCategory === "Tất cả" || p.category === selectedCategory;
      const norm = (s) => s.toLowerCase();
      const matchQuery =
        !query.trim() ||
        norm(p.title).includes(norm(query)) ||
        norm(p.excerpt).includes(norm(query)) ||
        norm(p.author).includes(norm(query));
      return matchCategory && matchQuery;
    });
  }, [blogPosts, query, selectedCategory]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50"
    >
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r bg-custom-primary text-white py-24 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-indigo-900/70 z-0"></div>
        <img
          src="https://media.istockphoto.com/id/2052899752/vi/anh/%C4%91%C3%A1m-%C4%91%C3%B4ng-qu%E1%BA%A3ng-tr%C6%B0%E1%BB%9Dng-xi%E1%BA%BFc-london-piccadilly-c%E1%BB%A7a-v%C6%B0%C6%A1ng-qu%E1%BB%91c-anh.jpg?s=2048x2048&w=is&k=20&c=h0kCV1DGRCmRP61DLvv-Sr8oIrKjWmGWCJs7P6YiNu0="
          alt="Background biển quảng cáo"
          loading="eager"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = fallbackImage;
          }}
          className="absolute inset-0 w-full h-full object-cover opacity-40 z-0 pointer-events-none select-none"
        />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                Tin {""}
                <span className="text-custom-secondary">Tức</span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto font-light">
                THIẾT KẾ SÁNG TẠO | THỰC HIỆN CHUẨN MỰC | THI CÔNG TỐC HÀNH
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Tin Tức Mới Nhất
            </h2>

            {/* Search + active filter */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative w-full md:max-w-md">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm kiếm bài viết, tác giả, chủ đề..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {selectedCategory !== "Tất cả" && (
                <div className="text-sm text-gray-600">
                  Lọc theo:{" "}
                  <span className="font-semibold">{selectedCategory}</span>
                  <button
                    onClick={() => setSelectedCategory("Tất cả")}
                    className="ml-2 text-blue-600 hover:underline"
                  >
                    Xóa lọc
                  </button>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {filteredPosts.length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-10">
                  Không tìm thấy bài viết phù hợp.
                </div>
              )}
              {filteredPosts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = fallbackImage;
                      }}
                      className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                      {post.category}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                      <Link to={`/blog/${post.id}`}>{post.title}</Link>
                    </h3>
                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <div className="flex items-center">
                        <FaCalendar className="h-4 w-4 mr-1" />
                        {post.date}
                      </div>
                      <div className="flex items-center">
                        <FaUser className="h-4 w-4 mr-1" />
                        {post.author}
                      </div>
                      <div className="flex items-center">
                        <FaBookOpen className="h-4 w-4 mr-1" />
                        {post.readTime}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-12 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button className="px-3 py-2 rounded-md bg-white border border-gray-300 hover:bg-gray-50">
                  Trang Trước
                </button>
                <button className="px-3 py-2 rounded-md bg-blue-600 text-white">
                  1
                </button>
                <button className="px-3 py-2 rounded-md bg-white border border-gray-300 hover:bg-gray-50">
                  2
                </button>
                <button className="px-3 py-2 rounded-md bg-white border border-gray-300 hover:bg-gray-50">
                  3
                </button>
                <button className="px-3 py-2 rounded-md bg-white border border-gray-300 hover:bg-gray-50">
                  Trang Tiếp
                </button>
              </nav>
            </div>
          </div>

          {/* Sidebar - 1/3 width */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-8"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Về Các Tin Tức
              </h3>
              <p className="text-gray-600 mb-6">
                Chào mừng đến với blog về thiết kế và thi công biển hiệu quảng
                cáo. Tại đây, chúng tôi chia sẻ ý tưởng sáng tạo, công nghệ mới,
                vật liệu và quy trình thi công để giúp thương hiệu của bạn nổi
                bật, dễ nhận diện và bền bỉ theo thời gian.
              </p>
              <Link
                to="/aboutus"
                className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Tìm Hiểu Thêm Về Chúng Tôi
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-8"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Danh Mục</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category, index) => {
                  const active = selectedCategory === category;
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedCategory(category)}
                      className={
                        `px-3 py-1 rounded-full text-sm transition-colors ` +
                        (active
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-800")
                      }
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Tin Tức Mới Nhất
              </h3>
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div key={post.id} className="flex gap-4">
                    <div className="w-20 h-20 flex-shrink-0">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
                        <Link to={`/blog/${post.id}`}>{post.title}</Link>
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">{post.date}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/blog"
                className="block w-full text-center text-blue-600 hover:text-blue-800 font-semibold mt-4 transition-colors"
              >
                Xem Tất Cả Bài Viết
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Blog;
