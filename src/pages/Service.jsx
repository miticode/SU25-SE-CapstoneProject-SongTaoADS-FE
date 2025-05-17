import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FaStar, FaEnvelope, FaArrowRight } from "react-icons/fa";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const services = [
  {
    title: "Quảng cáo ngoài trời tại Chợ Long Hoa – Tây Ninh",
    img: "https://bienquangcao247.com/wp-content/uploads/2024/07/lam-bien-quang-cao-01.jpg",
    desc: "Chúng tôi xin trân trọng giới thiệu một cơ hội quảng cáo đặc biệt tại Chợ Long Hoa...",
  },
  {
    title: "Thiết kế, thi công Phòng Karaoke tại Tây Ninh",
    img: "https://bienquangcao247.com/wp-content/uploads/2024/07/lam-bien-quang-cao-01.jpg",
    desc: "Để thiết kế và thi công 1 phòng karaoke hoàn chỉnh bạn phải làm các phần như sau...",
  },
  {
    title: "Sửa chữa màn hình LED tại Tây Ninh",
    img: "https://bienquangcao247.com/wp-content/uploads/2024/07/lam-bien-quang-cao-01.jpg",
    desc: "Công ty CP Tập đoàn Song Tạo tự hào là đơn vị duy nhất đến thời điểm hiện tại...",
  },
  {
    title: "Cho thuê quảng cáo tại Tây Ninh",
    img: "https://bienquangcao247.com/wp-content/uploads/2024/07/bang-hieu-quang-cao-01.jpg",
    desc: "Quảng cáo ngoài trời lớn là một trong những phương thức quảng cáo truyền thống...",
  },
  {
    title: "Sửa chữa biển hiệu tại Tây Ninh",
    img: "https://bienquangcao247.com/wp-content/uploads/2024/07/lam-bien-quang-cao-01.jpg",
    desc: "Biển hiệu bị hư hỏng, bong tróc, mờ chữ sẽ làm mất thẩm mỹ và giảm hiệu quả quảng cáo...",
  },
  {
    title: "Thiết kế bộ nhận diện thương hiệu",
    img: "https://bienquangcao247.com/wp-content/uploads/2024/07/lam-bien-quang-cao-01.jpg",
    desc: "Khi bạn bắt đầu kinh doanh, việc đầu tiên cần làm chính là thiết kế bộ nhận diện thương hiệu...",
  },
];

const testimonials = [
  {
    name: "Nguyễn Văn A",
    position: "Giám đốc Công ty ABC",
    image:
      "https://htmediagroup.vn/wp-content/uploads/2022/11/Anh-58-copy-min.jpg.webp",
    content:
      "Dịch vụ rất chuyên nghiệp, đội ngũ nhân viên nhiệt tình và tận tâm. Chúng tôi rất hài lòng với kết quả đạt được. Biển quảng cáo được thiết kế đẹp mắt.",
  },
  {
    name: "Trần Thị B",
    position: "Chủ cửa hàng XYZ",
    image:
      "https://htmediagroup.vn/wp-content/uploads/2022/11/Anh-58-copy-min.jpg.webp",
    content:
      "Đội ngũ thiết kế rất sáng tạo, luôn đưa ra những ý tưởng độc đáo. Chi phí hợp lý, chất lượng vượt trội. Tôi rất hài lòng với dịch vụ và sẽ tiếp tục hợp tác trong tương lai.",
  },
  {
    name: "Lê Văn C",
    position: "Doanh nhân",
    image:
      "https://htmediagroup.vn/wp-content/uploads/2022/11/Anh-58-copy-min.jpg.webp",
    content:
      "Đội ngũ thiết kế rất sáng tạo, luôn đưa ra những ý tưởng độc đáo. Chi phí hợp lý, chất lượng vượt trội. Tôi rất hài lòng với dịch vụ và sẽ tiếp tục hợp tác trong tương lai.",
  },
  {
    name: "Phạm Thị D",
    position: "Quản lý Nhà hàng Hương Việt",
    image:
      "https://htmediagroup.vn/wp-content/uploads/2022/11/Anh-58-copy-min.jpg.webp",
    content:
      "Biển hiệu của nhà hàng chúng tôi được thiết kế rất đẹp và chuyên nghiệp. Khách hàng rất ấn tượng với thiết kế độc đáo và chất lượng cao. Dịch vụ hậu mãi cũng rất tốt.",
  },
  {
    name: "Hoàng Văn E",
    position: "Chủ chuỗi Cafe Sài Gòn",
    image:
      "https://htmediagroup.vn/wp-content/uploads/2022/11/Anh-58-copy-min.jpg.webp",
    content:
      "Chúng tôi đã hợp tác với Song Tạo để thiết kế bộ nhận diện thương hiệu cho chuỗi cafe. Kết quả vượt ngoài mong đợi, thiết kế độc đáo và chuyên nghiệp.",
  },
  {
    name: "Ngô Thị F",
    position: "Giám đốc Marketing",
    image:
      "https://htmediagroup.vn/wp-content/uploads/2022/11/Anh-58-copy-min.jpg.webp",
    content:
      "Chiến dịch quảng cáo ngoài trời của chúng tôi được Song Tạo thực hiện rất thành công. Vị trí đặt biển quảng cáo được chọn lựa kỹ lưỡng, thiết kế ấn tượng. ROI vượt trội so với kỳ vọng.",
  },
  {
    name: "Đỗ Văn G",
    position: "Chủ Spa & Wellness",
    image:
      "https://htmediagroup.vn/wp-content/uploads/2022/11/Anh-58-copy-min.jpg.webp",
    content:
      "Thiết kế nội thất và biển hiệu cho spa của chúng tôi được thực hiện rất chuyên nghiệp. Không gian trở nên sang trọng và đẳng cấp hơn.",
  },
  {
    name: "Lý Thị H",
    position: "Quản lý Trung tâm Anh ngữ",
    image:
      "https://htmediagroup.vn/wp-content/uploads/2022/11/Anh-58-copy-min.jpg.webp",
    content:
      "Song Tạo đã giúp chúng tôi xây dựng hình ảnh thương hiệu chuyên nghiệp. Từ logo đến biển hiệu, tất cả đều được thiết kế với phong cách hiện đại và trẻ trung.",
  },
  {
    name: "Vũ Văn I",
    position: "Chủ chuỗi Gym & Fitness",
    image:
      "https://htmediagroup.vn/wp-content/uploads/2022/11/Anh-58-copy-min.jpg.webp",
    content:
      "Thiết kế biển hiệu và nội thất cho chuỗi phòng tập của chúng tôi rất ấn tượng. Không gian trở nên năng động và chuyên nghiệp hơn. Hội viên rất thích không khí mới của phòng tập.",
  },
  {
    name: "Trịnh Thị K",
    position: "Giám đốc Bất động sản",
    image:
      "https://htmediagroup.vn/wp-content/uploads/2022/11/Anh-58-copy-min.jpg.webp",
    content:
      "Song Tạo đã giúp chúng tôi thiết kế và thi công biển quảng cáo cho dự án bất động sản. Thiết kế sang trọng, chất lượng cao cấp. Khách hàng rất ấn tượng.",
  },
];

const Service = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r bg-custom-primary text-white py-20 relative overflow-hidden"
      >
        {/* Ảnh nền phủ toàn bộ section */}
        <img
          src="https://images.unsplash.com/photo-1557858310-9052820906f7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Decorative"
          className="absolute inset-0 w-full h-full object-cover opacity-60 z-0 pointer-events-none select-none"
        />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Dịch Vụ{" "}
              <span className="text-custom-secondary">Chuyên Nghiệp</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Chúng tôi cung cấp các giải pháp quảng cáo toàn diện, từ thiết kế
              đến thi công, đảm bảo mang lại hiệu quả tối đa cho doanh nghiệp
              của bạn.
            </p>
          </div>
        </div>
      </motion.section>

     
      <section className="py-20">
        <div className="container mx-auto px-36">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Dịch Vụ{" "}
              <span className="text-custom-secondary">Của Chúng Tôi</span>
            </h2>
            <div className="w-20 h-1 bg-custom-secondary mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Khám phá các dịch vụ chuyên nghiệp của chúng tôi, được thiết kế để
              đáp ứng mọi nhu cầu quảng cáo của bạn
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={service.img}
                    alt={service.title}
                    className="w-full h-64 object-cover transform hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-4 min-h-[56px]">
                    {service.desc}
                  </p>
                  <button className="inline-flex items-center bg-custom-secondary text-white px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-300 hover:translate-x-1">
                    Chi tiết <FaArrowRight className="ml-2" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-36">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Đánh Giá{" "}
              <span className="text-custom-secondary">Từ Khách Hàng</span>
            </h2>
            <div className="w-20 h-1 bg-custom-secondary mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Những phản hồi và đánh giá từ khách hàng đã sử dụng dịch vụ của
              chúng tôi
            </p>
          </motion.div>

          <div className="relative">
            <Swiper
              modules={[Pagination, Navigation, Autoplay]}
              spaceBetween={30}
              slidesPerView={1}
              pagination={{ clickable: true }}
              navigation={true}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              breakpoints={{
                640: { slidesPerView: 1 },
                1024: { slidesPerView: 2 },
                1280: { slidesPerView: 3 },
              }}
              className="testimonials-swiper"
            >
              {testimonials.map((testimonial, index) => (
                <SwiperSlide key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white p-8 rounded-xl shadow-lg h-full"
                  >
                    <div className="flex items-center mb-6">
                      <img
                        src={testimonial.image}
                        className="w-16 h-16 rounded-full object-cover border-4 border-blue-100"
                        alt={testimonial.name}
                      />
                      <div className="ml-4">
                        <h3 className="text-lg font-bold text-gray-900">
                          {testimonial.name}
                        </h3>
                        <p className="text-custom-secondary">
                          {testimonial.position}
                        </p>
                      </div>
                    </div>
                    <div className="flex text-yellow-400 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className="w-5 h-5" />
                      ))}
                    </div>
                    <p className="text-gray-600 italic leading-relaxed">
                      {testimonial.content}
                    </p>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      <section className="py-20 bg-custom-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Nhận Thông Tin Mới Từ Chúng Tôi
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Đăng ký nhận tư vấn ngay hôm nay và trải nghiệm sức mạnh của quảng
              cáo chuyên nghiệp
            </p>

            <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
              <div className="flex-1 relative">
                <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  className="w-full pl-12 pr-4 py-4 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="bg-custom-secondary hover:bg-custom-secondary/90 text-white font-bold px-8 py-4 rounded-lg transition-colors duration-300"
              >
                Tư Vấn Nhanh
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Service;
