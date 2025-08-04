import React from "react";
import { motion } from "framer-motion";
import { CircularProgress } from "@mui/material";
import { FaRobot, FaClock } from "react-icons/fa";

const LivePreviewWaiting = ({
  stableDiffusionProgress,
  containerVariants,
  itemVariants,
}) => {
  return (
    <motion.div
      className="max-w-4xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h2
        className="text-3xl font-bold text-custom-dark mb-8 text-center"
        variants={itemVariants}
      >
        🎨 Live Preview - AI đang hoàn thiện thiết kế
      </motion.h2>

      {/* Live Preview Section */}
      {stableDiffusionProgress?.live_preview &&
      typeof stableDiffusionProgress.live_preview === "string" &&
      stableDiffusionProgress.live_preview.startsWith("data:image/") ? (
        <motion.div
          className="mb-8 p-6 bg-gradient-to-r from-orange-50 to-white border-2 border-orange-400 rounded-xl"
          variants={itemVariants}
        >
          <div className="text-center mb-6">
            <div className="mb-4 p-4 bg-gradient-to-r from-orange-100 to-orange-50 rounded-xl border-2 border-orange-400">
              <p className="text-2xl font-bold text-black mb-3 flex items-center justify-center">
                🎨{" "}
                <span className="ml-2">Live Preview - Ảnh đang được tạo</span>
              </p>
              <div className="flex justify-center items-center space-x-4 text-sm">
                <span className="bg-orange-500 text-white px-4 py-2 rounded-full font-medium">
                  📊 Tiến trình:{" "}
                  {((stableDiffusionProgress.progress || 0) * 100).toFixed(1)}%
                </span>
                {stableDiffusionProgress.eta && (
                  <span className="bg-black text-white px-4 py-2 rounded-full font-medium">
                    ⏱️ Còn lại: ~{Math.ceil(stableDiffusionProgress.eta)}s
                  </span>
                )}
                <span
                  className={`px-4 py-2 rounded-full font-medium ${
                    stableDiffusionProgress.active
                      ? "bg-orange-600 text-white"
                      : "bg-gray-500 text-white"
                  }`}
                >
                  {stableDiffusionProgress.active
                    ? "🚀 Đang xử lý"
                    : "⏸️ Tạm dừng"}
                </span>
              </div>
            </div>

            {/* Live Preview Image với animation đẹp */}
            <motion.div
              className="inline-block border-4 border-orange-400 rounded-xl p-4 bg-white shadow-2xl"
              animate={{
                borderColor: ["#fb923c", "#ea580c", "#000000", "#fb923c"],
                boxShadow: [
                  "0 15px 30px rgba(251, 146, 60, 0.3)",
                  "0 25px 50px rgba(234, 88, 12, 0.4)",
                  "0 30px 60px rgba(0, 0, 0, 0.2)",
                  "0 15px 30px rgba(251, 146, 60, 0.3)",
                ],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <motion.img
                key={stableDiffusionProgress.live_preview} // Re-render khi ảnh thay đổi
                src={stableDiffusionProgress.live_preview}
                alt="Live Preview - AI đang tạo ảnh"
                className="max-w-2xl mx-auto rounded-lg shadow-lg"
                style={{
                  maxHeight: "500px",
                  maxWidth: "100%",
                  height: "auto",
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                onLoad={() =>
                  console.log("🖼️ Live preview loaded successfully")
                }
                onError={(e) => {
                  console.error("❌ Live preview failed to load:", e);
                }}
              />
            </motion.div>

            {/* Status text với animation */}
            <div className="mt-6 flex justify-center items-center space-x-3">
              <motion.div
                className="w-3 h-3 bg-orange-500 rounded-full"
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <p className="text-xl text-black font-bold">
                🔄 Đây là ảnh tạm thời - AI đang hoàn thiện ảnh chất lượng
                cao...
              </p>
              <motion.div
                className="w-3 h-3 bg-black rounded-full"
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }}
              />
            </div>

            {/* Additional info */}
            <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-300">
              <p className="text-sm text-black italic font-medium">
                💡 <strong>Thông tin:</strong> Đây là ảnh xem trước trong quá
                trình tạo. Ảnh cuối cùng sẽ có chất lượng cao hơn và chi tiết
                hơn!
              </p>
              {stableDiffusionProgress.textinfo && (
                <p className="text-sm text-orange-800 mt-2">
                  📝 <strong>Trạng thái:</strong>{" "}
                  {stableDiffusionProgress.textinfo}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="mb-8 p-8 bg-orange-50 border border-orange-300 rounded-lg text-center"
          variants={itemVariants}
        >
          <div className="flex justify-center items-center mb-6">
            <FaRobot className="text-orange-500 text-4xl mr-4" />
            <CircularProgress size={40} sx={{ color: "#ea580c" }} />
          </div>
          <h3 className="text-xl font-semibold text-black mb-3">
            AI đang khởi tạo live preview...
          </h3>
          <p className="text-gray-700">
            Live preview sẽ xuất hiện trong giây lát để bạn có thể theo dõi quá
            trình tạo ảnh.
          </p>
        </motion.div>
      )}

      {/* Progress Information */}
      <motion.div
        className="mb-8 p-6 bg-white border-2 border-orange-300 rounded-lg"
        variants={itemVariants}
      >
        <div className="flex items-center justify-center mb-4">
          <FaClock className="text-orange-500 text-xl mr-3" />
          <h3 className="text-lg font-semibold text-black">
            Thông tin tiến trình
          </h3>
        </div>

        {stableDiffusionProgress && (
          <div className="space-y-3">
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-orange-500 to-black h-4 rounded-full transition-all duration-500 flex items-center justify-center"
                style={{
                  width: `${(stableDiffusionProgress.progress || 0) * 100}%`,
                }}
              >
                <span className="text-white text-xs font-medium">
                  {((stableDiffusionProgress.progress || 0) * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Status indicators */}
            <div className="flex justify-center space-x-6 text-sm">
              <div className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    stableDiffusionProgress.active
                      ? "bg-orange-500 animate-pulse"
                      : "bg-gray-300"
                  }`}
                ></div>
                <span
                  className={
                    stableDiffusionProgress.active
                      ? "text-orange-600 font-medium"
                      : "text-gray-500"
                  }
                >
                  {stableDiffusionProgress.active
                    ? "🚀 Đang xử lý"
                    : "⏸️ Tạm dừng"}
                </span>
              </div>
              <div className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    stableDiffusionProgress.queued
                      ? "bg-black animate-pulse"
                      : "bg-gray-300"
                  }`}
                ></div>
                <span
                  className={
                    stableDiffusionProgress.queued
                      ? "text-black font-medium"
                      : "text-gray-500"
                  }
                >
                  {stableDiffusionProgress.queued
                    ? "⏳ Trong hàng đợi"
                    : "❌ Không trong hàng đợi"}
                </span>
              </div>
              <div className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    stableDiffusionProgress.completed
                      ? "bg-orange-600"
                      : "bg-gray-300"
                  }`}
                ></div>
                <span
                  className={
                    stableDiffusionProgress.completed
                      ? "text-orange-600 font-medium"
                      : "text-gray-500"
                  }
                >
                  {stableDiffusionProgress.completed
                    ? "✅ Hoàn thành"
                    : "⏳ Chưa hoàn thành"}
                </span>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Waiting message */}
      <motion.div
        className="text-center p-6 bg-gradient-to-r from-orange-50 to-white rounded-lg border border-orange-300"
        variants={itemVariants}
      >
        <p className="text-lg text-black mb-2">
          ⏳ <strong>Vui lòng chờ trong giây lát...</strong>
        </p>
        <p className="text-sm text-gray-700">
          AI đang hoàn thiện ảnh cuối cùng với chất lượng cao nhất. Khi hoàn
          thành, bạn sẽ được chuyển tự động để xem ảnh hoàn chỉnh.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default LivePreviewWaiting;
