import React from "react";
import { Link } from "react-router-dom";
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
      icon: <FaBuilding className="h-8 w-8 text" />,
    },
    {
      title: "Teamwork",
      description: "We collaborate effectively to deliver exceptional results.",
      icon: <FaUsers className="h-8 w-8 text" />,
    },
    {
      title: "Innovation",
      description: "We embrace creativity and new ideas to drive progress.",
      icon: <FaGlobe className="h-8 w-8 text" />,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
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
              Giới Thiệu{" "}
              <span className="text-custom-secondary">Doanh Nghiệp</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              THIẾT KẾ SÁNG TẠO | THỰC HIỆN CHUẨN MỰC | THI CÔNG TỐC HÀNH
            </p>
          </div>
        </div>
      </motion.section>

      <section className="py-16 px-4 sm:px-6 md:px-8 container mx-auto max-w-7xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold text-custom-primary mb-4">
              Giới Thiệu
            </h2>
            <div className="w-20 h-1 bg-custom-secondary mb-6"></div>
            <p className="text-[27px] text-custom-primary mb-4 font-bold">
              CÔNG TY CỔ PHẦN TẬP ĐOÀN SONG TẠO
            </p>
            <p className="text-custom-primary italic mb-4">
              Công ty CP Tập đoàn Song Tạo (Tây Ninh) (MST: 3901264042) tự hào
              là ĐỐI TÁC MARKETING TOÀN DIỆN: thiết kế, tư vấn, quảng cáo, nội
              thất, nhôm kính, quảng cáo online của rất nhiều khách hàng tại Tây
              Ninh. Với đội ngũ nhân viên đông đảo và máy móc đầy đủ, đặc biệt
              là máy in Nhật Mimaki đầu tiên tại Tây Ninh, máy in UV duy nhất
              tại Tây Ninh,… chúng tôi hoàn toàn tự tin có thể đáp ứng tất cả
              các đơn hàng và tiến độ của quý khách hàng.
            </p>
            <p className="text-custom-primary italic">
              Rất mong được phục vụ quý khách.
            </p>
          </div>
          <div className="relative">
            <div className="bg-blue-100 absolute -top-6 -left-6 rounded-lg w-full h-full z-0"></div>
            <img
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop"
              alt="Team working together"
              className="rounded-lg shadow-lg relative z-10"
            />
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16 px-4 sm:px-6 md:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-custom-primary mb-4">
              Giá Trị Cốt Lõi
            </h2>
            <div className="w-20 h-1 bg-custom-secondary mx-auto mb-6"></div>
            <p className="text-custom-primary max-w-3xl mx-auto">
              Công ty Cp Tập đoàn Song Tạo định hướng là một tập đoàn phát triển
              chuyên sâu trong lĩnh vực MARKETING
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreValues.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="mb-4 flex justify-center">{value.icon}</div>
                <h3 className="text-xl font-semibold text-custom-secondary mb-2 text-center">
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

      <section className="py-16 px-4 sm:px-6 md:px-8 container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-custom-primary mb-4">
            Đội Ngũ Nhân Viên
          </h2>
          <div className="w-20 h-1 bg-custom-secondary mx-auto mb-6"></div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold text-blue-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-custom-primary mb-3">{member.position}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-custom-primary text-white py-16 px-4 sm:px-6 md:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Liên Hệ</h2>
              <p className="mb-8 text-blue-100">
                Có câu hỏi hoặc muốn tìm hiểu thêm về dịch vụ của chúng tôi? Đội
                ngũ của chúng tôi sẵn sàng giúp đỡ. Liên hệ với chúng tôi ngay
                hôm nay.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <FaEnvelope className="h-6 w-6 mr-3 text-white" />
                  <span>info@yourcompany.com</span>
                </div>
                <div className="flex items-center">
                  <FaPhone className="h-6 w-6 mr-3 text-w" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <FaGlobe className="h-6 w-6 mr-3 text-w" />
                  <span>www.yourcompany.com</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <form>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="Your name"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="Your email"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Subject"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Your message"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-300"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
