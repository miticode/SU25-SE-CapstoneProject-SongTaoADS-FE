import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  FaStar,
  FaEnvelope,
  FaArrowRight,
  FaChevronDown,
} from "react-icons/fa";
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

const processSteps = [
  {
    title: "Tư Vấn & Lên Ý Tưởng",
    desc: "Chúng tôi lắng nghe yêu cầu và tư vấn giải pháp phù hợp nhất.",
  },
  {
    title: "Thiết Kế & Duyệt Mẫu",
    desc: "Đội ngũ thiết kế chuyên nghiệp sẽ tạo ra những mẫu thiết kế độc đáo.",
  },
  {
    title: "Thi Công & Lắp Đặt",
    desc: "Sản phẩm được thi công tỉ mỉ và lắp đặt chuyên nghiệp.",
  },
  {
    title: "Bảo Hành & Hậu Mãi",
    desc: "Chúng tôi cam kết các dịch vụ bảo hành và hậu mãi tốt nhất.",
  },
];
const faqItems = [
  {
    question: "Làm thế nào để đặt dịch vụ từ công ty?",
    answer:
      "Bạn có thể liên hệ với chúng tôi qua số điện thoại, email hoặc mẫu liên hệ trên website. Đội ngũ tư vấn sẽ hỗ trợ bạn trong thời gian sớm nhất.",
  },
  {
    question: "Thời gian hoàn thành một biển quảng cáo là bao lâu?",
    answer:
      "Thời gian hoàn thành phụ thuộc vào quy mô và độ phức tạp của dự án, thông thường từ 3-7 ngày làm việc cho các dự án nhỏ và 1-3 tuần cho các dự án lớn.",
  },
  {
    question: "Công ty có cung cấp dịch vụ bảo hành không?",
    answer:
      "Có, chúng tôi cung cấp dịch vụ bảo hành từ 12-24 tháng tùy theo loại sản phẩm và dịch vụ.",
  },
  {
    question: "Chi phí cho một biển hiệu quảng cáo là bao nhiêu?",
    answer:
      "Chi phí phụ thuộc vào kích thước, chất liệu, thiết kế và vị trí lắp đặt. Chúng tôi sẽ tư vấn và báo giá chi tiết sau khi tiếp nhận yêu cầu cụ thể từ khách hàng.",
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
        className="bg-gradient-to-r bg-custom-primary text-white py-24 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-indigo-900/70 z-0"></div>
        <img
          src="https://media.istockphoto.com/id/2052899752/vi/anh/%C4%91%C3%A1m-%C4%91%C3%B4ng-qu%E1%BA%A3ng-tr%C6%B0%E1%BB%9Dng-xi%E1%BA%BFc-london-piccadilly-c%E1%BB%A7a-v%C6%B0%C6%A1ng-qu%E1%BB%91c-anh.jpg?s=2048x2048&w=is&k=20&c=h0kCV1DGRCmRP61DLvv-Sr8oIrKjWmGWCJs7P6YiNu0="
          alt="Decorative"
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
                Dịch Vụ{" "}
                <span className="text-custom-secondary">Chuyên Nghiệp</span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto font-light italic">
                Chúng tôi cung cấp các giải pháp quảng cáo toàn diện, từ thiết
                kế đến thi công, đảm bảo mang lại hiệu quả tối đa cho doanh
                nghiệp của bạn.
              </p>
            </motion.div>
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
                  <p className="text-gray-600 mb-4 min-h-[56px] italic">
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

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Quy Trình <span className="text-custom-secondary">Làm Việc</span>
            </h2>
            <div className={`w-24 h-1 bg-custom-secondary mx-auto mb-8`}></div>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Quy trình làm việc chuyên nghiệp và hiệu quả, đảm bảo chất lượng
              sản phẩm tốt nhất
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative"
              >
                <div
                  className={`w-20 h-20 rounded-full bg-custom-primary text-white flex items-center justify-center text-3xl font-bold mb-6 mx-auto`}
                >
                  {idx + 1}
                </div>
                {idx < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-full h-1 bg-gray-200"></div>
                )}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 italic">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Câu Hỏi <span className="text-custom-secondary">Thường Gặp</span>
            </h2>
            <div className={`w-24 h-1 bg-custom-secondary mx-auto mb-8`}></div>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Giải đáp những thắc mắc phổ biến về dịch vụ của chúng tôi
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {faqItems.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="mb-6 bg-gray-50 rounded-lg p-6 shadow-md"
              >
                <details className="group">
                  <summary className="flex justify-between items-center font-bold text-lg cursor-pointer list-none">
                    {item.question}
                    <FaChevronDown className="w-5 h-5 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="mt-4 text-gray-600 leading-relaxed italic">
                    {item.answer}
                  </div>
                </details>
              </motion.div>
            ))}
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
            <p className="text-xl text-blue-100 mb-8 italic">
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
