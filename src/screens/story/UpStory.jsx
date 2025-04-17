import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/screens/story/UpStory.css"; // File CSS cho style

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/ddasyg5z3/upload";
const UPLOAD_PRESET = "ml_default";

const UpStory = () => {
  const navigate = useNavigate();
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null); // "photo" or "video"
  const [loading, setLoading] = useState(false);
  const [hasOpenedPicker, setHasOpenedPicker] = useState(false); // Trạng thái để kiểm soát mở dialog
  const fileInputRef = useRef(null);
  const hasOpenedPickerRef = useRef(false); // Use ref instead of state

  useEffect(() => {
    if (!hasOpenedPickerRef.current) {
      openMediaPicker();
      hasOpenedPickerRef.current = true; // Mark as opened
    }
  }, []); // Empty dependency array ensures it runs once on mount

  const openMediaPicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      console.log("Đã hủy chọn media");
      navigate("/");
      return;
    }

    const isVideo = file.type.includes("video");
    setMediaType(isVideo ? "video" : "photo");
    const mediaUrl = URL.createObjectURL(file);
    setSelectedMedia(mediaUrl);
    uploadToCloudinary(file, isVideo ? "video" : "photo");
  };

  const uploadToCloudinary = async (file, type) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const response = await axios.post(CLOUDINARY_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const mediaUrl = response.data.secure_url;
      console.log(`${type === "photo" ? "Ảnh" : "Video"} đã tải lên:`, mediaUrl);
      postStory(mediaUrl, type);
    } catch (error) {
      alert(`Không thể tải ${type === "photo" ? "ảnh" : "video"} lên, vui lòng thử lại!`);
      console.error("Lỗi upload:", error);
      setLoading(false); // Đảm bảo loading được tắt
      setHasOpenedPicker(false); // Cho phép mở lại dialog nếu upload thất bại
      openMediaPicker(); // Mở lại dialog để thử lại
    }
  };

  const postStory = (mediaUrl, type) => {
    navigate("/EditStory", { state: { newStory: mediaUrl, mediaType: type } });
  };

  return (
    <div className="post-story-container">
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*,video/*"
        onChange={handleFileChange}
      />

      {loading && <div className="loading">Đang tải...</div>}

      {selectedMedia && !loading && (
        mediaType === "photo" ? (
          <img src={selectedMedia} alt="Selected" className="media-preview" />
        ) : (
          <video controls className="media-preview">
            <source src={selectedMedia} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )
      )}
    </div>
  );
};

export default UpStory;