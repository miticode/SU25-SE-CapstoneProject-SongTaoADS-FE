import React from "react";
import { FaChartLine, FaRegLightbulb } from "react-icons/fa";
import { SiProbot } from "react-icons/si";
import Carousel from "../components/Carousel";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const Home = () => {
  const navigate = useNavigate();
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

  return (
    <div className="flex flex-col min-h-screen">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-custom-primary py-20 px-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="md:w-1/2 text-white mb-10 md:mb-0"
            >
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Tạo quảng cáo đột phá với{" "}
                <span className="text-custom-secondary">trí tuệ nhân tạo</span>
              </h1>
              <p className="mt-6 text-lg opacity-90">
                Song Tạo ADS giúp doanh nghiệp tạo ra các quảng cáo hấp dẫn và
                hiệu quả thông qua công nghệ AI tiên tiến nhất.
              </p>
              <div className="mt-8 space-x-4 flex flex-wrap gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/ai-design")}
                  className="px-6 py-3 bg-custom-secondary text-white font-medium rounded-md hover:bg-custom-primary transition-colors shadow-lg cursor-pointer z-50 relative"
                >
                  Dùng AI
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/custom-design")}
                  className="px-6 py-3 border border-white text-white font-medium rounded-md hover:bg-white hover:text-[#2B2F4A] transition-colors z-50 relative"
                >
                  Dùng thủ công
                </motion.button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="md:w-1/2 flex justify-center"
            >
              <img
                src="/src/assets/images/SongTao.png"
                alt="AI Advertising"
                className="rounded-lg shadow-2xl max-w-full h-auto"
              />
            </motion.div>
          </div>
        </div>

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
        className="py-16 px-6 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              Sản phẩm nổi bật
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Khám phá các công cụ và giải pháp quảng cáo AI tiên tiến của chúng
              tôi
            </p>
          </motion.div>

          <Carousel items={carouselItems} autoSlideInterval={5000} />
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
              Giải pháp quảng cáo thông minh
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Trải nghiệm sức mạnh của AI trong việc tạo ra các chiến dịch quảng
              cáo độc đáo và hiệu quả
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <SiProbot className="text-[#2B2F4A] text-2xl" />,
                bgColor: "bg-blue-100",
                title: "AI Tạo Nội Dung",
                description:
                  "Tự động tạo nội dung quảng cáo sáng tạo và thu hút khách hàng mục tiêu của bạn.",
              },
              {
                icon: <FaChartLine className="text-green-600 text-2xl" />,
                bgColor: "bg-green-100",
                title: "Phân Tích Hiệu Suất",
                description:
                  "Theo dõi và phân tích hiệu suất quảng cáo bằng các báo cáo chi tiết và trực quan.",
              },
              {
                icon: <FaRegLightbulb className="text-purple-600 text-2xl" />,
                bgColor: "bg-purple-100",
                title: "Tối Ưu Hóa Tự Động",
                description:
                  "Hệ thống AI tự động đề xuất và áp dụng các cải tiến để tối ưu hiệu quả chiến dịch.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div
                  className={`w-12 h-12 ${item.bgColor} rounded-full flex items-center justify-center mb-4`}
                >
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
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
