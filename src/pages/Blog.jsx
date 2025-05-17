import React from "react";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  FaSearch,
  FaCalendar,
  FaUser,
  FaBookOpen,
  FaArrowRight,
} from "react-icons/fa";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "5 Trends Transforming Modern Signage Design",
      excerpt:
        "Discover the latest innovations and design approaches that are revolutionizing the advertising signage industry in 2025.",
      image:
        "https://images.unsplash.com/photo-1581287053822-fd7bf4f4bfec?auto=format&fit=crop&q=80&w=800",
      category: "Design Trends",
      date: "May 15, 2025",
      author: "Minh Nguyen",
      readTime: "7 min read",
    },
    {
      id: 2,
      title: "How LED Technology is Changing Outdoor Advertising",
      excerpt:
        "LED displays are transforming the way businesses communicate with their audience. Learn how this technology is reshaping the signage landscape.",
      image:
        "https://images.unsplash.com/photo-1581287053822-fd7bf4f4bfec?auto=format&fit=crop&q=80&w=800",
      category: "Technology",
      date: "May 10, 2025",
      author: "Tran Hoang",
      readTime: "5 min read",
    },
    {
      id: 3,
      title: "Sustainable Materials for Eco-Friendly Signage Solutions",
      excerpt:
        "Explore environmentally responsible options for creating effective advertising signs that minimize environmental impact.",
      image:
        "https://images.unsplash.com/photo-1530099486328-e021101a494a?auto=format&fit=crop&q=80&w=800",
      category: "Sustainability",
      date: "May 5, 2025",
      author: "Linh Pham",
      readTime: "6 min read",
    },
    {
      id: 4,
      title: "Creating Eye-Catching Window Displays for Retail",
      excerpt:
        "Learn proven strategies to design window displays that stop pedestrians in their tracks and drive foot traffic into stores.",
      image:
        "https://images.unsplash.com/photo-1530099486328-e021101a494a?auto=format&fit=crop&q=80&w=800",
      category: "Retail Design",
      date: "April 28, 2025",
      author: "Hai Le",
      readTime: "8 min read",
    },
    {
      id: 5,
      title: "Integrating Digital and Physical Signage: A Hybrid Approach",
      excerpt:
        "Discover how to create cohesive advertising campaigns that seamlessly blend traditional physical signs with digital components.",
      image:
        "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=800",
      category: "Strategy",
      date: "April 22, 2025",
      author: "Thao Nguyen",
      readTime: "9 min read",
    },
    {
      id: 6,
      title: "The Psychology of Color in Advertising Signage",
      excerpt:
        "Understanding how different colors affect consumer behavior and how to use this knowledge in your signage design strategy.",
      image:
        "https://images.unsplash.com/photo-1550831106-2747f0d6a81c?auto=format&fit=crop&q=80&w=800",
      category: "Design Theory",
      date: "April 18, 2025",
      author: "Duc Tran",
      readTime: "6 min read",
    },
  ];

  // Popular categories
  const categories = [
    "Design Trends",
    "Technology",
    "Sustainability",
    "Retail Design",
    "Strategy",
    "Design Theory",
    "Materials",
    "Case Studies",
  ];

  // Recent posts for sidebar
  const recentPosts = blogPosts.slice(0, 3);

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
        className="bg-gradient-to-r bg-custom-primary text-white py-20 relative overflow-hidden"
      >
        <img
          src="https://media.istockphoto.com/id/2052899752/vi/anh/%C4%91%C3%A1m-%C4%91%C3%B4ng-qu%E1%BA%A3ng-tr%C6%B0%E1%BB%9Dng-xi%E1%BA%BFc-london-piccadilly-c%E1%BB%A7a-v%C6%B0%C6%A1ng-qu%E1%BB%91c-anh.jpg?s=2048x2048&w=is&k=20&c=h0kCV1DGRCmRP61DLvv-Sr8oIrKjWmGWCJs7P6YiNu0="
          alt="Decorative"
          className="absolute inset-0 w-full h-full object-cover opacity-60 z-0 pointer-events-none select-none"
        />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-white">Tin Tức</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              THIẾT KẾ SÁNG TẠO | THỰC HIỆN CHUẨN MỰC | THI CÔNG TỐC HÀNH
            </p>
          </div>
        </div>
      </motion.section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Blog Posts - 2/3 width */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Tin Tức Mới Nhất
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {blogPosts.map((post) => (
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
                Chào mừng đến với blog thiết kế quảng cáo biển hiệu. Chúng tôi
                chia sẻ các bài viết về thiết kế quảng cáo biển hiệu, các ý
                tưởng sáng tạo và các mẹo thực hành để giúp doanh nghiệp của bạn
                đứng ra khỏi đám đông với thông điệp hiệu quả thông qua các biển
                hiệu.
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
                {categories.map((category, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm cursor-pointer transition-colors"
                  >
                    {category}
                  </span>
                ))}
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
