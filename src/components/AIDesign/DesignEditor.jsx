import React from "react";
import { motion } from "framer-motion";
import { CircularProgress } from "@mui/material";
import {
  FaFont,
  FaPalette,
  FaPlus,
  FaTrash,
  FaBold,
  FaItalic,
  FaUnderline,
  FaCheck,
} from "react-icons/fa";

const DesignEditor = ({
  selectedBackgroundForCanvas,
  businessPresets,
  s3Logo,
  addBusinessInfoToCanvas,
  addText,
  setShowIconPicker,
  icons,
  loadIcons,
  handleImageUpload,
  deleteSelectedObject,
  fabricCanvas,
  canvasRef,
  selectedText,
  textSettings,
  updateTextProperty,
  fonts,
  customerNote,
  setCustomerNote,
  setCurrentStep,
  generatedImage,
  setFabricCanvas,
  exportDesign,
  isExporting,
  handleConfirm,
  currentAIDesign,
  isOrdering,
  containerVariants,
  itemVariants,
  pixelValueData,
}) => {
  return (
    <motion.div
      className="max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h2
        className="text-3xl font-bold text-custom-dark mb-8 text-center"
        variants={itemVariants}
      >
        {selectedBackgroundForCanvas
          ? "Chỉnh sửa thiết kế với Background"
          : "Chỉnh sửa thiết kế AI"}
      </motion.h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Business Info Panel - Bên trái - giảm xuống còn 2 cột */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h3 className="text-xl font-semibold mb-4">
              Thông tin doanh nghiệp
            </h3>

            <div className="space-y-4">
              {/* Company Name */}
              {businessPresets.companyName && (
                <div
                  className="p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all"
                  onClick={() =>
                    addBusinessInfoToCanvas(
                      "companyName",
                      businessPresets.companyName
                    )
                  }
                >
                  <div className="flex items-center mb-1">
                    <FaFont className="text-blue-500 mr-2" />
                    <span className="text-sm font-medium text-gray-600">
                      Tên công ty
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {businessPresets.companyName}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Nhấn để thêm vào thiết kế
                  </p>
                </div>
              )}

              {/* Address */}
              {businessPresets.address && (
                <div
                  className="p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-green-50 hover:border-green-300 transition-all"
                  onClick={() =>
                    addBusinessInfoToCanvas("address", businessPresets.address)
                  }
                >
                  <div className="flex items-center mb-1">
                    <FaFont className="text-green-500 mr-2" />
                    <span className="text-sm font-medium text-gray-600">
                      Address
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 truncate">
                    {businessPresets.address}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Nhấn để thêm vào thiết kế
                  </p>
                </div>
              )}

              {/* Contact Info */}
              {businessPresets.contactInfo && (
                <div
                  className="p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-orange-50 hover:border-orange-300 transition-all"
                  onClick={() =>
                    addBusinessInfoToCanvas(
                      "contactInfo",
                      businessPresets.contactInfo
                    )
                  }
                >
                  <div className="flex items-center mb-1">
                    <FaFont className="text-orange-500 mr-2" />
                    <span className="text-sm font-medium text-gray-600">
                      Liên hệ
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 truncate">
                    {businessPresets.contactInfo}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Nhấn để thêm vào thiết kế
                  </p>
                </div>
              )}

              {/* Logo */}
              {businessPresets.logoUrl && (
                <div
                  className="p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-all"
                  onClick={() =>
                    addBusinessInfoToCanvas(
                      "logoUrl",
                      s3Logo || businessPresets.logoUrl
                    )
                  }
                >
                  <div className="flex items-center mb-1">
                    <FaPalette className="text-purple-500 mr-2" />
                    <span className="text-sm font-medium text-gray-600">
                      Logo
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <img
                      src={s3Logo || businessPresets.logoUrl}
                      alt="Logo preview"
                      className="w-6 h-6 object-cover rounded"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    <span className="text-xs text-gray-800">Logo công ty</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Nhấn để thêm vào thiết kế
                  </p>
                </div>
              )}

              {/* Nếu không có thông tin */}
              {!businessPresets.companyName &&
                !businessPresets.address &&
                !businessPresets.contactInfo &&
                !businessPresets.logoUrl && (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">
                      Không có thông tin doanh nghiệp
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Hãy cập nhật thông tin ở bước 2
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Canvas Area - Giảm xuống 7 cột để text controls có nhiều chỗ hơn */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-semibold">Thiết kế</h3>
                {/* Hiển thị thông tin kích thước pixel */}
                {pixelValueData && pixelValueData.width && pixelValueData.height && (
                  <p className="text-sm text-gray-600 mt-1">
                    Kích thước gốc: {pixelValueData.width} × {pixelValueData.height} pixel
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={addText}
                  className="px-3 py-2 bg-custom-secondary text-white rounded-lg hover:bg-custom-secondary/90 flex items-center text-sm"
                >
                  <FaPlus className="mr-1" />
                  Thêm text
                </button>

                {/* NÚT THÊM ICON MỚI */}
                <button
                  onClick={() => {
                    setShowIconPicker(true);
                    if (icons.length === 0) {
                      loadIcons(1);
                    }
                  }}
                  className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center text-sm"
                >
                  <FaPalette className="mr-1" />
                  Thêm icon
                </button>

                <label className="px-3 py-2 bg-custom-primary text-white rounded-lg hover:bg-custom-primary/90 flex items-center text-sm cursor-pointer">
                  <FaPlus className="mr-1" />
                  Thêm ảnh
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
                <button
                  onClick={deleteSelectedObject}
                  disabled={!fabricCanvas?.getActiveObject()}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 flex items-center text-sm"
                >
                  <FaTrash className="mr-1" />
                  Xóa
                </button>
              </div>
            </div>

            <div
              className="border-2 border-gray-200 rounded-lg"
              style={{
                position: "relative",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "400px",
                backgroundColor: "#f8f9fa",
              }}
            >
              <canvas
                ref={canvasRef}
                style={{ 
                  display: "block",
                }}
              />
              {/* Hiển thị thông tin kích thước canvas */}
              {pixelValueData && pixelValueData.width && pixelValueData.height && (
                <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                  Gốc: {pixelValueData.width} × {pixelValueData.height} px (Auto Scale)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Text Controls - Bên phải - tăng lên 3 cột cho đủ chỗ màu chữ */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Tùy chỉnh text</h3>

            {selectedText ? (
              <div className="space-y-3">
                {/* Text Content */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nội dung
                  </label>
                  <textarea
                    value={textSettings.text}
                    onChange={(e) => {
                      updateTextProperty("text", e.target.value);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg resize-none text-sm"
                    rows={2}
                  />
                </div>

                {/* Font Family */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Font chữ
                  </label>
                  <select
                    value={textSettings.fontFamily}
                    onChange={(e) =>
                      updateTextProperty("fontFamily", e.target.value)
                    }
                    className="w-full p-1.5 border border-gray-300 rounded-lg text-sm"
                  >
                    {fonts.map((font) => (
                      <option
                        key={font}
                        value={font}
                        style={{ fontFamily: font }}
                      >
                        {font}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Font Size */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Kích thước: {textSettings.fontSize}px
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="100"
                    value={textSettings.fontSize}
                    onChange={(e) =>
                      updateTextProperty("fontSize", parseInt(e.target.value))
                    }
                    className="w-full"
                  />
                </div>

                {/* Text Color */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Màu chữ
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <input
                        type="color"
                        value={textSettings.fill}
                        onChange={(e) =>
                          updateTextProperty("fill", e.target.value)
                        }
                        className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
                        title="Chọn màu"
                      />
                    </div>
                    <input
                      type="text"
                      value={textSettings.fill}
                      onChange={(e) =>
                        updateTextProperty("fill", e.target.value)
                      }
                      placeholder="#000000"
                      className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-custom-secondary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Text Style Controls */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Kiểu chữ
                  </label>
                  <div className="flex space-x-1">
                    <button
                      onClick={() =>
                        updateTextProperty(
                          "fontWeight",
                          textSettings.fontWeight === "bold" ? "normal" : "bold"
                        )
                      }
                      className={`p-1.5 rounded border ${
                        textSettings.fontWeight === "bold"
                          ? "bg-custom-secondary text-white"
                          : "bg-gray-100"
                      }`}
                    >
                      <FaBold />
                    </button>

                    <button
                      onClick={() =>
                        updateTextProperty(
                          "fontStyle",
                          textSettings.fontStyle === "italic"
                            ? "normal"
                            : "italic"
                        )
                      }
                      className={`p-1.5 rounded border ${
                        textSettings.fontStyle === "italic"
                          ? "bg-custom-secondary text-white"
                          : "bg-gray-100"
                      }`}
                    >
                      <FaItalic />
                    </button>

                    <button
                      onClick={() =>
                        updateTextProperty("underline", !textSettings.underline)
                      }
                      className={`p-1.5 rounded border ${
                        textSettings.underline
                          ? "bg-custom-secondary text-white"
                          : "bg-gray-100"
                      }`}
                    >
                      <FaUnderline />
                    </button>
                  </div>
                </div>

                {/* Common Colors */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Màu phổ biến
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      "#000000",
                      "#ffffff", 
                      "#ff0000",
                      "#00ff00",
                      "#0000ff",
                      "#ffff00",
                      "#ff00ff",
                      "#00ffff",
                      "#ffa500",
                      "#800080",
                      "#ffc0cb",
                      "#a52a2a",
                    ].map((color) => (
                      <button
                        key={color}
                        onClick={() => updateTextProperty("fill", color)}
                        className={`w-10 h-10 rounded border-2 hover:scale-105 transition-transform duration-150 ${
                          textSettings.fill === color 
                            ? "border-custom-secondary shadow-lg" 
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-6 text-sm">
                Chọn một text để chỉnh sửa hoặc thêm text mới
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="mt-8 max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Ghi chú đơn hàng</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nhập ghi chú hoặc yêu cầu đặc biệt
              </label>
              <textarea
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-custom-primary focus:border-custom-primary transition-all"
                rows={4}
                placeholder="Nhập yêu cầu đặc biệt hoặc ghi chú cho đơn hàng của bạn..."
              />
            </div>
          </div>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex justify-center space-x-6 mt-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            // Reset canvas trước khi quay lại
            if (fabricCanvas) {
              fabricCanvas.dispose();
              setFabricCanvas(null);
            }

            if (generatedImage) {
              setCurrentStep(6);
            } else {
              setCurrentStep(5);
            }
          }}
          className="px-8 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-all"
        >
          Quay lại
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={exportDesign}
          disabled={isExporting}
          className="px-8 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-all flex items-center"
        >
          {isExporting ? (
            <>
              <CircularProgress size={20} color="inherit" className="mr-2" />
              Đang xử lý...
            </>
          ) : (
            <>
              {selectedBackgroundForCanvas
                ? "Xuất thiết kế Background"
                : "Xuất thiết kế AI"}
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{
            scale: currentAIDesign && !isOrdering ? 1.05 : 1,
          }}
          whileTap={{ scale: currentAIDesign && !isOrdering ? 0.95 : 1 }}
          onClick={handleConfirm}
          disabled={!currentAIDesign || isOrdering}
          className={`order-button px-8 py-3 font-medium rounded-lg transition-all flex items-center ${
            currentAIDesign && !isOrdering
              ? "bg-custom-secondary text-white hover:bg-custom-secondary/90"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isOrdering ? (
            <>
              <CircularProgress size={20} color="inherit" className="mr-2" />
              Đang xử lý...
            </>
          ) : !currentAIDesign ? (
            <>
              <FaCheck className="mr-2" />
              {selectedBackgroundForCanvas
                ? "Xuất thiết kế Background trước khi đặt hàng"
                : "Xuất thiết kế AI trước khi đặt hàng"}
            </>
          ) : (
            <>
              <FaCheck className="mr-2" />
              Đặt hàng
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default DesignEditor;
