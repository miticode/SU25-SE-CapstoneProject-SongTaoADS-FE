import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
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
      "Dịch vụ rất chuyên nghiệp, đội ngũ nhân viên nhiệt tình và tận tâm. Chúng tôi rất hài lòng với kết quả đạt được. Biển quảng cáo được thiết kế đẹp mắt, chất lượng cao và đúng tiến độ.",
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
      "Chúng tôi đã hợp tác với Song Tạo để thiết kế bộ nhận diện thương hiệu cho chuỗi cafe. Kết quả vượt ngoài mong đợi, thiết kế độc đáo và chuyên nghiệp. Đội ngũ tư vấn rất nhiệt tình và sáng tạo.",
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
      "Thiết kế nội thất và biển hiệu cho spa của chúng tôi được thực hiện rất chuyên nghiệp. Không gian trở nên sang trọng và đẳng cấp hơn. Khách hàng rất ấn tượng với thiết kế tổng thể.",
  },
  {
    name: "Lý Thị H",
    position: "Quản lý Trung tâm Anh ngữ",
    image:
      "https://htmediagroup.vn/wp-content/uploads/2022/11/Anh-58-copy-min.jpg.webp",
    content:
      "Song Tạo đã giúp chúng tôi xây dựng hình ảnh thương hiệu chuyên nghiệp. Từ logo đến biển hiệu, tất cả đều được thiết kế với phong cách hiện đại và trẻ trung. Phụ huynh và học viên rất thích.",
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
      "Song Tạo đã giúp chúng tôi thiết kế và thi công biển quảng cáo cho dự án bất động sản. Thiết kế sang trọng, chất lượng cao cấp. Khách hàng rất ấn tượng với hình ảnh thương hiệu của dự án.",
  },
];

const Service = () => {
  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold">
          DỊCH VỤ <span className="text-custom-secondary">CỦA CHÚNG TÔI</span>
        </h2>
        <div className="w-20 h-1 bg-custom-secondary mx-auto mt-4"></div>
      </div>
      <div className="container mx-auto px-36">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col"
            >
              <img
                src={service.img}
                alt={service.title}
                className="h-56 w-full object-cover"
              />
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                <p className="text-gray-600 flex-1">{service.desc}</p>
                <button className="mt-4 bg-custom-secondary text-white font-semibold py-2 px-4 rounded hover:bg-yellow-500 transition">
                  CHI TIẾT
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section id="testimonials" className="testimonials section-bg py-14">
        <div className="container mx-auto px-36" data-aos="fade-up">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold">
              ĐÁNH GIÁ{" "}
              <span className="text-custom-secondary">TỪ KHÁCH HÀNG</span>
            </h2>
            <div className="w-20 h-1 bg-custom-secondary mx-auto mt-4"></div>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Những phản hồi và đánh giá từ khách hàng đã sử dụng dịch vụ của
              chúng tôi
            </p>
          </div>

          <div className="relative">
            <Swiper
              modules={[Pagination, Navigation, Autoplay]}
              spaceBetween={40}
              slidesPerView={1}
              pagination={{ clickable: true }}
              navigation={false}
              autoplay={{ delay: 2000, disableOnInteraction: false }}
              breakpoints={{
                640: { slidesPerView: 1 },
                1024: { slidesPerView: 2 },
              }}
              className="testimonials-swiper"
            >
              {testimonials.map((testimonial, index) => (
                <SwiperSlide key={index}>
                  <div className="bg-white p-8 rounded-lg shadow-lg mx-4 h-full">
                    <div className="flex items-center mb-4">
                      <img
                        src={testimonial.image}
                        className="w-20 h-20 rounded-full mr-4"
                        alt="Khách hàng"
                      />
                      <div>
                        <h3 className="text-xl font-bold">
                          {testimonial.name}
                        </h3>
                        <h4 className="text-gray-600">
                          {testimonial.position}
                        </h4>
                      </div>
                    </div>
                    <div className="flex text-yellow-400 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-600 italic">
                      {testimonial.content}
                    </p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="swiper-pagination !bottom-0"></div>
          </div>
        </div>
      </section>

      <section className="py-14 bg-custom-primary text-white mt-5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl text-custom-secondary font-bold mb-6">
            Nhận thông tin mới từ chúng tôi
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Đăng ký nhận tư vấn ngay hôm nay và trải nghiệm sức mạnh của AI
            trong quảng cáo
          </p>

          <div className="flex w-full md:w-auto flex-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="white"
              className="w-16 h-16 mx-auto md:mx-0"
            >
              <rect
                x="3"
                y="6"
                width="18"
                height="12"
                rx="2"
                stroke="white"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M3 6l9 7 9-7"
                stroke="white"
                strokeWidth="2"
                fill="none"
              />
            </svg>
            <input
              type="email"
              placeholder="Nhập email nhận tin"
              className="flex-1 px-4 py-4 rounded-sm outline-none text-gray-700 text-base bg-white placeholder-gray-400"
            />
            <button
              type="submit"
              className="bg-custom-secondary text-white font-bold px-8 py-4 rounded-sm cur  transition"
            >
              ĐĂNG KÝ
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Service;
