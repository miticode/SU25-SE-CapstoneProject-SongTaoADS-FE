import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  FaAward,
  FaBuilding,
  FaUsers,
  FaGlobe,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";

const AboutUs = () => {
  const teamMembers = [
    {
      name: "MR LONG",
      position: "GD BP Nội Thất",
      image:
        "https://quangcaotayninh.com.vn/wp-content/uploads/2020/09/10334375_292179787608658_6321189460400260903_n-e1631436033566-263x246.jpg",
    },
    {
      name: "MR HOANG",
      position: "Trưởng phòng Thi Công",
      image:
        "https://quangcaotayninh.com.vn/wp-content/uploads/2020/09/mr-hoang-263x246.jpg",
    },
    {
      name: "MR THANH",
      position: "Trường phòng TC Sự kiện",
      image:
        "https://quangcaotayninh.com.vn/wp-content/uploads/2020/09/mr-Thanh-263x246.png",
    },
    {
      name: "MR QUA",
      position: "Tổng giám đốc",
      image:
        "https://quangcaotayninh.com.vn/wp-content/uploads/2020/09/A-QUA-3-263x246.jpg",
    },
  ];

  const coreValues = [
    {
      title: "Excellence",
      description: "We strive for the highest standards in everything we do.",
      icon: <FaAward className="h-8 w-8 text-custom-primary" />,
    },
    {
      title: "Integrity",
      description: "We conduct business with honesty, transparency and ethics.",
      icon: <FaBuilding className="h-8 w-8 text-custom-primary" />,
    },
    {
      title: "Teamwork",
      description: "We collaborate effectively to deliver exceptional results.",
      icon: <FaUsers className="h-8 w-8 text-custom-primary" />,
    },
    {
      title: "Innovation",
      description: "We embrace creativity and new ideas to drive progress.",
      icon: <FaGlobe className="h-8 w-8 text-custom-primary" />,
    },
  ];

  const stats = [
    { value: "15+", label: "Năm kinh nghiệm" },
    { value: "1000+", label: "Dự án hoàn thành" },
    { value: "300+", label: "Khách hàng hài lòng" },
    { value: "25+", label: "Chuyên gia" },
  ];

  return (
    <div className="min-h-screen bg-white">
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
                Giới Thiệu{" "}
                <span className="text-custom-secondary">Doanh Nghiệp</span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto font-light">
                THIẾT KẾ SÁNG TẠO | THỰC HIỆN CHUẨN MỰC | THI CÔNG TỐC HÀNH
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Introduction Section */}
      <section className="py-20 px-4 sm:px-6 md:px-8 container mx-auto max-w-7xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-custom-primary mb-4">
              Giới Thiệu
            </h2>
            <div className="w-24 h-1 bg-custom-secondary mb-6"></div>
            <p className="text-3xl text-custom-primary mb-6 font-bold leading-tight">
              CÔNG TY CỔ PHẦN TẬP ĐOÀN SONG TẠO
            </p>
            <div className="prose prose-lg text-custom-primary">
              <p className="text-custom-primary mb-4 leading-relaxed italic">
                Công ty CP Tập đoàn Song Tạo (Tây Ninh) (MST: 3901264042) tự hào
                là{" "}
                <span className="font-semibold">
                  đối tác marketing toàn diện
                </span>
                : thiết kế, tư vấn, quảng cáo, nội thất, nhôm kính, quảng cáo
                online của rất nhiều khách hàng tại Tây Ninh.
              </p>
              <p className="text-custom-primary mb-4 leading-relaxed italic">
                Với đội ngũ nhân viên đông đảo và máy móc đầy đủ, đặc biệt là
                máy in Nhật Mimaki đầu tiên tại Tây Ninh, máy in UV duy nhất tại
                Tây Ninh,… chúng tôi hoàn toàn tự tin có thể đáp ứng tất cả các
                đơn hàng và tiến độ của quý khách hàng.
              </p>
              <p className="text-custom-primary italic font-medium">
                Rất mong được phục vụ quý khách.
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute -bottom-6 -right-6 bg-custom-secondary h-full w-full rounded-lg z-0"></div>
            <div className="absolute -top-6 -left-6 bg-blue-100 h-full w-full rounded-lg z-0"></div>
            <img
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop"
              alt="Team working together"
              className="rounded-lg shadow-lg relative z-10 object-cover h-full"
            />
          </motion.div>
        </div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-custom-primary py-16 px-4 sm:px-6 md:px-8 text-white"
      >
        <div className="container mx-auto max-w-7xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
              >
                <h3 className="text-4xl font-bold mb-2 text-white">
                  {stat.value}
                </h3>
                <p className="text-blue-100">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <section className="bg-gray-50 py-20 px-4 sm:px-6 md:px-8">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-custom-primary mb-4">
              Giá Trị Cốt Lõi
            </h2>
            <div className="w-24 h-1 bg-custom-secondary mx-auto mb-6"></div>
            <p className="text-custom-primary max-w-3xl mx-auto text-lg">
              Công ty Cp Tập đoàn Song Tạo định hướng là một tập đoàn phát triển
              chuyên sâu trong lĩnh vực MARKETING
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreValues.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
                whileHover={{ y: -8 }}
              >
                <div className="mb-5 p-4 bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-custom-secondary mb-3 text-center">
                  {value.title}
                </h3>
                <p className="text-custom-primary text-center">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 sm:px-6 md:px-8 container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-custom-primary mb-4">
            Đội Ngũ Chuyên Gia
          </h2>
          <div className="w-24 h-1 bg-custom-secondary mx-auto mb-6"></div>
          <p className="text-custom-primary max-w-3xl mx-auto text-lg">
            Đội ngũ nhân sự giàu kinh nghiệm, luôn tìm tòi và sáng tạo để đem
            lại giá trị tốt nhất
          </p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-300 rounded-lg">
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <div className="flex gap-3 justify-center mb-4 transform translate-y-10 group-hover:translate-y-0 transition-all duration-300">
                      <a
                        href="#"
                        className="bg-white/20 p-2 rounded-full backdrop-blur-sm hover:bg-white/40 transition-colors"
                      >
                        <FaEnvelope className="h-5 w-5 text-white" />
                      </a>
                      <a
                        href="#"
                        className="bg-white/20 p-2 rounded-full backdrop-blur-sm hover:bg-white/40 transition-colors"
                      >
                        <FaPhone className="h-5 w-5 text-white" />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="p-6 text-center bg-gradient-to-b from-blue-50 to-white">
                  <h3 className="text-xl font-semibold text-custom-primary mb-1">
                    {member.name}
                  </h3>
                  <p className="text-custom-secondary font-medium">
                    {member.position}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Timeline Section */}
      <section className="bg-gray-50 py-20 px-4 sm:px-6 md:px-8">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-custom-primary mb-4">
              Hành Trình Phát Triển
            </h2>
            <div className="w-24 h-1 bg-custom-secondary mx-auto mb-6"></div>
            <p className="text-custom-primary max-w-3xl mx-auto text-lg">
              Nhìn lại chặng đường phát triển và những cột mốc quan trọng
            </p>
          </motion.div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-200"></div>

            {/* Timeline items */}
            {[
              {
                year: "2010",
                title: "Thành Lập Công Ty",
                content:
                  "Công ty CP Tập đoàn Song Tạo chính thức được thành lập tại Tây Ninh",
              },
              {
                year: "2015",
                title: "Mở Rộng Thị Trường",
                content:
                  "Mở rộng hoạt động sang các tỉnh lân cận và nâng cao năng lực sản xuất",
              },
              {
                year: "2020",
                title: "Đầu Tư Công Nghệ",
                content:
                  "Đầu tư máy móc hiện đại, trong đó có máy in Nhật Mimaki đầu tiên tại Tây Ninh",
              },
              {
                year: "2023",
                title: "Phát Triển Mạnh Mẽ",
                content:
                  "Trở thành đối tác marketing toàn diện của nhiều doanh nghiệp lớn tại Việt Nam",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`flex justify-${
                  index % 2 === 0 ? "end" : "start"
                } relative z-10 mb-12`}
              >
                <div
                  className={`w-5/12 ${
                    index % 2 === 0 ? "text-right pr-8" : "pl-8"
                  }`}
                >
                  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                    <span className="inline-block px-4 py-2 rounded bg-custom-secondary text-white font-bold mb-3">
                      {item.year}
                    </span>
                    <h3 className="text-xl font-bold text-custom-primary mb-2">
                      {item.title}
                    </h3>
                    <p className="text-custom-primary">{item.content}</p>
                  </div>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1 w-6 h-6 rounded-full bg-custom-secondary border-4 border-white"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-custom-primary text-white py-20 px-4 sm:px-6 md:px-8">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Liên Hệ Với Chúng Tôi
                </h2>
                <div className="w-24 h-1 bg-custom-secondary mb-6"></div>
                <p className="mb-8 text-blue-100 text-lg">
                  Có câu hỏi hoặc muốn tìm hiểu thêm về dịch vụ của chúng tôi?
                  Đội ngũ của chúng tôi sẵn sàng giúp đỡ. Liên hệ với chúng tôi
                  ngay hôm nay.
                </p>
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="flex items-center group"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mr-4 group-hover:bg-custom-secondary transition-colors duration-300">
                      <FaEnvelope className="h-5 w-5 text-white" />
                    </div>
                    <span className="group-hover:translate-x-2 transition-transform duration-300">
                      info@yourcompany.com
                    </span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="flex items-center group"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mr-4 group-hover:bg-custom-secondary transition-colors duration-300">
                      <FaPhone className="h-5 w-5 text-white" />
                    </div>
                    <span className="group-hover:translate-x-2 transition-transform duration-300">
                      +1 (555) 123-4567
                    </span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="flex items-center group"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mr-4 group-hover:bg-custom-secondary transition-colors duration-300">
                      <FaGlobe className="h-5 w-5 text-white" />
                    </div>
                    <span className="group-hover:translate-x-2 transition-transform duration-300">
                      www.yourcompany.com
                    </span>
                  </motion.div>
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-white p-8 rounded-lg shadow-xl"
              >
                <form>
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-custom-secondary focus:border-custom-secondary text-gray-900"
                        placeholder="Nhập họ tên của bạn"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-custom-secondary focus:border-custom-secondary text-gray-900"
                        placeholder="Nhập email của bạn"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Tiêu đề
                    </label>
                    <input
                      type="text"
                      id="subject"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-custom-secondary focus:border-custom-secondary text-gray-900"
                      placeholder="Nhập tiêu đề"
                    />
                  </div>
                  <div className="mb-6">
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Nội dung
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-custom-secondary focus:border-custom-secondary text-gray-900 resize-none"
                      placeholder="Nhập nội dung tin nhắn"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-custom-primary hover:bg-custom-primary/90 text-white py-3 px-4 rounded-md transition-colors duration-300 font-medium"
                  >
                    Gửi Tin Nhắn
                  </button>
                </form>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
