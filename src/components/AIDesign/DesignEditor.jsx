import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CircularProgress, Chip, Tooltip } from "@mui/material";
import {
  FaFont,
  FaPalette,
  FaPlus,
  FaTrash,
  FaBold,
  FaItalic,
  FaUnderline,
  FaCheck,
  FaImage,
  FaMagic,
  FaEdit,
  FaInfo,
  FaDownload,
  FaShoppingCart,
  FaTimes,
  FaSave,
  FaCog,
  FaExpandArrowsAlt,
} from "react-icons/fa";

// Mark motion as used for linters that don't detect JSX member usage
void motion;

// CSS cho slider và hiệu ứng
const sliderStyles = `
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #10b981;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    border: 2px solid white;
  }

  .slider::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #10b981;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    border: 2px solid white;
  }

  .slider:focus {
    outline: none;
  }

  .slider:focus::-webkit-slider-thumb {
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = sliderStyles;
  document.head.appendChild(styleSheet);
}

const DesignEditor = ({
  selectedBackgroundForCanvas,
  businessPresets,
  s3Logo,
  addBusinessInfoToCanvas,
  applyLayout1,
  applyLayout2,
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
  isOrdering,
  containerVariants,
  itemVariants,
  pixelValueData,
  hasExportedInCurrentSession,
}) => {
  // Theo dõi trạng thái có đối tượng đang được chọn trên canvas để bật/tắt nút Xóa
  const [hasActiveObject, setHasActiveObject] = useState(false);
  // Track any active textbox (including those added by automatic layouts that may not populate selectedText prop)
  const [activeTextbox, setActiveTextbox] = useState(null);
  const activeTextboxRef = useRef(null); // giữ reference thật của Fabric.Textbox
  const [_, forceRerender] = useState(0); // trigger re-render khi text thay đổi nội bộ
  const lastValidRef = useRef(new WeakMap());
  // Ref tới ô input nội dung toolbar để auto focus khi double click vào textbox trên canvas
  const toolbarTextInputRef = useRef(null);

  const isOutOfBounds = useCallback((obj, canvas) => {
    if (!obj || !canvas) return false;
    const br = obj.getBoundingRect(true);
    const cw = canvas.getWidth();
    const ch = canvas.getHeight();
    return br.left < 0 || br.top < 0 || br.left + br.width > cw || br.top + br.height > ch;
  }, []);

  const moveInsideBounds = useCallback((obj, canvas) => {
    const br = obj.getBoundingRect(true);
    const cw = canvas.getWidth();
    const ch = canvas.getHeight();
    let dx = 0;
    let dy = 0;
    if (br.left < 0) dx = -br.left;
    if (br.top < 0) dy = -br.top;
    if (br.left + br.width > cw) dx = cw - (br.left + br.width);
    if (br.top + br.height > ch) dy = ch - (br.top + br.height);
    obj.left += dx;
    obj.top += dy;
    obj.setCoords();
  }, []);

  const scaleDownToFit = useCallback((obj, canvas) => {
    // Scale object down uniformly so that it fits within canvas bounds
    let br = obj.getBoundingRect(true);
    const cw = canvas.getWidth();
    const ch = canvas.getHeight();
    const widthScale = br.width > 0 ? cw / br.width : 1;
    const heightScale = br.height > 0 ? ch / br.height : 1;
    const factor = Math.min(widthScale, heightScale, 1);
    if (factor < 1) {
      obj.scaleX *= factor;
      obj.scaleY *= factor;
      obj.setCoords();
      // After scaling, also ensure inside bounds
      moveInsideBounds(obj, canvas);
    }
  }, [moveInsideBounds]);

  // Đồng bộ cập nhật từ toolbar (selectedText flow) xuống textbox layout nếu đang chọn textbox layout
  const unifiedUpdate = useCallback((prop, value) => {
    // Gọi logic gốc để không phá vỡ flow hiện tại
    if (updateTextProperty) {
      try { updateTextProperty(prop, value); } catch { /* silent */ }
    }
  const t = activeTextboxRef.current || (fabricCanvas && fabricCanvas.getActiveObject());
  if (t && (t.type === 'textbox' || t.type === 'text')) {
      try {
        if (prop === 'text') {
          t.set('text', value);
          if (typeof t.initDimensions === 'function') t.initDimensions();
        } else if (prop === 'fontFamily') {
          t.set('fontFamily', value);
        } else if (prop === 'fontSize') {
          t.set('fontSize', value);
        } else if (prop === 'fill') {
          t.set('fill', value);
        } else if (prop === 'fontWeight') {
          t.set('fontWeight', value);
        } else if (prop === 'fontStyle') {
          t.set('fontStyle', value);
        } else if (prop === 'underline') {
          t.set('underline', value);
        }
        t.setCoords();
        fabricCanvas?.requestRenderAll();
        // Force re-render để input phản ánh đúng (trường hợp selectedText không map tới textbox layout)
        forceRerender(v => v + 1);
      } catch { /* silent */ }
    }
  }, [updateTextProperty, fabricCanvas]);

  // 🎯 useEffect để tự động điều chỉnh canvas theo kích thước ảnh (DISABLED - handled in AIDesign.jsx)
  useEffect(() => {
    // Logic này đã được xử lý trong AIDesign.jsx để tránh conflict
    // Chỉ log để debug
    if (fabricCanvas && (selectedBackgroundForCanvas || generatedImage)) {
      console.log("🎯 [DESIGN EDITOR] Canvas adjustment handled by AIDesign.jsx");
      console.log("🎯 [DESIGN EDITOR] Current canvas size:", fabricCanvas.getWidth(), "x", fabricCanvas.getHeight());
    }
  }, [fabricCanvas, selectedBackgroundForCanvas, generatedImage, pixelValueData]);

  // 🎯 useEffect để đồng bộ CSS của canvas element với kích thước Fabric.js canvas
  useEffect(() => {
    if (!fabricCanvas) return;

    const syncCanvasStyle = () => {
      try {
        const canvasElement = fabricCanvas.getElement();
        const fabricWidth = fabricCanvas.getWidth();
        const fabricHeight = fabricCanvas.getHeight();

        console.log("🎯 [CANVAS SYNC] Syncing canvas element style");
        console.log("🎯 [CANVAS SYNC] Fabric canvas size:", fabricWidth, "x", fabricHeight);
        console.log("🎯 [CANVAS SYNC] Canvas element size:", canvasElement.width, "x", canvasElement.height);

        // Đồng bộ style của canvas element
        canvasElement.style.width = fabricWidth + 'px';
        canvasElement.style.height = fabricHeight + 'px';

        console.log("🎯 [CANVAS SYNC] ✅ Canvas element style synchronized!");

      } catch (error) {
        console.error("🎯 [CANVAS SYNC] Error syncing canvas style:", error);
      }
    };

    // Sync ngay lập tức
    syncCanvasStyle();

    // Theo dõi sự thay đổi kích thước canvas
    const checkCanvasResize = () => {
      const canvasElement = fabricCanvas.getElement();
      const fabricWidth = fabricCanvas.getWidth();
      const fabricHeight = fabricCanvas.getHeight();
      
      if (canvasElement.style.width !== fabricWidth + 'px' || 
          canvasElement.style.height !== fabricHeight + 'px') {
        syncCanvasStyle();
      }
    };

    const resizeInterval = setInterval(checkCanvasResize, 100);

    return () => {
      clearInterval(resizeInterval);
    };
  }, [fabricCanvas]);

  useEffect(() => {
    if (!fabricCanvas) return;

    const updateActive = () => {
      try {
        const obj = fabricCanvas.getActiveObject();
        setHasActiveObject(!!obj);
        if (obj && obj.type === 'textbox') {
          setActiveTextbox(obj);
          activeTextboxRef.current = obj;
        } else {
          setActiveTextbox(null);
          activeTextboxRef.current = null;
        }
      } catch {
        setHasActiveObject(false);
        setActiveTextbox(null);
      }
    };

    // Cập nhật ngay khi mount/lần đầu nhận canvas
    updateActive();

    // Lắng nghe các sự kiện chọn/bỏ chọn/ thêm/xóa object để kích hoạt re-render
    fabricCanvas.on("selection:created", updateActive);
    fabricCanvas.on("selection:updated", updateActive);
    fabricCanvas.on("selection:cleared", updateActive);
    fabricCanvas.on("object:added", updateActive);
    fabricCanvas.on("object:removed", updateActive);

    // Lưu lại trạng thái hợp lệ cuối cùng khi người dùng bắt đầu tương tác
    const handleMouseDown = (opt) => {
      const t = fabricCanvas.getActiveObject();
      if (t) {
        lastValidRef.current.set(t, {
          left: t.left,
          top: t.top,
          scaleX: t.scaleX,
          scaleY: t.scaleY,
          angle: t.angle,
        });
      }

      // Quick edit: if user clicks again on already selected textbox within 600ms, enter editing
      const target = opt?.target;
      if (target && target.type === 'textbox') {
        const now = Date.now();
        if (target.__lastClick && now - target.__lastClick < 600) {
          try {
            target.enterEditing();
            target.selectAll();
            fabricCanvas.requestRenderAll();
            // Auto focus input toolbar (delay 0 để đảm bảo input đã render)
            setTimeout(() => {
              if (toolbarTextInputRef.current) {
                toolbarTextInputRef.current.focus();
                try { toolbarTextInputRef.current.select(); } catch { /* silent */ }
              }
            }, 0);
          } catch {
            // silent
          }
        }
        target.__lastClick = now;
      }
    };

    // Chặn scale vượt ra ngoài: nếu vượt, khôi phục về trạng thái hợp lệ gần nhất
    const handleScaling = (e) => {
      const t = e.target;
      if (!t) return;
      if (isOutOfBounds(t, fabricCanvas)) {
        const prev = lastValidRef.current.get(t);
        if (prev) {
          t.set(prev);
          t.setCoords();
          fabricCanvas.requestRenderAll();
          return;
        }
      }
      // Nếu hợp lệ, cập nhật snapshot
      lastValidRef.current.set(t, {
        left: t.left,
        top: t.top,
        scaleX: t.scaleX,
        scaleY: t.scaleY,
        angle: t.angle,
      });
    };

    // Sau khi chỉnh sửa (scale/rotate/translate), đảm bảo vẫn nằm trong bounds
    const handleModified = (e) => {
      const t = e.target;
      if (!t) return;
      if (isOutOfBounds(t, fabricCanvas)) {
        const prev = lastValidRef.current.get(t);
        if (prev) {
          t.set(prev);
          t.setCoords();
        } else {
          // Không có snapshot: cố gắng scale-down và di chuyển vào trong
          scaleDownToFit(t, fabricCanvas);
          moveInsideBounds(t, fabricCanvas);
        }
        fabricCanvas.requestRenderAll();
      } else {
        lastValidRef.current.set(t, {
          left: t.left,
          top: t.top,
          scaleX: t.scaleX,
          scaleY: t.scaleY,
          angle: t.angle,
        });
      }
    };

    // Khi thêm object mới (logo/ảnh), đảm bảo nó fit trong canvas
    const handleObjectAdded = (e) => {
      const t = e.target;
      if (!t) return;
      if (isOutOfBounds(t, fabricCanvas)) {
        scaleDownToFit(t, fabricCanvas);
        moveInsideBounds(t, fabricCanvas);
        fabricCanvas.requestRenderAll();
      }
      lastValidRef.current.set(t, {
        left: t.left,
        top: t.top,
        scaleX: t.scaleX,
        scaleY: t.scaleY,
        angle: t.angle,
      });
    };

    fabricCanvas.on("mouse:down", handleMouseDown);
    // Explicit double-click handler (more reliable than timing heuristic on some systems)
    const handleDblClick = (opt) => {
      const target = opt?.target;
      if (target && target.type === 'textbox') {
        try {
          target.enterEditing();
          target.selectAll();
          setActiveTextbox(target);
          activeTextboxRef.current = target;
          activeTextboxRef.current = target;
          fabricCanvas.requestRenderAll();
          setTimeout(() => {
            if (toolbarTextInputRef.current) {
              toolbarTextInputRef.current.focus();
              try { toolbarTextInputRef.current.select(); } catch { /* silent */ }
            }
          }, 0);
        } catch {
          // silent
        }
      }
    };
    fabricCanvas.on('mouse:dblclick', handleDblClick);
    // Lắng nghe khi text thay đổi bên trong chế độ editing để đồng bộ toolbar
    const handleTextChanged = (e) => {
      const t = e.target;
      if (t && t.type === 'textbox' && t === activeTextboxRef.current) {
        // giữ reference gốc, chỉ cần force re-render để input value cập nhật
        forceRerender(v => v + 1);
      }
    };
    fabricCanvas.on('text:changed', handleTextChanged);
    fabricCanvas.on("object:scaling", handleScaling);
    fabricCanvas.on("object:modified", handleModified);
    fabricCanvas.on("object:added", handleObjectAdded);

    return () => {
      try {
        fabricCanvas.off("selection:created", updateActive);
        fabricCanvas.off("selection:updated", updateActive);
        fabricCanvas.off("selection:cleared", updateActive);
        fabricCanvas.off("object:added", updateActive);
        fabricCanvas.off("object:removed", updateActive);
        fabricCanvas.off("mouse:down", handleMouseDown);
  fabricCanvas.off('mouse:dblclick', handleDblClick);
  fabricCanvas.off('text:changed', handleTextChanged);
        fabricCanvas.off("object:scaling", handleScaling);
        fabricCanvas.off("object:modified", handleModified);
        fabricCanvas.off("object:added", handleObjectAdded);
      } catch {
        // no-op
      }
    };
  }, [fabricCanvas, isOutOfBounds, moveInsideBounds, scaleDownToFit]);

  // Khi chỉnh font-size qua UI (updateTextProperty), đôi khi không phát sinh object:modified.
  // Theo dõi thay đổi fontSize để đảm bảo object vẫn nằm trong bounds; nếu vượt, scale-down hoặc di chuyển vào trong.
  useEffect(() => {
    if (!fabricCanvas) return;
    const obj = fabricCanvas.getActiveObject();
    if (!obj) return;
    if (isOutOfBounds(obj, fabricCanvas)) {
      scaleDownToFit(obj, fabricCanvas);
      moveInsideBounds(obj, fabricCanvas);
      obj.setCoords();
      fabricCanvas.requestRenderAll();
    }
    // Cập nhật snapshot hợp lệ hiện tại
    lastValidRef.current.set(obj, {
      left: obj.left,
      top: obj.top,
      scaleX: obj.scaleX,
      scaleY: obj.scaleY,
      angle: obj.angle,
    });
  }, [fabricCanvas, textSettings?.fontSize, isOutOfBounds, moveInsideBounds, scaleDownToFit]);

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header với breadcrumb và trạng thái */}
      <motion.div 
        className="mb-8"
        variants={itemVariants}
      >
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Bước 7</span>
              <span>•</span>
              <Chip 
                label="Chỉnh sửa thiết kế" 
                color="primary" 
                size="small"
                icon={<FaEdit />}
              />
            </div>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-800">
              {selectedBackgroundForCanvas ? (
                <div className="flex items-center space-x-2">
                  <FaImage className="text-purple-500" />
                  <span>Chỉnh sửa thiết kế với Background</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <FaMagic className="text-blue-500" />
                  <span>Chỉnh sửa thiết kế AI</span>
                </div>
              )}
            </h1>
          </div>
          
          {/* Quick info panel */}
          <div className="flex items-center space-x-4">
            {pixelValueData && pixelValueData.width && pixelValueData.height && (
              <Tooltip title="Kích thước thiết kế gốc">
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                  <div className="flex items-center space-x-2">
                    <FaExpandArrowsAlt className="text-blue-600 text-sm" />
                    <span className="text-sm font-semibold text-blue-800">
                      {pixelValueData.width} × {pixelValueData.height}px
                    </span>
                  </div>
                </div>
              </Tooltip>
            )}
            
            <Tooltip title="Trạng thái thiết kế">
              <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-800">Đang chỉnh sửa</span>
                </div>
              </div>
            </Tooltip>
          </div>
        </div>
      </motion.div>

      {/* Main content area */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Business Info Panel - Enhanced design */}
        <motion.div 
          className="xl:col-span-3"
          variants={itemVariants}
        >
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Panel header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                <FaPalette className="mr-2" />
                Thông tin doanh nghiệp
              </h3>
              <p className="text-indigo-100 text-sm mt-1">
                Nhấp để thêm vào thiết kế
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Company Name */}
              {businessPresets.companyName && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all"
                  onClick={() =>
                    addBusinessInfoToCanvas(
                      "companyName",
                      businessPresets.companyName
                    )
                  }
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <FaFont className="text-blue-600 text-sm" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Tên công ty</span>
                    </div>
                    <FaPlus className="text-gray-400 group-hover:text-blue-500 transition-colors text-sm" />
                  </div>
                  <p className="text-sm font-semibold text-gray-800 truncate mb-1">
                    {businessPresets.companyName}
                  </p>
                  <p className="text-xs text-gray-500">
                    Nhấn để thêm vào thiết kế
                  </p>
                </motion.div>
              )}

              {/* Address */}
              {businessPresets.address && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-green-300 hover:bg-green-50 transition-all"
                  onClick={() =>
                    addBusinessInfoToCanvas("address", businessPresets.address)
                  }
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                        <FaFont className="text-green-600 text-sm" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Địa chỉ</span>
                    </div>
                    <FaPlus className="text-gray-400 group-hover:text-green-500 transition-colors text-sm" />
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate mb-1">
                    {businessPresets.address}
                  </p>
                  <p className="text-xs text-gray-500">
                    Nhấn để thêm vào thiết kế
                  </p>
                </motion.div>
              )}

              {/* Contact Info */}
              {businessPresets.contactInfo && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition-all"
                  onClick={() =>
                    addBusinessInfoToCanvas(
                      "contactInfo",
                      businessPresets.contactInfo
                    )
                  }
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                        <FaFont className="text-orange-600 text-sm" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Liên hệ</span>
                    </div>
                    <FaPlus className="text-gray-400 group-hover:text-orange-500 transition-colors text-sm" />
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate mb-1">
                    {businessPresets.contactInfo}
                  </p>
                  <p className="text-xs text-gray-500">
                    Nhấn để thêm vào thiết kế
                  </p>
                </motion.div>
              )}

              {/* Logo */}
              {businessPresets.logoUrl && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-300 hover:bg-purple-50 transition-all"
                  onClick={() =>
                    addBusinessInfoToCanvas(
                      "logoUrl",
                      s3Logo || businessPresets.logoUrl
                    )
                  }
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                        <FaImage className="text-purple-600 text-sm" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Logo</span>
                    </div>
                    <FaPlus className="text-gray-400 group-hover:text-purple-500 transition-colors text-sm" />
                  </div>
                  <div className="flex items-center space-x-3 mb-2">
                    <img
                      src={s3Logo || businessPresets.logoUrl}
                      alt="Logo preview"
                      className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    <span className="text-sm font-medium text-gray-800">Logo công ty</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Nhấn để thêm vào thiết kế
                  </p>
                </motion.div>
              )}

              {/* Empty state */}
              {!businessPresets.companyName &&
                !businessPresets.address &&
                !businessPresets.contactInfo &&
                !businessPresets.logoUrl && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">📋</div>
                    <p className="text-gray-500 font-medium">
                      Không có thông tin doanh nghiệp
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Hãy cập nhật thông tin ở bước 2
                    </p>
                  </div>
                )}
            </div>

            {/* Quick Layout Section */}
            {(businessPresets.companyName || 
              businessPresets.address || 
              businessPresets.contactInfo || 
              businessPresets.logoUrl) && (
              <div className="border-t border-gray-100 bg-gray-50 p-6">
                <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center">
                  <FaCog className="text-indigo-500 mr-2" />
                  Layout tự động
                </h4>
                <div className="space-y-3">
                  {/* Layout 1 Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={applyLayout1}
                    className="cursor-pointer w-full p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all text-sm font-medium flex items-center justify-between group"
                  >
                    <div className="flex items-center">
                      <span className="mr-3 text-lg">📋</span>
                      <div className="text-left">
                        <div className="font-semibold">Layout 1</div>
                        <div className="text-xs text-blue-100">Góc trái trên</div>
                      </div>
                    </div>
                    <FaPlus className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>

                  {/* Layout 2 Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={applyLayout2}
                    className="cursor-pointer w-full p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all text-sm font-medium flex items-center justify-between group"
                  >
                    <div className="flex items-center">
                      <span className="mr-3 text-lg">📌</span>
                      <div className="text-left">
                        <div className="font-semibold">Layout 2</div>
                        <div className="text-xs text-green-100">Góc phải dưới</div>
                      </div>
                    </div>
                    <FaPlus className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>

                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700 text-center font-medium">
                    💡 Layout tự động sắp xếp toàn bộ thông tin doanh nghiệp
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Canvas Area - Expanded like Canva (right side) */}
        <motion.div 
          className="xl:col-span-9"
          variants={itemVariants}
        >
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Canvas header with compact top toolbar (like Canva) */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              {/* Row 1: title + quick info */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <FaEdit className="mr-2 text-indigo-500" />
                  <h3 className="text-base sm:text-lg font-bold text-gray-800">Khu vực thiết kế</h3>
                </div>
                <div className="flex items-center space-x-2">
                  {pixelValueData && pixelValueData.width && pixelValueData.height && (
                    <Tooltip title="Kích thước thiết kế gốc">
                      <div className="hidden sm:block bg-blue-50 border border-blue-200 rounded-md px-2 py-1">
                        <div className="flex items-center space-x-1">
                          <FaExpandArrowsAlt className="text-blue-600 text-xs " />
                          <span className="text-xs font-semibold text-blue-800">
                            {pixelValueData.width}×{pixelValueData.height}px
                          </span>
                        </div>
                      </div>
                    </Tooltip>
                  )}
                </div>
              </div>

              {/* Row 2: toolbar - text controls if a text is selected, else quick add actions */}
              <div className="flex flex-wrap items-center gap-2" style={{minHeight:'90px'}}> {/* giữ chiều cao cố định để khi chọn object không đẩy canvas xuống */}
                {(selectedText || activeTextbox) ? (
                  <>
                    {/* Text content */}
                    <input
                      type="text"
                      value={textSettings.text}
                      onChange={(e) => unifiedUpdate("text", e.target.value)}
                      placeholder="Nội dung..."
                      className="w-48 sm:w-72 md:w-96 p-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                      ref={toolbarTextInputRef}
                    />

                    {/* Font family */}
                    <select
                      value={textSettings.fontFamily}
                      onChange={(e) => unifiedUpdate("fontFamily", e.target.value)}
                      className="w-40 p-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    >
                      {fonts.map((font) => (
                        <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                      ))}
                    </select>

                    {/* Font size */}
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        min={12}
                        max={200}
                        value={textSettings.fontSize}
                        onChange={(e) => unifiedUpdate("fontSize", parseInt(e.target.value) || 0)}
                        className="w-20 p-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none"
                        title="Kích thước"
                      />
                      <span className="text-xs text-gray-500">px</span>
                    </div>

                    {/* Text color */}
                    <input
                      type="color"
                      value={textSettings.fill}
                      onChange={(e) => unifiedUpdate("fill", e.target.value)}
                      className="w-10 h-10 p-1 bg-white border border-gray-300 rounded-md"
                      title="Màu chữ"
                    />

                    {/* Style toggles */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => unifiedUpdate("fontWeight", textSettings.fontWeight === "bold" ? "normal" : "bold")}
                      className={`p-2 rounded-md border text-sm ${textSettings.fontWeight === "bold" ? "bg-emerald-500 text-white border-emerald-500" : "bg-white border-gray-300"}`}
                      title="Đậm"
                    >
                      <FaBold />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => unifiedUpdate("fontStyle", textSettings.fontStyle === "italic" ? "normal" : "italic")}
                      className={`p-2 rounded-md border text-sm ${textSettings.fontStyle === "italic" ? "bg-emerald-500 text-white border-emerald-500" : "bg-white border-gray-300"}`}
                      title="Nghiêng"
                    >
                      <FaItalic />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => unifiedUpdate("underline", !textSettings.underline)}
                      className={`p-2 rounded-md border text-sm ${textSettings.underline ? "bg-emerald-500 text-white border-emerald-500" : "bg-white border-gray-300"}`}
                      title="Gạch chân"
                    >
                      <FaUnderline />
                    </motion.button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 w-full">
                    <Tooltip title="Thêm văn bản">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={addText}
                        className="cursor-pointer p-2.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all shadow-sm"
                      >
                        <FaFont className="text-sm" />
                      </motion.button>
                    </Tooltip>

                    <Tooltip title="Thêm biểu tượng">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setShowIconPicker(true);
                          if (icons.length === 0) {
                            loadIcons(1);
                          }
                        }}
                        className="cursor-pointer p-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all shadow-sm"
                      >
                        <FaPalette className="text-sm" />
                      </motion.button>
                    </Tooltip>

                    <Tooltip title="Thêm hình ảnh">
                      <label className="p-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all cursor-pointer shadow-sm block">
                        <FaImage className="text-sm" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </Tooltip>
                    {/* Spacer mô phỏng chiều rộng khối input khi chưa chọn để tránh layout jump */}
                    <div className="hidden sm:block flex-1" />
                    <div className="invisible h-0 sm:h-auto sm:visible flex items-center gap-2">
                      {/* placeholder kích thước tương đương các control khi editing */}
                      <div className="w-72 h-0" />
                      <div className="w-40 h-0" />
                      <div className="w-24 h-0" />
                      <div className="w-10 h-0" />
                      <div className="w-9 h-0" />
                      <div className="w-9 h-0" />
                      <div className="w-9 h-0" />
                    </div>
                  </div>
                )}

                {/* Right-aligned delete button for any selected object */}
                <div className="ml-auto">
                  <Tooltip title="Xóa đối tượng đã chọn">
                    <motion.button
                      whileHover={{ scale: hasActiveObject ? 1.05 : 1 }}
                      whileTap={{ scale: hasActiveObject ? 0.95 : 1 }}
                      onClick={deleteSelectedObject}
                      disabled={!hasActiveObject}
                      className={` p-2 rounded-md ${hasActiveObject ? "bg-red-500 text-white cursor-pointer" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                    >
                      <FaTrash />
                    </motion.button>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Canvas container với guidelines */}
            <div className="p-6">
              <div
                className="relative bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden"
                style={{
                  minHeight: "400px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {/* Background pattern */}
                <div 
                  className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage: `
                      radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)
                    `,
                    backgroundSize: '20px 20px'
                  }}
                ></div>
                
                <canvas
                  ref={canvasRef}
                  className="relative z-10 max-w-full h-auto border border-gray-300 rounded-lg shadow-lg"
                  style={{ 
                    imageRendering: "auto",
                    backgroundColor: "transparent"
                  }}
                />
                
                {/* Guidelines/hints */}
                {!fabricCanvas && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="text-6xl mb-4">🎨</div>
                      <p className="text-gray-500 font-medium">Đang tải canvas...</p>
                      <p className="text-gray-400 text-sm mt-2">Vui lòng chờ trong giây lát</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Canvas tips */}
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <FaInfo className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-1">Mẹo sử dụng</p>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Nhấp để chọn đối tượng, kéo để di chuyển</li>
                      <li>• Kéo góc để thay đổi kích thước</li>
                      <li>• Nhấp đúp để chỉnh sửa văn bản</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

  {/* No right text panel: controls moved to top toolbar to maximize canvas space */}
      </div>

      {/* Customer Notes Section - Enhanced */}
      <motion.div 
        className="mt-8"
        variants={itemVariants}
      >
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Notes header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4">
            <h3 className="text-lg font-bold text-white flex items-center">
              <FaEdit className="mr-2" />
              Ghi chú đơn hàng
            </h3>
            <p className="text-amber-100 text-sm mt-1">
              Thêm yêu cầu đặc biệt hoặc ghi chú cho đơn hàng
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ghi chú chi tiết (tùy chọn)
                </label>
                <textarea
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg resize-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                  rows={4}
                  placeholder="VD: Muốn sử dụng màu xanh làm chủ đạo, font chữ to hơn, hoặc thay đổi vị trí logo..."
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">
                    Ghi chú sẽ giúp đội ngũ thiết kế hiểu rõ yêu cầu của bạn
                  </p>
                  <span className="text-xs text-gray-400">
                    {customerNote.length}/500 ký tự
                  </span>
                </div>
              </div>

              {/* Quick note suggestions */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Gợi ý ghi chú:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Thay đổi màu sắc chủ đạo",
                    "Điều chỉnh kích thước font",
                    "Thay đổi vị trí logo",
                    "Thêm viền cho văn bản",
                    "Sử dụng màu nền khác"
                  ].map((suggestion) => (
                    <motion.button
                      key={suggestion}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (!customerNote.includes(suggestion)) {
                          setCustomerNote(prev => 
                            prev ? `${prev}\n• ${suggestion}` : `• ${suggestion}`
                          );
                        }
                      }}
                      className="px-3 py-1.5 text-xs bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors text-amber-700"
                    >
                      + {suggestion}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons - Professional design */}
      <motion.div 
        className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mt-8"
        variants={itemVariants}
      >
        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            // Reset canvas trước khi quay lại
            if (fabricCanvas) {
              fabricCanvas.dispose();
              setFabricCanvas(null);
            }

            // 🎯 LOGIC ĐƠN GIẢN: Dựa vào loại thiết kế hiện tại
            console.log("🔙 [BACK NAVIGATION] Determining back step:");
            console.log("🔙 [BACK NAVIGATION] Has generatedImage:", !!generatedImage);
            console.log("🔙 [BACK NAVIGATION] Has selectedBackgroundForCanvas:", !!selectedBackgroundForCanvas);

            // Nếu đang làm việc với AI image → về case 5 (template selection)
            if (generatedImage && !selectedBackgroundForCanvas) {
              console.log("🔙 [BACK NAVIGATION] AI workflow - Going back to case 5 (template selection)");
              setCurrentStep(5);
            }
            // Nếu đang làm việc với background → về case 5 (background selection) 
            else if (selectedBackgroundForCanvas) {
              console.log("🔙 [BACK NAVIGATION] Background workflow - Going back to case 5 (background selection)");
              setCurrentStep(5);
            }
            // Fallback: về case 5
            else {
              console.log("🔙 [BACK NAVIGATION] Fallback to case 5");
              setCurrentStep(5);
            }
          }}
          className="cursor-pointer px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg flex items-center"
        >
          <FaTimes className="mr-2" />
          Quay lại bước trước
        </motion.button>

        {/* Export Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={exportDesign}
          disabled={isExporting}
          className="cursor-pointer px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg flex items-center min-w-[200px] justify-center"
        >
          {isExporting ? (
            <>
              <CircularProgress size={20} color="inherit" className="mr-2" />
              <span>Đang xuất thiết kế...</span>
            </>
          ) : (
            <>
              <FaDownload className="mr-2" />
              <span>
                {selectedBackgroundForCanvas
                  ? "Xuất thiết kế Background"
                  : "Xuất thiết kế AI"}
              </span>
            </>
          )}
        </motion.button>

        {/* Order Button */}
        <motion.button
          whileHover={{
            scale: hasExportedInCurrentSession && !isOrdering ? 1.05 : 1,
          }}
          whileTap={{ scale: hasExportedInCurrentSession && !isOrdering ? 0.95 : 1 }}
          onClick={handleConfirm}
          disabled={!hasExportedInCurrentSession || isOrdering}
          className={`cursor-pointer px-8 py-4 font-semibold rounded-lg transition-all shadow-lg flex items-center min-w-[200px] justify-center ${
            hasExportedInCurrentSession && !isOrdering
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
              : "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isOrdering ? (
            <>
              <CircularProgress size={20} color="inherit" className="mr-2" />
              <span>Đang xử lý đơn hàng...</span>
            </>
          ) : !hasExportedInCurrentSession ? (
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <FaSave className="mr-2" />
                <span>Cần xuất thiết kế trước</span>
              </div>
              <div className="text-xs opacity-75">
                {selectedBackgroundForCanvas
                  ? "Xuất Background để tiếp tục"
                  : "Xuất AI để tiếp tục"}
              </div>
            </div>
          ) : (
            <>
              <FaShoppingCart className="mr-2" />
              <span>Đặt hàng ngay</span>
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Export status indicator */}
      {hasExportedInCurrentSession && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex justify-center"
        >
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 flex items-center">
            <FaCheck className="text-green-500 mr-2" />
            <span className="text-sm font-medium text-green-700">
              Thiết kế đã được xuất thành công! Bạn có thể đặt hàng ngay.
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DesignEditor;
