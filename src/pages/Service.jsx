import React from "react";

const services = [
  {
    title: "Quảng cáo ngoài trời tại Chợ Long Hoa – Tây Ninh",
    img: "https://via.placeholder.com/400x220?text=Service+1",
    desc: "Chúng tôi xin trân trọng giới thiệu một cơ hội quảng cáo đặc biệt tại Chợ Long Hoa...",
  },
  {
    title: "Thiết kế, thi công Phòng Karaoke tại Tây Ninh",
    img: "https://via.placeholder.com/400x220?text=Service+2",
    desc: "Để thiết kế và thi công 1 phòng karaoke hoàn chỉnh bạn phải làm các phần như sau...",
  },
  {
    title: "Sửa chữa màn hình LED tại Tây Ninh",
    img: "https://via.placeholder.com/400x220?text=Service+3",
    desc: "Công ty CP Tập đoàn Song Tạo tự hào là đơn vị duy nhất đến thời điểm hiện tại...",
  },
  {
    title: "Cho thuê quảng cáo tại Tây Ninh",
    img: "https://via.placeholder.com/400x220?text=Service+4",
    desc: "Quảng cáo ngoài trời lớn là một trong những phương thức quảng cáo truyền thống...",
  },
  {
    title: "Sửa chữa biển hiệu tại Tây Ninh",
    img: "https://via.placeholder.com/400x220?text=Service+5",
    desc: "Biển hiệu bị hư hỏng, bong tróc, mờ chữ sẽ làm mất thẩm mỹ và giảm hiệu quả quảng cáo...",
  },
  {
    title: "Thiết kế bộ nhận diện thương hiệu",
    img: "https://via.placeholder.com/400x220?text=Service+6",
    desc: "Khi bạn bắt đầu kinh doanh, việc đầu tiên cần làm chính là thiết kế bộ nhận diện thương hiệu...",
  },
];

const Service = () => {
  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold">
          DỊCH VỤ <span className="text-yellow-400">CỦA CHÚNG TÔI</span>
        </h2>
        <div className="w-20 h-1 bg-yellow-400 mx-auto mt-4"></div>
      </div>
      <div className="container mx-auto px-4">
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
                <button className="mt-4 bg-yellow-400 text-white font-semibold py-2 px-4 rounded hover:bg-yellow-500 transition">
                  CHI TIẾT
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="py-14 not-only-of-type:px-6 bg-gradient-to-r from-[#2B2F4A] to-[#3B4164] text-white mt-5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl text-yellow-400 font-bold mb-6">
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
              className="bg-black text-white font-bold px-8 py-4 rounded-sm hover:bg-gray-800 transition"
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
