import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";

import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaCheckCircle,
  FaStar,
  FaUsers,
  FaAward,
  FaShieldAlt,
} from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";

const ServiceDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data - trong thực tế sẽ lấy từ API
  const serviceData = {
    "quang-cao-ngoai-troi-tai-cho-long-hoa-tay-ninh": {
      title: "Quảng cáo ngoài trời tại Chợ Long Hoa – Tây Ninh",
      shortDesc: "Cơ hội quảng cáo đặc biệt tại chợ lớn nhất Tây Ninh",
      fullDesc: `VÌ SAO NÊN CHỌN QUẢNG CÁO TẠI CHỢ LONG HOA?

- VỊ TRÍ ĐẮC ĐỊA:
Chợ Long Hoa nằm ngay trung tâm thị trấn Hòa Thành, giao thông thuận tiện, dễ dàng tiếp cận từ nhiều tuyến đường chính. Điều này giúp quảng cáo của Quý Doanh Nghiệp nổi bật và thu hút sự chú ý của đông đảo người dân địa phương cũng như du khách.

- LƯỢNG KHÁCH HÀNG KHỔNG LỒ:
Mỗi năm, Chợ Long Hoa đón tiếp hàng triệu lượt khách, bao gồm người dân địa phương và du khách từ các nơi khác. Đây là cơ hội để thương hiệu của Quý Doanh Nghiệp tiếp cận một lượng lớn khách hàng đa dạng, từ người tiêu dùng bình dân đến các đối tượng cao cấp.

- KHÔNG GIAN QUẢNG CÁO RỘNG RÃI VÀ ĐA DẠNG:
Chúng tôi cung cấp nhiều vị trí quảng cáo chiến lược, bao gồm các bảng hiệu lớn tại mặt tiền chợ, các gian hàng bên trong chợ, cũng như các điểm quảng cáo khác. Những vị trí này không chỉ có khả năng tiếp cận cao mà còn đảm bảo thương hiệu của Quý Doanh Nghiệp luôn xuất hiện trong tầm nhìn của khách hàng.

- ĐỘ TIN CẬY VÀ UY TÍN:
Chợ Long Hoa là một chợ có tuổi thọ lâu đời, tất cả tiểu thương và hàng hóa kinh doanh ở đây đều rất có uy tín tại Tây Ninh. Việc xuất hiện tại đây sẽ nâng cao giá trị và sự tin tưởng của khách hàng đối với thương hiệu của Quý Doanh Nghiệp.

- CƠ HỘI KHÔNG THỂ BỎ LỠ:
Quý Doanh Nghiệp hãy nhanh chóng nắm bắt cơ hội để đặt quảng cáo tại các vị trí đắc địa của Chợ Long Hoa. Với mức chi phí hợp lý và lợi ích truyền thông vượt trội, đây là khoản đầu tư xứng đáng cho sự phát triển thương hiệu và gia tăng doanh số.

Hãy liên hệ ngay với chúng tôi để được tư vấn chi tiết về các gói quảng cáo và nhận ưu đãi đặc biệt khi đăng ký sớm!

Trân trọng,`,
      images: [
        "https://quangcaotayninh.com.vn/wp-content/uploads/2024/08/quang-cao-cho-long-hoa-scaled.jpg",
        "https://quangcaotayninh.com.vn/wp-content/uploads/2024/08/cho-thue-quang-cao-cho-long-hoa-768x375.jpg",
        "https://quangcaotayninh.com.vn/wp-content/uploads/2024/08/mat-tien-cho-long-hoa-768x576.jpg",
        "https://quangcaotayninh.com.vn/wp-content/uploads/2024/08/trung-tam-thuong-mai-long-hoa-768x575.jpg",
        "https://quangcaotayninh.com.vn/wp-content/uploads/2024/08/cho-long-hoa-768x575.jpg",
      ],
      features: [
        "Vị trí đắc địa tại trung tâm thương mại",
        "Thiết kế độc đáo, ấn tượng",
        "Chất liệu cao cấp, bền bỉ",
        "Lắp đặt chuyên nghiệp",
        "Bảo hành dài hạn",
        "Hỗ trợ 24/7",
      ],
      process: [
        {
          step: 1,
          title: "Tư vấn & Khảo sát",
          desc: "Đội ngũ chuyên gia sẽ tư vấn và khảo sát vị trí lắp đặt phù hợp nhất",
        },
        {
          step: 2,
          title: "Thiết kế & Duyệt mẫu",
          desc: "Thiết kế độc đáo theo yêu cầu và duyệt mẫu với khách hàng",
        },
        {
          step: 3,
          title: "Sản xuất & Kiểm tra",
          desc: "Sản xuất theo tiêu chuẩn cao và kiểm tra chất lượng nghiêm ngặt",
        },
        {
          step: 4,
          title: "Lắp đặt & Bàn giao",
          desc: "Lắp đặt chuyên nghiệp và bàn giao đúng tiến độ",
        },
      ],
      pricing: {
        basic: {
          name: "Gói Cơ Bản",
          price: "5.000.000",
          features: [
            "Biển quảng cáo cơ bản",
            "Thiết kế đơn giản",
            "Bảo hành 12 tháng",
          ],
        },
        standard: {
          name: "Gói Tiêu Chuẩn",
          price: "8.000.000",
          features: [
            "Biển quảng cáo nâng cao",
            "Thiết kế độc đáo",
            "Bảo hành 24 tháng",
            "Hỗ trợ bảo trì",
          ],
        },
        premium: {
          name: "Gói Cao Cấp",
          price: "12.000.000",
          features: [
            "Biển quảng cáo cao cấp",
            "Thiết kế độc quyền",
            "Bảo hành 36 tháng",
            "Hỗ trợ 24/7",
            "Tư vấn marketing",
          ],
        },
      },
      testimonials: [
        {
          name: "Nguyễn Văn A",
          position: "Giám đốc Công ty ABC",
          content:
            "Dịch vụ rất chuyên nghiệp, đội ngũ nhân viên nhiệt tình và tận tâm. Chúng tôi rất hài lòng với kết quả đạt được.",
          rating: 5,
        },
        {
          name: "Trần Thị B",
          position: "Chủ cửa hàng XYZ",
          content:
            "Biển quảng cáo được thiết kế đẹp mắt, chất lượng cao. Khách hàng rất ấn tượng với thiết kế độc đáo.",
          rating: 5,
        },
      ],
    },
    "thiet-ke-thi-cong-phong-karaoke-tai-tay-ninh": {
      title: "Thiết kế, thi công Phòng Karaoke tại Tây Ninh",
      shortDesc: "Thiết kế và thi công phòng karaoke chuyên nghiệp",
      fullDesc: `Để thiết kế và thi công 1 phòng karaoke hoàn chỉnh bạn phải làm các phần như sau: – Thiết kế 2D 3D – Xây dựng phần thô. – Hoàn thiện cách âm. – Hệ thống PCCC. – Hệ thống thông khí. – Hoàn thiện nội thất: trang trí, sân khấu, tường, vách, trần, sàn…. – Máy móc thiết bị.

Chúng tôi cam kết mang đến cho bạn:
- Thiết kế độc đáo, phù hợp với không gian
- Chất lượng thi công cao cấp
- Hệ thống âm thanh chuyên nghiệp
- Bảo hành và hậu mãi tốt nhất`,
      images: [
        "https://quangcaotayninh.com.vn/wp-content/uploads/2022/06/lam-phong-karaoke-kinh-doanh-3-360x240.jpg",
        "https://images.unsplash.com/photo-1581287053822-fd7bf4f4bfec?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1530099486328-e021101a494a?auto=format&fit=crop&q=80&w=800",
      ],
      features: [
        "Thiết kế 2D/3D chuyên nghiệp",
        "Thi công cách âm hiệu quả",
        "Hệ thống PCCC đạt chuẩn",
        "Âm thanh chất lượng cao",
        "Nội thất sang trọng",
        "Bảo hành dài hạn",
      ],
      process: [
        {
          step: 1,
          title: "Khảo sát & Tư vấn",
          desc: "Khảo sát không gian và tư vấn giải pháp thiết kế phù hợp",
        },
        {
          step: 2,
          title: "Thiết kế chi tiết",
          desc: "Thiết kế 2D/3D chi tiết và duyệt mẫu với khách hàng",
        },
        {
          step: 3,
          title: "Thi công chuyên nghiệp",
          desc: "Thi công theo tiêu chuẩn cao với đội ngũ lành nghề",
        },
        {
          step: 4,
          title: "Nghiệm thu & Bàn giao",
          desc: "Nghiệm thu chất lượng và bàn giao đúng tiến độ",
        },
      ],
      pricing: {
        basic: {
          name: "Gói Cơ Bản",
          price: "50.000.000",
          features: [
            "Thiết kế cơ bản",
            "Thi công phần thô",
            "Bảo hành 12 tháng",
          ],
        },
        standard: {
          name: "Gói Tiêu Chuẩn",
          price: "80.000.000",
          features: [
            "Thiết kế nâng cao",
            "Thi công hoàn thiện",
            "Âm thanh chất lượng",
            "Bảo hành 24 tháng",
          ],
        },
        premium: {
          name: "Gói Cao Cấp",
          price: "120.000.000",
          features: [
            "Thiết kế độc quyền",
            "Thi công cao cấp",
            "Âm thanh chuyên nghiệp",
            "Nội thất sang trọng",
            "Bảo hành 36 tháng",
          ],
        },
      },
      testimonials: [
        {
          name: "Lê Văn C",
          position: "Chủ phòng karaoke",
          content:
            "Phòng karaoke được thiết kế rất đẹp và chuyên nghiệp. Âm thanh chất lượng cao, khách hàng rất hài lòng.",
          rating: 5,
        },
      ],
    },
    "sua-chua-man-hinh-led-tai-tay-ninh": {
      title: "Sửa chữa màn hình LED tại Tây Ninh",
      shortDesc: "Dịch vụ sửa chữa màn hình LED chuyên nghiệp",
      fullDesc: `Công ty CP Tập đoàn Song Tạo tự hào là đơn vị duy nhất đến thời điểm hiện tại, thi công và sửa chữa màn hình LED tại Tây Ninh. 
      
      Thị trường màn hình LED rất đa dạng, có rất nhiều quy chuẩn như: thông số kĩ thuật, tần số quét, kích thước tấm LED, loại led và nhà sản xuất LED cũng nhiều không kém, vì thế mà mỗi thời điểm, mỗi đơn vị thi công bảng LED họ lại dùng một loại LED khác nhau,chính vì vậy, việc sửa chữa bảng LED cũ, đặt ra một thách thức không nhỏ đối với bất kì người thợ quảng cáo nào.
      - Tuổi thọ bảng LED bao nhiêu năm?

Tuổi thọ bảng LED bị ảnh hưởng bởi rất nhiều yếu tố như: thời gian bật / tắt, vị trí gắn trong nhà hay ngoài trời, vùng gắn có gần biển/ sương mù/ chịu mưa nhiều trong năm hay không…. Thông thường sau khoảng 3 năm, bảng LED bị giảm độ sáng xuống tầm 10%, sau 5 năm thì giảm tầm 30% và sau 7 năm thì độ sáng bảng LED chỉ còn khoảng 50% so với ban đầu. Lúc đó là lúc chúng ta nên thay bảng LED khác để đảm bảo mỹ quan đô thị và tiết kiệm điện năng.
- Các lỗi hay xuất hiện trên bảng LED là lỗi gì?

Bảng LED thường không hư toàn bộ bảng, mà bị hư một phần hoặc một linh kiện nhỏ mà thôi. Nhưng biểu hiện của các lỗi đó ra màn hình LED rất giống nhau: tắt một phần màn hình, bị sọc, bị chớp liên tục một vài module, chỉ hiển thị được 1 màu trên module….., nên đòi hỏi người kĩ thuật phải biết đọc lỗi module hay card hay nguồn hoặc dây tín hiệu… để chuẩn đoán và thay thế linh kiện chính xác nhất.
- Tìm đơn vị sửa chữa màn hình LED tại Tây Ninh ở đâu?

Với kinh nghiệm >6 năm trong nghề thi công màn hình LED, chúng tôi tự tin là đơn vị duy nhất đã thi công rất nhiều màn hình LED tại Tây Ninh, như màn hình P10 kích thước 3 x 6m tại ngã tư CMT8, Lê Lợi, màn hình P5, kích thước 3 x 8m tại ngã tư Cửa Hòa Viện,… Đồng thời chúng tôi đã sửa chữa rất nhiều màn hình như: Biển quảng cáo LED 3 x 5m tại cửa khẩu quốc tế Mộc Bài, màn hình 4 x 6m tại chân Núi Bà Đen…..

Nếu bảng LED của bạn nhỏ (<10m2) thì chúng tôi sẵn sàng khảo sát, báo giá, và sửa chữa hoàn thiện trước, khi bảng đã chạy 100% thì bạn mới phải thanh toán cho chúng tôi. Đặc biệt hơn nữa, đối với bảng LED trong địa phận Tây Ninh, chúng tôi có dịch vụ sửa chữa nhanh, trong vòng 12h kể từ khi tiếp nhận, để đảm bảo downtime của bảng LED là thấp nhất.

Khi bảng LED của bạn gặp sự cố, hãy liên hệ ngay với chúng tôi theo Hotline: 089.9999.456 (mr Quá).


      `,
      images: [
        "https://quangcaotayninh.com.vn/wp-content/uploads/2022/02/sua-bang-led.jpg",
        "https://www.banghieuquangcaock.com/upload/images/sua-chua-bang-led-khong-sang-den-gia-re.jpg",
        "https://quangcaoktd.com/wp-content/uploads/2024/06/du-an-thi-cong-bien-quang-cao-quan-ha-dong-6.jpg",
      ],
      features: [
        "Đội ngũ kỹ thuật chuyên nghiệp",
        "Phụ kiện chính hãng",
        "Bảo hành uy tín",
        "Sửa chữa nhanh chóng",
        "Giá cả hợp lý",
        "Hỗ trợ 24/7",
      ],
      process: [
        {
          step: 1,
          title: "Kiểm tra & Chẩn đoán",
          desc: "Kiểm tra và chẩn đoán chính xác lỗi màn hình LED",
        },
        {
          step: 2,
          title: "Báo giá & Thống nhất",
          desc: "Báo giá chi tiết và thống nhất với khách hàng",
        },
        {
          step: 3,
          title: "Sửa chữa & Thay thế",
          desc: "Sửa chữa và thay thế phụ kiện chất lượng cao",
        },
        {
          step: 4,
          title: "Kiểm tra & Bàn giao",
          desc: "Kiểm tra hoạt động và bàn giao cho khách hàng",
        },
      ],
      pricing: {
        basic: {
          name: "Sửa chữa cơ bản",
          price: "500.000",
          features: [
            "Kiểm tra miễn phí",
            "Sửa chữa lỗi nhỏ",
            "Bảo hành 3 tháng",
          ],
        },
        standard: {
          name: "Sửa chữa nâng cao",
          price: "1.500.000",
          features: [
            "Thay thế phụ kiện",
            "Cân chỉnh màu sắc",
            "Bảo hành 6 tháng",
          ],
        },
        premium: {
          name: "Bảo trì toàn diện",
          price: "3.000.000",
          features: [
            "Bảo trì định kỳ",
            "Thay thế toàn bộ",
            "Bảo hành 12 tháng",
            "Hỗ trợ 24/7",
          ],
        },
      },
      testimonials: [
        {
          name: "Phạm Văn D",
          position: "Quản lý trung tâm thương mại",
          content:
            "Dịch vụ sửa chữa màn hình LED rất chuyên nghiệp, nhanh chóng và hiệu quả. Đội ngũ kỹ thuật tay nghề cao.",
          rating: 5,
        },
      ],
    },
    "cho-thue-quang-cao-tai-tay-ninh": {
      title: "Cho thuê quảng cáo tại Tây Ninh",
      shortDesc: "Dịch vụ cho thuê vị trí quảng cáo chất lượng cao",
      fullDesc: `Cho thuê quảng cáo tại Tây Ninh
Quảng cáo pano khổ lớn là một trong những cách quảng cáo truyền thống, được áp dụng từ rất lâu tại Việt Nam. Ưu điểm của quảng cáo trên pano khổ lớn (hoặc tên gọi khác là billboard khổ lớn) là có rất nhiều lượt xem trực tiếp tại nơi quảng cáo. Như vậy điểm mấu chốt để một chiến dịch quảng cáo pa nô khổ lớn thành công chính là vị trí đặt biển quảng cáo này.

Công ty CP Tập đoàn Song Tạo đang là đơn vị khai thác độc quyền quảng cáo ngoài trời tại 2 địa điểm là Chợ Long Hoa Tây Ninh và Cửa hòa viện (Tòa thánh Tây Ninh). Mỗi địa điểm có một đặc tính khác nhau về số lượng người xem, thuộc tính người xem, cụ thể như sau:
Tại Chợ Long Hoa Tây Ninh – đây là ngôi chợ có truyền thống lâu đời nhất của tỉnh Tây Ninh bắt đầu được thành lập cùng thời điểm với đạo Cao Đài. Ngôi chợ có kiến trúc truyền thống với 8 cửa chợ, bao bọc xung quanh đêu là những con đường sầm uất, đối diện mỗi cửa chợ đều là một con đường lớn, trên các con đường lớn xung quanh chợ có rất nhiều ngân hàng, bệnh viện, trường học, cơ quan chính quyền,…  Vì thế lưu lượng xe cộ xung quanh chợ rất cao.

Đồng thời, ngôi chợ này cũng là chợ bán sỉ lớn nhất Tây Ninh, hầu hết các mặt hàng đang được phân phối trong tỉnh đều xuất phát từ các tiểu thương bán sỉ trong nhà lồng chợ. Bất cứ khách hàng dự định mua gì, đến Chợ Long Hoa cũng có.

Chợ Long Hoa cũng là một điểm dừng chân không thể không ghé qua của khách du lịch, vì nơi đây tập trung bán rất nhiều đặc sản địa phương của Tây Ninh. Lúc cao điểm du lịch (như đại lễ Hội yến Diêu Trì cung), thì lượng khách du lịch đến chợ gần 100.000 lượt khách/ ngày.

Dùng phương pháp khảo sát và đo đếm, thống kê, chúng tôi tự tin rằng lượng traffic có thể thấy quảng cáo của bạn ở các cổng chợ trung bình là > 10,000 lượt/ngày.
Còn ở vị trí Cửa Hoà Viện – Toà Thánh Tây Ninh thì sao? Toà Thánh Tây Ninh là công trình đầu não của Đạo Cao Đài (một tôn giáo lớn nhất do người Việt Nam lập ra), về yếu tố tâm linh thì Toà Thánh Tây Ninh linh thiêng như Thủ phủ Vatican của Đạo Thiên Chúa hoặc Nepal của Phật Giáo.

Lượng khách du lịch đến than quan Toà Thánh Tây Ninh khoảng 4 triệu người mỗi năm (theo số liệu của Hội Thánh) và đang có xu hướng tăng lên do Công trình Tượng phật đồng cao nhất Việt Nam đang được xây dựng tại Tây Ninh. Điểm đặc biệt của vị trí quảng cáo này là nằm ngay góc ngã tư, trước cửa hoà viện, và hướng bảng quảng cáo thẳng vào Toà Thánh. Cửa Hoà viện là một cửa chính, gần Toà Thánh trung tâm nhất, nên luôn được chọn là cổng đón tiếp khách du lịch.
Công ty chúng tôi sở hữu và khai thác độc quyền vị trí quảng cáo này với các vị trí quảng cáo cụ thể sau:

+ 01 bảng căng bạt nằm ở đường CMT8 kích thước 4 x 4 m: góc nhìn rõ nhất là người tham gia giao thông trên đường CMT8 và du khách bên trong Nội Ô Toà Thánh.

+ 01 bảng led 3m x 8m đặt ngay khúc cong, nằm trọn góc ngã tư. Người tham gia giao thông từ cả 3 hướng đều có thể thấy videos clip của bạn rất rõ.

+ 02 bảng bạt 4 m x 6m có thể nối dài thành 4m x 12m nằm dọc theo đường Điện Biên Phủ. Điều đặc biệt của biển bạt này là nằm đối diện trung tâm giới thiệu việc làm, sở lao động tnxh tỉnh Tây Ninh. Vị trí này cực kì hiệu quả cho các doanh nghiệp cần tuyển dụng / giới thiệu dạy nghề.`,
      images: [
        "https://quangcaotayninh.com.vn/wp-content/uploads/2020/10/vi-tri-quang-cao-cua-hoa-vien-tay-ninh.png",
        "https://quangcaotayninh.com.vn/wp-content/uploads/2020/10/cho-thue-mb-cho-long-hoa-tay-ninh-768x576.png",
        "https://quangcaotayninh.com.vn/wp-content/uploads/2020/10/vi-tri-quang-cao-cua-hoa-vien-tay-ninh.png",
      ],
      features: [
        "Vị trí đắc địa",
        "Lượt xem cao",
        "Thiết kế chuyên nghiệp",
        "Lắp đặt nhanh chóng",
        "Bảo trì định kỳ",
        "Báo cáo hiệu quả",
      ],
      process: [
        {
          step: 1,
          title: "Chọn vị trí",
          desc: "Tư vấn và chọn vị trí quảng cáo phù hợp nhất",
        },
        {
          step: 2,
          title: "Thiết kế nội dung",
          desc: "Thiết kế nội dung quảng cáo theo yêu cầu",
        },
        {
          step: 3,
          title: "Lắp đặt & Vận hành",
          desc: "Lắp đặt và vận hành quảng cáo",
        },
        {
          step: 4,
          title: "Theo dõi & Báo cáo",
          desc: "Theo dõi hiệu quả và báo cáo định kỳ",
        },
      ],
      pricing: {
        basic: {
          name: "Gói 1 tháng",
          price: "2.000.000",
          features: [
            "Vị trí cơ bản",
            "Thiết kế đơn giản",
            "Báo cáo hàng tháng",
          ],
        },
        standard: {
          name: "Gói 3 tháng",
          price: "5.000.000",
          features: [
            "Vị trí tốt",
            "Thiết kế nâng cao",
            "Báo cáo chi tiết",
            "Giảm giá 15%",
          ],
        },
        premium: {
          name: "Gói 6 tháng",
          price: "8.000.000",
          features: [
            "Vị trí đắc địa",
            "Thiết kế độc quyền",
            "Báo cáo realtime",
            "Giảm giá 30%",
          ],
        },
      },
      testimonials: [
        {
          name: "Hoàng Văn E",
          position: "Giám đốc Marketing",
          content:
            "Hiệu quả quảng cáo rất tốt, lượt xem cao và chi phí hợp lý. Dịch vụ chuyên nghiệp.",
          rating: 5,
        },
      ],
    },
    "sua-chua-bien-hieu-tai-tay-ninh": {
      title: "Sửa chữa biển hiệu tại Tây Ninh",
      shortDesc: "Dịch vụ sửa chữa biển hiệu nhanh chóng, chất lượng",
      fullDesc: `Sửa chữa biển hiệu tại tây ninh
Khi biển hiệu bạn bị hư, bong tróc alu, rách bạt, hoặc bảng LED bị đứt, chớp giật,… thì sẽ làm xấu đi hình ảnh của cửa hàng kinh doanh của bạn. Việc thay biển hiệu mới thì lại tốn tiền. Giải pháp chính là sử dụng dịch vụ sửa chữa biển hiệu của chúng tôi,

Quảng cáo Song Tạo tại Tây Ninh sẵn sàng giúp bạn sửa biển hiệu lại như mới, với chi phí hợp lý nhất.
SỬA CHỮA BIỂN HIỆU TẠI TÂY NINH Ở ĐÂU?
Ưu điểm của việc sửa chữa, tận dụng biển hiệu cũ là chi phí thấp hơn, thời gian làm nhanh hơn, tuy nhiên khuyết điểm của việc sửa chữa biển hiệu cũ là dù thợ thi công kỹ thế nào đi nữa cũng không thể khắc phục hết 100% khuyết điểm được. Ví dụ như bảng alu, khi thợ thi công quảng cáo gỡ chữ mica khỏi bảng alu đó, thì sẽ để lại dấu chân chữ, không thể nào cùng màu với lớp alu được. Đối với bạt mica, khi tận dụng mica cũ, lúc gỡ decal ra sẽ để lại vệt keo rất nhiều.
Nếu bạn phân vân, không biết làm biển hiệu tốn bao nhiêu tiền? thì hãy liên hệ với chúng tôi để có giá tốt nhất.
Tại Tây Ninh, Công ty CP Tập đoàn Song Tạo tự tin về năng lực thi công của mình để có thể thực hiện được tất cả yêu cầu của bạn. Vui lòng xem phần giới thiệu về chúng tôi tại đây. Hoặc bạn có thể gửi yêu cầu báo giá nhanh vào khung bên phải, nhân viên sẽ liên hệ với bạn trong vòng 4h làm việc.
`,
      images: [
        "https://quangcaotayninh.com.vn/wp-content/uploads/2020/08/sua-chua-bang-hieu-scaled.jpg",
      ],
      features: [
        "Sửa chữa nhanh chóng",
        "Chất liệu chính hãng",
        "Kỹ thuật chuyên nghiệp",
        "Giá cả hợp lý",
        "Bảo hành uy tín",
        "Hỗ trợ 24/7",
      ],
      process: [
        {
          step: 1,
          title: "Khảo sát & Đánh giá",
          desc: "Khảo sát tình trạng biển hiệu và đánh giá mức độ hư hỏng",
        },
        {
          step: 2,
          title: "Báo giá & Thống nhất",
          desc: "Báo giá chi tiết và thống nhất phương án sửa chữa",
        },
        {
          step: 3,
          title: "Sửa chữa & Hoàn thiện",
          desc: "Sửa chữa và hoàn thiện biển hiệu theo tiêu chuẩn",
        },
        {
          step: 4,
          title: "Kiểm tra & Bàn giao",
          desc: "Kiểm tra chất lượng và bàn giao cho khách hàng",
        },
      ],
      pricing: {
        basic: {
          name: "Sửa chữa nhỏ",
          price: "300.000",
          features: [
            "Sửa chữa lỗi nhỏ",
            "Thay thế phụ kiện",
            "Bảo hành 3 tháng",
          ],
        },
        standard: {
          name: "Sửa chữa vừa",
          price: "800.000",
          features: [
            "Sửa chữa lỗi vừa",
            "Thay thế bộ phận",
            "Bảo hành 6 tháng",
          ],
        },
        premium: {
          name: "Sửa chữa lớn",
          price: "1.500.000",
          features: [
            "Sửa chữa toàn bộ",
            "Thay thế hoàn toàn",
            "Bảo hành 12 tháng",
          ],
        },
      },
      testimonials: [
        {
          name: "Ngô Thị F",
          position: "Chủ cửa hàng",
          content:
            "Biển hiệu được sửa chữa rất đẹp, như mới. Dịch vụ nhanh chóng và chuyên nghiệp.",
          rating: 5,
        },
      ],
    },
    "thiet-ke-bo-nhan-dien-thuong-hieu": {
      title: "Thiết kế bộ nhận diện thương hiệu",
      shortDesc: "Thiết kế bộ nhận diện thương hiệu chuyên nghiệp",
      fullDesc: `Khi bạn bắt đầu kinh doanh, việc đầu tiên cần làm chính là thiết kế bộ nhận diện thương hiệu, vậy bộ nhận diện thương hiệu là gì, gồm những chi tiết gì, thiết kế một bộ nhận diện thương hiệu đẹp là như thế nào, chi phí thiết kế bao nhiêu,… sẽ được giải thích rõ trong bài viết này.

1. Bộ nhận diện thương hiệu là gì: đó là một bộ các hình ảnh có tính tương đồng, gợi nhớ và lặp đi lặp lại để khách hàng nhận diện thương hiệu dễ dàng giữa rất nhiều thương hiệu khác. => Như vậy, yêu cầu của một bộ nhận diện thương hiệu là phải độc đáo, đồng bộ và liên quan đến lĩnh vực hoạt động của công ty.
2. Bộ nhận diện thương hiệu bao gồm: tên công ty, logo công ty, slogan và một màu chủ đạo. Bộ 3 này sẽ được dùng để thiết kế các sản phẩm thực tế như: cardvisit, folder (bìa gấp), headline (dong tiêu đề in sẵn trên các trang a4, túi xách, bìa thư, catalogue giới thiệu sản phẩm, bao bì sản phẩm, biển hiệu công ty, biển hiệu tài trợ, decal dán xe, banner đứng, áo thun, dù, booth bán hàng,… website,…
3. Chi phí thiết kế một bộ nhận diện thương hiệu: tùy theo từng yêu cầu của khách và từng lĩnh vực cụ thể, sẽ có chi phí thiết kế khác nhau, Ví dụ: một quán cơm thì khách cần thiết kế để làm biển hiệu, trang trí trong quán theo đúng tông màu, in lên hộp cơm, in bao đũa, đôi khi còn in decal lên thùng giao hàng,… thì chi phí thiết kế rơi vào khoảng 200.000 đ. Một quán cafe lưu động cần thiết kế, trang trí xe cafe lưu động, thiết kế bán ghế để đóng riêng, có thể xếp gọn được, thiết kế phần nội thất để vừa đẹp vừa tiết kiệm không gian nhất, thiết kế logo, slogan, bộ màu để in trên ly, túi nylon, áo thun nhân viên… thì chi phí thiết kế có thể lên đến 3.000.000 đ.
Ở Tây Ninh, chọn đơn vị thiết kế bộ nhận diện thương hiệu ở đâu? Quảng cáo Song Tạo với 4 nhân viên thiết kết, tự tin có thể đảm nhận những đơn hàng thiết kế gấp nhất, đưa ra nhiều phương án / nhiều ý tưởng cho bộ nhận diện thương hiệu của bạn.`,
      images: [
        "https://quangcaotayninh.com.vn/wp-content/uploads/2020/08/bo-nhan-dien-thuong-hieu-scaled.jpg",
        "https://goldidea.vn/upload/project/Duan/Nguquynh/bientamlonngu-quynh.jpg",
        "https://achaumedia.vn/wp-content/uploads/2019/10/quang-cao-man-hinh-led-ngoai-troi-hanoi-04.png",
      ],
      features: [
        "Logo độc đáo",
        "Bộ nhận diện hoàn chỉnh",
        "Thiết kế chuyên nghiệp",
        "Tư vấn chiến lược",
        "Bản quyền sở hữu",
        "Hỗ trợ chỉnh sửa",
      ],
      process: [
        {
          step: 1,
          title: "Tư vấn & Nghiên cứu",
          desc: "Tư vấn và nghiên cứu thị trường, đối thủ cạnh tranh",
        },
        {
          step: 2,
          title: "Thiết kế & Phát triển",
          desc: "Thiết kế và phát triển các phương án logo",
        },
        {
          step: 3,
          title: "Chỉnh sửa & Hoàn thiện",
          desc: "Chỉnh sửa theo feedback và hoàn thiện bộ nhận diện",
        },
        {
          step: 4,
          title: "Bàn giao & Hướng dẫn",
          desc: "Bàn giao file gốc và hướng dẫn sử dụng",
        },
      ],
      pricing: {
        basic: {
          name: "Gói Cơ Bản",
          price: "3.000.000",
          features: [
            "Logo cơ bản",
            "Business card",
            "Letterhead",
            "Bảo hành 6 tháng",
          ],
        },
        standard: {
          name: "Gói Tiêu Chuẩn",
          price: "8.000.000",
          features: [
            "Logo nâng cao",
            "Bộ nhận diện đầy đủ",
            "Tư vấn chiến lược",
            "Bảo hành 12 tháng",
          ],
        },
        premium: {
          name: "Gói Cao Cấp",
          price: "15.000.000",
          features: [
            "Logo độc quyền",
            "Bộ nhận diện hoàn chỉnh",
            "Tư vấn marketing",
            "Bảo hành vĩnh viễn",
          ],
        },
      },
      testimonials: [
        {
          name: "Đỗ Văn G",
          position: "Giám đốc Công ty",
          content:
            "Bộ nhận diện thương hiệu được thiết kế rất chuyên nghiệp và độc đáo. Khách hàng rất ấn tượng.",
          rating: 5,
        },
      ],
    },
  };

  const service = serviceData[id];

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold mb-4 text-red-600">
            Không tìm thấy dịch vụ!
          </h2>
          <Link
            to="/service"
            className="text-blue-600 flex items-center gap-2 hover:underline justify-center"
          >
            <FaArrowLeft /> Quay lại danh sách dịch vụ
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-20">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <Link
            to="/service"
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6 transition-colors"
          >
            <FaArrowLeft /> Quay lại danh sách dịch vụ
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {service.title}
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl">
              {service.shortDesc}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-8"
            >
              <Swiper
                spaceBetween={20}
                slidesPerView={1}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                loop={true}
                modules={[Autoplay]}
                className="w-full h-64 md:h-80 rounded-lg"
              >
                {service.images.map((image, index) => (
                  <SwiperSlide key={index}>
                    <img
                      src={image}
                      alt={`${service.title} - ${index + 1}`}
                      className="w-full h-64 md:h-80 object-cover rounded-lg"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </motion.section>

            {/* Tabs */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden mb-8"
            >
              <div className="border-b border-gray-200">
                <nav className="flex">
                  {[
                    { id: "overview", label: "Tổng quan" },
                    { id: "process", label: "Quy trình" },
                    { id: "pricing", label: "Bảng giá" },
                    { id: "testimonials", label: "Đánh giá" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-4 text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? "text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "overview" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-2xl font-bold mb-4">Mô tả chi tiết</h3>
                    <div className="prose max-w-none text-gray-600 leading-relaxed">
                      {service.fullDesc.split("\n").map((paragraph, index) => (
                        <p key={index} className="mb-4">
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    <h4 className="text-xl font-bold mt-8 mb-4">
                      Tính năng nổi bật
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {service.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <FaCheckCircle className="text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === "process" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-2xl font-bold mb-6">
                      Quy trình thực hiện
                    </h3>
                    <div className="space-y-6">
                      {service.process.map((step, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                            {step.step}
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold mb-2">
                              {step.title}
                            </h4>
                            <p className="text-gray-600">{step.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === "pricing" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-2xl font-bold mb-6">
                      Bảng giá dịch vụ
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {Object.entries(service.pricing).map(([key, plan]) => (
                        <div
                          key={key}
                          className={`border rounded-lg p-6 ${
                            key === "standard"
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200"
                          }`}
                        >
                          <h4 className="text-xl font-bold mb-2">
                            {plan.name}
                          </h4>
                          <div className="text-3xl font-bold text-blue-600 mb-4">
                            {plan.price} VNĐ
                          </div>
                          <ul className="space-y-2">
                            {plan.features.map((feature, index) => (
                              <li
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <FaCheckCircle className="text-green-500 text-sm" />
                                <span className="text-gray-600">{feature}</span>
                              </li>
                            ))}
                          </ul>
                          <button className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                            Chọn gói này
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === "testimonials" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-2xl font-bold mb-6">
                      Đánh giá từ khách hàng
                    </h3>
                    <div className="space-y-6">
                      {service.testimonials.map((testimonial, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-6">
                          <div className="flex items-center gap-2 mb-3">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <FaStar key={i} className="text-yellow-400" />
                            ))}
                          </div>
                          <p className="text-gray-700 mb-3 italic">
                            "{testimonial.content}"
                          </p>
                          <div>
                            <p className="font-semibold">{testimonial.name}</p>
                            <p className="text-gray-500 text-sm">
                              {testimonial.position}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Contact Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-6 sticky top-6"
            >
              <h3 className="text-xl font-bold mb-4">Liên hệ tư vấn</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FaPhone className="text-blue-600" />
                  <span className="text-gray-700">0899999456</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-blue-600" />
                  <span className="text-gray-700">
                    quangcaosongtao@gmail.com
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <FaMapMarkerAlt className="text-blue-600" />
                  <span className="text-gray-700">
                    623 Điện Biên Phủ, Ninh Thạnh Tp Tây Ninh, Tây Ninh
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <FaClock className="text-blue-600" />
                  <span className="text-gray-700">7:00 - 19:00</span>
                </div>
              </div>
              <button className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                Tư vấn miễn phí
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-xl font-bold mb-4">Thống kê</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaUsers className="text-blue-600" />
                    <span className="text-gray-700">Khách hàng</span>
                  </div>
                  <span className="font-bold text-blue-600">500+</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaAward className="text-blue-600" />
                    <span className="text-gray-700">Dự án</span>
                  </div>
                  <span className="font-bold text-blue-600">1000+</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaShieldAlt className="text-blue-600" />
                    <span className="text-gray-700">Bảo hành</span>
                  </div>
                  <span className="font-bold text-blue-600">24 tháng</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
