import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addPost, getAllFriendOfID_user } from "../../rtk/API";
import axios from "axios";
import { FaArrowLeft, FaSearch, FaTag, FaImage } from "react-icons/fa";
import styles from "../../styles/components/dialogs/UpPost.module.css";

const UpPost = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.app.token);
  const me = useSelector((state) => state.app.user);

  const [modalVisible, setModalVisible] = useState(false);
  const [tagVisible, setTagVisible] = useState(false);
  const [friends, setFriends] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [tempSelectedUsers, setTempSelectedUsers] = useState([]);
  const [modalVisibleAI, setModalVisibleAI] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [selectedOption, setSelectedOption] = useState({
    status: 1,
    name: "Công khai",
  });
  const [caption, setCaption] = useState("");
  const [medias, setMedias] = useState([]);
  const [typePost, setTypePost] = useState("Normal");
  const [tags, setTags] = useState([]);
  const [error, setError] = useState(null);

  // API Hugging Face
  const MODEL_URL = "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5";
  const API_KEY = "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";

  // Tải danh sách bạn bè
  const callGetAllFriendOfID_user = async () => {
    try {
      const response = await dispatch(
        getAllFriendOfID_user({ me: me._id, token })
      ).unwrap();
      console.log("Fetched friends:", response.relationships);
      setFriends(response.relationships || []);
      setError(null);
    } catch (error) {
      console.error("Error getAllFriendOfID_user:", error);
      setFriends([]);
      setError("Không thể tải danh sách bạn bè. Vui lòng thử lại.");
    }
  };

  // useEffect để tải bạn bè
  useEffect(() => {
    if (tagVisible && !friends) {
      callGetAllFriendOfID_user();
    }
  }, [tagVisible]);

  // Logic lọc bạn bè
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
        const fullName = `${friend.first_name || ""} ${
          friend.last_name || ""
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
        `Lỗi tải file: ${
          error.response?.data?.error?.message || "Lỗi không xác định"
        }`
      );
      return null;
    }
  };

  // Chọn ảnh/video từ máy
  const onOpenGallery = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) {
      console.error("Không có file nào được chọn");
      return;
    }
    uploadMultipleFiles(files);
  };

  // Tải nhiều file
  const uploadMultipleFiles = async (files) => {
    try {
      const uploadedUrls = await Promise.all(
        files.map(async (file) => await uploadFile(file))
      );
      const validUrls = uploadedUrls.filter((url) => url !== null);
      setMedias((prev) => [...prev, ...validUrls]);
    } catch (error) {
      console.error("Lỗi uploadMultipleFiles:", error.message);
    }
  };

  // Đăng bài
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
      }, 2000);
    } catch (error) {
      console.error("Error addPost:", error.message);
      alert("Đăng bài thất bại. Vui lòng thử lại.");
    } finally {
      setIsPosting(false);
    }
  };

  // Chọn bạn bè
  const toggleSelectUser = (id) => {
    if (!id) {
      console.error("Invalid user ID:", id);
      return;
    }
    setTempSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
    );
  };

  // Xác nhận gắn thẻ
  const handleAddTag = () => {
    setTypePost("Tag");
    setSelectedUsers(tempSelectedUsers);
    setTags(tempSelectedUsers);
    setTagVisible(false);
    console.log("Confirmed tags:", tempSelectedUsers);
  };

  // Chọn trạng thái
  const handleSelectOption = (option) => {
    setSelectedOption(option);
    setModalVisible(false);
  };

  // Chuẩn hóa chuỗi tìm kiếm
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };

  // Chuyển danh sách bạn bè thành định dạng hiển thị
  const formattedFriends = friends?.map((friend) => ({
    _id: friend.ID_userA._id === me._id ? friend.ID_userB._id : friend.ID_userA._id,
    first_name: friend.ID_userA._id === me._id ? friend.ID_userB.first_name : friend.ID_userA.first_name,
    last_name: friend.ID_userA._id === me._id ? friend.ID_userB.last_name : friend.ID_userA.last_name,
  })) || [];

  // Đổi tên mảng status thành postStatusOptions để tránh xung đột
  const postStatusOptions = [
    { status: 1, name: "Công khai" },
    { status: 2, name: "Bạn bè" },
    { status: 3, name: "Chỉ mình tôi" },
  ];

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.boxBack}>
            <button onClick={onClose} className={styles.backButton}>
              <FaArrowLeft size={20} />
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
              caption === "" && medias.length === 0 && tags.length === 0 || isPosting
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
                        return `${taggedUser?.first_name || ""} ${taggedUser?.last_name || ""}`;
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
                >
                  {selectedOption.name}
                </button>
              </div>
            </div>
          </div>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Bạn đang nghĩ gì?"
            className={styles.txtInput}
          />
          <div className={styles.mediaPreview}>
            {medias.map((url, index) => (
              <img
                key={index}
                src={url}
                alt="Media"
                style={{ width: 100, height: 100, margin: 5 }}
              />
            ))}
          </div>
        </div>
        <div className={styles.boxItems}>
          <button
            className={styles.btnIcon}
            onClick={() => document.getElementById("fileInput").click()}
          >
            <FaImage size={24} color="#33a850" />
            <span className={styles.txtIcon}>Ảnh/video</span>
          </button>
          <input
            id="fileInput"
            type="file"
            accept="image/*,video/*"
            multiple
            style={{ display: "none" }}
            onChange={onOpenGallery}
          />
          <div className={styles.lineVertical}></div>
          <button
            className={styles.btnIcon}
            onClick={() => setTagVisible(true)}
          >
            <FaTag size={24} color="#48a1ff" />
            <span className={styles.txtIcon}>Gắn thẻ</span>
          </button>
        </div>
      </div>

      {/* Modal trạng thái */}
      {modalVisible && (
        <div
          className={styles.subModalOverlay}
          onClick={() => setModalVisible(false)}
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
                <FaSearch size={20} />
                <input
                  placeholder="Tìm kiếm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <button className={styles.btnTag} onClick={handleAddTag}>
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
        item.ID_userA._id === me._id ? item.ID_userB : item.ID_userA;
      return (
        <div
          key={friend._id}
          className={`${styles.friendItem} ${
            tempSelectedUsers.includes(friend._id) ? styles.selected : ""
          }`}
          onClick={() => toggleSelectUser(friend._id)}
        >
          <img
            src={friend.avatar} // URL avatar hoặc ảnh mặc định
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

      {/* Modal AI */}
      {modalVisibleAI && (
        <div
          className={styles.subModalOverlay}
          onClick={() => setModalVisibleAI(false)}
        >
          <div
            className={styles.subModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <span className={styles.title}>Nhập mô tả</span>
            <input
              placeholder="Nhập nội dung..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className={styles.input}
            />
            <button
              className={styles.btnGenerate}
              onClick={() => {
                setModalVisibleAI(false);
              }}
            >
              Tạo ảnh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpPost;