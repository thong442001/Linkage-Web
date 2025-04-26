import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addPost, getAllFriendOfID_user } from "../../rtk/API";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faSearch,
  faTag,
  faImage,
  faTimes,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../../styles/components/dialogs/UpPost.module.css";
import { TextField } from "@mui/material";

const UpPost = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.app.token);
  const me = useSelector((state) => state.app.user);

  const [modalVisible, setModalVisible] = useState(false); // Hiển thị modal trạng thái
  const [tagVisible, setTagVisible] = useState(false); // Hiển thị modal gắn thẻ
  const [friends, setFriends] = useState(null); // Danh sách bạn bè
  const [selectedUsers, setSelectedUsers] = useState([]); // Người được chọn để gắn thẻ
  const [tempSelectedUsers, setTempSelectedUsers] = useState([]); // Người được chọn tạm thời
  const [modalVisibleAI, setModalVisibleAI] = useState(false); // Hiển thị modal AI (chưa dùng)
  const [prompt, setPrompt] = useState(""); // Nội dung prompt AI
  const [image, setImage] = useState(null); // Ảnh AI (chưa dùng)
  const [isPosting, setIsPosting] = useState(false); // Trạng thái đang đăng bài
  const [isUploading, setIsUploading] = useState(false); // Trạng thái đang tải ảnh/video
  const [searchQuery, setSearchQuery] = useState(""); // Từ khóa tìm kiếm bạn bè
  const [filtered, setFiltered] = useState([]); // Danh sách bạn bè đã lọc
  const [selectedOption, setSelectedOption] = useState({
    status: 1,
    name: "Công khai",
  }); // Trạng thái bài viết
  const [caption, setCaption] = useState(""); // Nội dung bài viết
  const [medias, setMedias] = useState([]); // Danh sách URL ảnh/video
  const [typePost, setTypePost] = useState("Normal"); // Loại bài viết
  const [tags, setTags] = useState([]); // Danh sách ID người được gắn thẻ
  const [error, setError] = useState(null); // Lỗi khi tải bạn bè

  // API Hugging Face (chưa dùng)
  const MODEL_URL =
    "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5";
  const API_KEY = "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";

  // Tải danh sách bạn bè từ API
  const callGetAllFriendOfID_user = async () => {
    try {
      const response = await dispatch(
        getAllFriendOfID_user({ me: me._id, token })
      ).unwrap();
      console.log("Danh sách bạn bè:", response.relationships);
      setFriends(response.relationships || []);
      setError(null);
    } catch (error) {
      console.error("Lỗi tải danh sách bạn bè:", error);
      setFriends([]);
      setError("Không thể tải danh sách bạn bè. Vui lòng thử lại.");
    }
  };

  // Tải bạn bè khi mở modal gắn thẻ
  useEffect(() => {
    if (tagVisible && !friends) {
      callGetAllFriendOfID_user();
    }
  }, [tagVisible]);

  // Lọc bạn bè theo từ khóa tìm kiếm
  useEffect(() => {
    if (!friends) {
      setFiltered([]);
      return;
    }
    if (!searchQuery.trim()) {
      setFiltered(friends);
    } else {
      const filteredFriends = friends.filter((user) => {
        const friend =
          user.ID_userA._id === me._id ? user.ID_userB : user.ID_userA;
        if (!friend) return false;
        const fullName = `${friend.first_name || ""} ${friend.last_name || ""
          }`.toLowerCase();
        return normalizeText(fullName).includes(
          normalizeText(searchQuery).toLowerCase()
        );
      });
      setFiltered(filteredFriends);
    }
  }, [searchQuery, friends, me]);

  // Chuyển ArrayBuffer thành base64
  const arrayBufferToBase64 = (buffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Tải file lên Cloudinary
  const uploadFile = async (file) => {
    if (!file || !file.type || !file.name) {
      console.error("File không hợp lệ:", file);
      return null;
    }
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "ml_default");
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/ddasyg5z3/upload",
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return response.data.secure_url;
    } catch (error) {
      console.error("Lỗi tải file lên Cloudinary:", error.message);
      alert(
        `Lỗi tải file: ${error.response?.data?.error?.message || "Lỗi không xác định"
        }`
      );
      return null;
    }
  };

  // Xử lý chọn ảnh/video từ máy
  const onOpenGallery = (e) => {
    if (isUploading || isPosting) return; // Ngăn chọn file khi đang loading
    const files = Array.from(e.target.files).slice(0, 10); // Giới hạn 5 file
    if (files.length === 0) {
      console.error("Không có file nào được chọn");
      return;
    }
    uploadMultipleFiles(files);
  };

  // Tải nhiều file lên Cloudinary
  const uploadMultipleFiles = async (files) => {
    setIsUploading(true); // Bắt đầu loading
    try {
      const uploadedUrls = await Promise.all(
        files.map(async (file) => await uploadFile(file))
      );
      const validUrls = uploadedUrls.filter((url) => url !== null);
      setMedias((prev) => [...prev, ...validUrls]);
    } catch (error) {
      console.error("Lỗi tải nhiều file:", error.message);
    } finally {
      setIsUploading(false); // Kết thúc loading
    }
  };

  // Xóa ảnh khỏi danh sách
  const removeMedia = (index) => {
    if (isUploading || isPosting) return; // Ngăn xóa khi đang loading
    setMedias((prev) => prev.filter((_, i) => i !== index));
  };

  // Đăng bài viết
  const callAddPost = async () => {
    if (caption === "" && medias.length === 0 && tags.length === 0) {
      alert("Vui lòng thêm nội dung, ảnh/video hoặc gắn thẻ để đăng bài.");
      return;
    }
    setIsPosting(true);
    try {
      const paramsAPI = {
        ID_user: me._id,
        caption,
        medias,
        status: selectedOption.name,
        type: typePost,
        ID_post_shared: null,
        tags,
      };
      await dispatch(addPost(paramsAPI)).unwrap();
      setTimeout(() => {
        onClose();
        navigate("/", { state: { refresh: true } });
        setCaption("");
        setMedias([]);
        setTags([]);
        setTypePost("Normal");
        setSelectedOption({ status: 1, name: "Công khai" });
        window.location.reload(); // Reload trang
      }, 2000);
    } catch (error) {
      console.error("Lỗi đăng bài:", error.message);
      alert("Đăng bài thất bại. Vui lòng thử lại.");
    } finally {
      setIsPosting(false);
    }
  };

  // Chọn/bỏ chọn bạn bè để gắn thẻ
  const toggleSelectUser = (id) => {
    if (isUploading || isPosting) return; // Ngăn tương tác khi đang loading
    if (!id) {
      console.error("ID người dùng không hợp lệ:", id);
      return;
    }
    setTempSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
    );
  };

  // Xác nhận gắn thẻ
  const handleAddTag = () => {
    if (isUploading || isPosting) return; // Ngăn tương tác khi đang loading
    setTypePost("Tag");
    setSelectedUsers(tempSelectedUsers);
    setTags(tempSelectedUsers);
    setTagVisible(false);
    console.log("Đã gắn thẻ:", tempSelectedUsers);
  };

  // Chọn trạng thái bài viết
  const handleSelectOption = (option) => {
    if (isUploading || isPosting) return; // Ngăn tương tác khi đang loading
    setSelectedOption(option);
    setModalVisible(false);
  };

  // Chuẩn hóa văn bản để tìm kiếm
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };

  // Định dạng danh sách bạn bè để hiển thị
  const formattedFriends =
    friends?.map((friend) => ({
      _id:
        friend.ID_userA._id === me._id
          ? friend.ID_userB._id
          : friend.ID_userA._id,
      first_name:
        friend.ID_userA._id === me._id
          ? friend.ID_userB.first_name
          : friend.ID_userA.first_name,
      last_name:
        friend.ID_userA._id === me._id
          ? friend.ID_userB.last_name
          : friend.ID_userA.last_name,
    })) || [];

  // Danh sách trạng thái bài viết
  const postStatusOptions = [
    { status: 1, name: "Công khai" },
    { status: 2, name: "Bạn bè" },
    { status: 3, name: "Chỉ mình tôi" },
  ];

  // Xử lý đóng dialog và xóa nội dung
  const handleClose = () => {
    if (isUploading || isPosting) return; // Ngăn đóng khi đang loading
    setCaption(""); // Xóa nội dung TextField
    setMedias([]); // Xóa danh sách ảnh
    onClose(); // Gọi hàm đóng dialog từ props
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {(isUploading || isPosting) && (
          <div className={styles.loadingOverlay}>
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              size="2x"
              className={styles.spinner}
            />
            <span className={styles.loadingText}>
              {isUploading ? "Đang tải ảnh/video..." : "Đang đăng bài..."}
            </span>
          </div>
        )}
        <div className={styles.header}>
          <div className={styles.boxBack}>
            <button
              onClick={handleClose}
              className={styles.backButton}
              disabled={isUploading || isPosting}
            >
              <FontAwesomeIcon icon={faArrowLeft} size="lg" />
            </button>
            <span className={styles.txtCreate}>Tạo bài viết</span>
          </div>
          <button
            className={
              caption === "" && medias.length === 0 && tags.length === 0
                ? styles.btnPost
                : styles.btnPostActive
            }
            onClick={callAddPost}
            disabled={
              (caption === "" && medias.length === 0 && tags.length === 0) ||
              isUploading ||
              isPosting
            }
          >
            {isPosting ? "Đang đăng..." : "Đăng bài"}
          </button>
        </div>
        <div className={styles.line}></div>
        <div className={styles.boxMargin}>
          <div className={styles.boxInfor}>
            <img className={styles.avatar} src={me.avatar} alt="Avatar" />
            <div className={styles.userInfo}>
              <span className={styles.txtName}>
                {me.first_name} {me.last_name}
                {tags.length > 0 && (
                  <>
                    <span className={styles.grayText}> cùng với </span>
                    <span className={styles.boldText}>
                      {(() => {
                        const taggedUser = formattedFriends.find(
                          (friend) => friend._id === tags[0]
                        );
                        return `${taggedUser?.first_name || ""} ${taggedUser?.last_name || ""
                          }`;
                      })()}
                    </span>
                    {tags.length > 1 && (
                      <>
                        <span className={styles.grayText}> và </span>
                        <span className={styles.boldText}>
                          {tags.length - 1} người khác
                        </span>
                      </>
                    )}
                  </>
                )}
              </span>
              <div className={styles.boxStatus}>
                <button
                  className={styles.btnStatus}
                  onClick={() => setModalVisible(true)}
                  disabled={isUploading || isPosting}
                >
                  {selectedOption.name}
                </button>
              </div>
            </div>
          </div>
          <TextField
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Bạn đang nghĩ gì?"
            className={styles.txtInput}
            multiline
            rows={4}
            disabled={isUploading || isPosting}
          />
          <div
            className={`${styles.mediaPreview} media-preview-${medias.length}`}
          >
            {medias.map((url, index) => (
              <div key={index} className={styles.mediaItem}>
                {url.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video src={url} className={styles.previewImage} controls />
                ) : (
                  <img src={url} alt="Media" className={styles.previewImage} />
                )}
                <button
                  className={styles.removeButton}
                  onClick={() => removeMedia(index)}
                  title="Xóa ảnh"
                  disabled={isUploading || isPosting}
                >
                  <FontAwesomeIcon icon={faTimes} size="sm" />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.boxItems}>
          <button
            className={styles.btnIcon}
            onClick={() => document.getElementById("fileInput").click()}
            disabled={isUploading || isPosting}
          >
            <FontAwesomeIcon icon={faImage} size="lg" color="#33a850" />
            <span className={styles.txtIcon}>Ảnh/video</span>
          </button>
          <input
            id="fileInput"
            type="file"
            accept="image/*,video/*"
            multiple
            style={{ display: "none" }}
            onChange={onOpenGallery}
            disabled={isUploading || isPosting}
          />
          <div className={styles.lineVertical}></div>
          <button
            className={styles.btnIcon}
            onClick={() => setTagVisible(true)}
            disabled={isUploading || isPosting}
          >
            <FontAwesomeIcon icon={faTag} size="lg" color="#48a1ff" />
            <span className={styles.txtIcon}>Gắn thẻ</span>
          </button>
        </div>
      </div>

      {/* Modal trạng thái */}
      {modalVisible && (
        <div
          className={styles.subModalOverlay}
          onClick={(e) => {
            e.stopPropagation(); // Ngăn sự kiện lan truyền đến modalOverlay
            setModalVisible(false); // Chỉ đóng modal trạng thái
          }}
        >
          <div
            className={styles.subModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            {postStatusOptions.map((option, index) => (
              <button
                key={index}
                className={styles.optionButton}
                onClick={() => handleSelectOption(option)}
                disabled={isUploading || isPosting}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modal gắn thẻ */}
      {tagVisible && (
        <div
          className={styles.subModalOverlay}
          onClick={() => setTagVisible(false)}
        >
          <div
            className={styles.subModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.boxTag}>
              <div className={styles.search}>
                <FontAwesomeIcon icon={faSearch} size="lg" />
                <input
                  placeholder="Tìm kiếm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                  disabled={isUploading || isPosting}
                />
              </div>
              <button
                className={styles.btnTag}
                onClick={handleAddTag}
                disabled={isUploading || isPosting}
              >
                Gắn thẻ
              </button>
            </div>
            <div className={styles.friendList}>
              {error && <div className={styles.error}>{error}</div>}
              {filtered.length === 0 && !error ? (
                <div>Không tìm thấy bạn bè</div>
              ) : (
                filtered.map((item) => {
                  const friend =
                    item.ID_userA._id === me._id
                      ? item.ID_userB
                      : item.ID_userA;
                  return (
                    <div
                      key={friend._id}
                      className={`${styles.friendItem} ${tempSelectedUsers.includes(friend._id)
                        ? styles.selected
                        : ""
                        }`}
                      onClick={() => toggleSelectUser(friend._id)}
                    >
                      <img
                        src={friend.avatar}
                        alt={`${friend.first_name} ${friend.last_name}`}
                        className={styles.friendAvatar}
                      />
                      <span>
                        {friend.first_name} {friend.last_name}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpPost;