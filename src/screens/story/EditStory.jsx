import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { addPost } from "../../rtk/API"; // Giả định API
import { FaCamera, FaLock, FaCheck } from "react-icons/fa";
import style from "../../styles/screens/story/EditStory.module.css"; // Sử dụng CSS Modules

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/ddasyg5z3/upload";
const UPLOAD_PRESET = "ml_default";

const EditStory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [previewMedia, setPreviewMedia] = useState(null);
  const [mediaType, setMediaType] = useState("photo");
  const [loading, setLoading] = useState(false);
  const [isPosted, setIsPosted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailedModal, setShowFailedModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [text, setText] = useState("");
  const [showText, setShowText] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const me = useSelector((state) => state.app.user);

  const [selectedOption, setSelectedOption] = useState({
    status: 1,
    name: "Công khai",
  });

  const statusOptions = [
    { status: 1, name: "Công khai" },
    { status: 2, name: "Bạn bè" },
    { status: 3, name: "Chỉ mình tôi" },
  ];

  useEffect(() => {
    if (location.state?.newStory && location.state?.mediaType) {
      setPreviewMedia(location.state.newStory);
      setMediaType(location.state.mediaType);
    }
  }, [location.state]);

  const uploadToCloudinary = async (mediaUri) => {
    const formData = new FormData();
    formData.append("file", {
      uri: mediaUri,
      type: mediaType === "photo" ? "image/jpeg" : "video/mp4",
      name: mediaType === "photo" ? "upload.jpg" : "upload.mp4",
    });
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const response = await axios.post(CLOUDINARY_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const mediaUrl = response.data.secure_url;
      console.log(`${mediaType === "photo" ? "Ảnh" : "Video"} đã tải lên:`, mediaUrl);
      return mediaUrl;
    } catch (error) {
      console.log("Lỗi upload:", error);
      return null;
    }
  };

  const callAddPost = async () => {
    if (!previewMedia) {
      setErrorMessage("Vui lòng chọn media trước khi đăng!");
      setShowFailedModal(true);
      setTimeout(() => setShowFailedModal(false), 1500);
      return;
    }

    if (isPosted) return;

    setLoading(true);
    try {
      const uploadedUrl = previewMedia; // Media đã được upload từ PostStory
      if (!uploadedUrl) {
        setErrorMessage("Không thể tải media!");
        setShowFailedModal(true);
        setTimeout(() => setShowFailedModal(false), 2000);
        return;
      }

      const paramsAPI = {
        ID_user: me._id,
        caption: text,
        medias: [uploadedUrl],
        status: selectedOption.name,
        type: "Story",
        mediaType: mediaType,
        ID_post_shared: null,
        tags: [],
      };

      await dispatch(addPost(paramsAPI)).unwrap();
      setIsPosted(true);
      setShowSuccessModal(true);

      setTimeout(() => {
        setShowSuccessModal(false);
        navigate("/");
      }, 2000);
    } catch (error) {
      setErrorMessage("Đăng bài thất bại. Vui lòng thử lại!");
      setShowFailedModal(true);
      setTimeout(() => setShowFailedModal(false), 2000);
      console.log("Lỗi đăng bài:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={style["story-container"]}>
      {previewMedia ? (
        mediaType === "photo" ? (
          <img src={previewMedia} alt="Preview" className={style["story-media"]} />
        ) : (
          <video className={style["story-media"]}>
            <source src={previewMedia} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )
      ) : (
        <p className={style["no-media"]}>Chưa có media</p>
      )}

      {showText && (
        <div className={style["draggable-text-container"]}>
          <input
            type="text"
            className={style["draggable-text"]}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Nhập văn bản..."
          />
        </div>
      )}

      <div className={style["header-container"]}>
        <div className={style["user-info-container"]}>
          <img src={me?.avatar} alt="Avatar" className={style["avatar"]} />
          <p className={style["username"]}>
            {me?.first_name} {me?.last_name}
          </p>
        </div>
        <button className={style["exit-button"]} onClick={() => navigate("/")}>
          ✕
        </button>
      </div>

      <button
        className={style["privacy-button"]}
        onClick={() => setModalVisible(true)}
      >
        <FaLock />
        <span className={style["privacy-text"]}>{selectedOption.name}</span>
      </button>

      <button
        className={`${style["post-button"]} ${loading || isPosted ? style["disabled"] : ""}`}
        onClick={callAddPost}
        disabled={loading || isPosted}
      >
        {loading ? "Đang đăng..." : isPosted ? "Đã đăng" : "Đăng"}
      </button>

      {modalVisible && (
        <div className={style["modal-container"]}>
          <div className={style["modal-content"]}>
            <p className={style["modal-title"]}>Chọn quyền riêng tư</p>
            {statusOptions.map((item) => (
              <button
                key={item.status}
                className={style["option-item"]}
                onClick={() => {
                  setSelectedOption(item);
                  setModalVisible(false);
                }}
              >
                <span className={style["option-text"]}>{item.name}</span>
                {selectedOption.status === item.status && <FaCheck />}
              </button>
            ))}
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className={style["success-modal"]}>Đăng story thành công</div>
      )}
      {showFailedModal && (
        <div className={style["failed-modal"]}>{errorMessage}</div>
      )}
    </div>
  );
};

export default EditStory;