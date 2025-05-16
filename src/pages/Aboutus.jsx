import React from "react";

const Aboutus = () => {
  return (
    <div className="container mx-auto">
      <div className="w-full h-[200px]">
        <img
          src="/src/assets/images/inner-heading-bg.jpg"
          alt="AI Advertising"
          className=" shadow-2xl w-full h-auto object-cover"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-12">
        <div className="px-4 md:px-20 lg:px-36">
          <h4 className="text-orange-600 font-semibold mb-2 ">
            Giới Thiệu Về Doanh Nghiệp
          </h4>
          <div className="w-[120px] h-[6px] bg-custom-secondary mb-3"></div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#2d2545] mb-6">
            CÔNG TY CỔ PHẦN TẬP ĐOÀN SONG TẠO
          </h2>
          <p className="text-gray-500 mb-6 leading-relaxed">
            Công ty CP Tập đoàn Song Tạo (Tây Ninh) (MST: 3901264042) tự hào là
            ĐỐI TÁC MARKETING TOÀN DIỆN: thiết kế, tư vấn, quảng cáo, nội thất,
            nhôm kính, quảng cáo online của rất nhiều khách hàng tại Tây Ninh.
            Với đội ngũ nhân viên đông đảo và máy móc đầy đủ, đặc biệt là máy in
            Nhật Mimaki đầu tiên tại Tây Ninh, máy in UV duy nhất tại Tây Ninh,…
            chúng tôi hoàn toàn tự tin có thể đáp ứng tất cả các đơn hàng và
            tiến độ của quý khách hàng
          </p>
          <button className="bg-orange-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-orange-700 transition">
            TÌM HIỂU THÊM
          </button>
        </div>
        <div className="px-4 md:px-20 lg:px-36 flex justify-center">
          <img
            src="/src/assets/images/about2.png"
            alt="About Us"
            className="rounded-xl shadow-2xl w-full max-w-[400px] h-auto object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Aboutus;
