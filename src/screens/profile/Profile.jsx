import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, changeAvatar, changeBackground } from "../../rtk/Reducer";
import {
  FaVideo,
  FaPhotoVideo,
  FaFlag,
  FaCamera,
  FaSmile,
  FaHome,
  FaSearch,
  FaUsers,
  FaPlusCircle,
  FaTh,
  FaBell,
  FaFacebookMessenger,
  FaUser,
  FaLink,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import {
  allProfile,
  editAvatarOfUser,
  editBackgroundOfUser,
  editBioOfUser,
  guiLoiMoiKetBan,
  chapNhanLoiMoiKetBan,
  huyLoiMoiKetBan,
  huyBanBe,
  changeDestroyPost,
  addPost_Reaction,
  deletePost_reaction,
  getAllFriendOfID_user,
} from "../../rtk/API";
import "../../styles/screens/profile/Profile.css";
import axios from "axios";
import PostProfile from "../../components/items/PostProfile";

const Profile = () => {
  const { id } = useParams(); // Lấy ID từ URL
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const me = useSelector((state) => state.app.user);

  // State
  const [inputValue, setInputValue] = useState("");
  const [activeIcon, setActiveIcon] = useState(
    location.pathname === "/" ? "home" : "profile"
  );
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [friends, setFriends] = useState([]);
  const [relationship, setRelationship] = useState(null);
  const [bio, setBio] = useState("");
  const [isEditBio, setIsEditBio] = useState(false);
  const [isImageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [stories, setStories] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Cập nhật thời gian mỗi 10 giây
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Hàm xử lý input tìm kiếm
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Hàm nhấn avatar
  const handleAvatarClick = () => {
    setActiveIcon("profile");
    navigate("/profile");
  };

  // Hàm đăng xuất
  const handleLogout = () => {
    dispatch(logout());
  };

  // Hàm upload ảnh lên Cloudinary
  const uploadFile = async (file) => {
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "ml_default");

      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/ddbolgs7p/upload",
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (!response.data.secure_url) {
        throw new Error("Không nhận được secure_url từ Cloudinary!");
      }
      return response.data.secure_url;
    } catch (error) {
      console.error("Lỗi uploadFile:", error.message);
      return null;
    }
  };

  // Hàm đổi ảnh đại diện
  const onChangeAvatar = async (e) => {
    try {
      setLoading(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileUrl = await uploadFile(file);
      if (!fileUrl) {
        setErrorMessage("Upload ảnh thất bại!");
        setLoading(false);
        return;
      }

      const data = { ID_user: me._id, avatar: fileUrl };
      dispatch(editAvatarOfUser(data))
        .unwrap()
        .then((res) => {
          if (res.status) {
            dispatch(changeAvatar(fileUrl));
            setUser((prev) => ({ ...prev, avatar: fileUrl }));
            setSuccessMessage("Đổi ảnh đại diện thành công!");
          } else {
            setErrorMessage("Đổi ảnh đại diện thất bại!");
          }
          setLoading(false);
        })
        .catch((err) => {
          setErrorMessage("Lỗi khi đổi ảnh đại diện!");
          setLoading(false);
        });
    } catch (error) {
      setErrorMessage("Lỗi khi xử lý ảnh!");
      setLoading(false);
    }
  };

  // Hàm đổi ảnh bìa
  const onChangeBackground = async (e) => {
    try {
      setLoading(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileUrl = await uploadFile(file);
      if (!fileUrl) {
        setErrorMessage("Upload ảnh thất bại!");
        setLoading(false);
        return;
      }

      const data = { ID_user: me._id, background: fileUrl };
      dispatch(editBackgroundOfUser(data))
        .unwrap()
        .then((res) => {
          if (res.status) {
            dispatch(changeBackground(fileUrl));
            setUser((prev) => ({ ...prev, background: fileUrl }));
            setSuccessMessage("Đổi ảnh bìa thành công!");
          } else {
            setErrorMessage("Đổi ảnh bìa thất bại!");
          }
          setLoading(false);
        })
        .catch((err) => {
          setErrorMessage("Lỗi khi đổi ảnh bìa!");
          setLoading(false);
        });
    } catch (error) {
      setErrorMessage("Lỗi khi xử lý ảnh!");
      setLoading(false);
    }
  };

  // Hàm chỉnh sửa bio
  const handleEditBio = async (newBio) => {
    try {
      const data = { ID_user: me._id, bio: newBio };
      dispatch(editBioOfUser(data))
        .unwrap()
        .then((res) => {
          setBio(newBio);
          setIsEditBio(false);
          setSuccessMessage("Cập nhật bio thành công!");
        })
        .catch((err) => {
          setErrorMessage("Lỗi khi cập nhật bio!");
        });
    } catch (error) {
      setErrorMessage("Lỗi khi xử lý bio!");
    }
  };

  // Hàm gửi lời mời kết bạn
  const handleSendFriendRequest = async () => {
    try {
      const paramsAPI = { ID_relationship: relationship?._id, me: me._id };
      dispatch(guiLoiMoiKetBan(paramsAPI))
        .unwrap()
        .then((res) => {
          setRelationship(res.relationship);
          setSuccessMessage("Lời mời đã được gửi!");
        })
        .catch((err) => {
          setErrorMessage("Lỗi khi gửi lời mời!");
        });
    } catch (error) {
      setErrorMessage("Lỗi khi xử lý!");
    }
  };

  // Hàm chấp nhận lời mời kết bạn
  const handleAcceptFriendRequest = async () => {
    try {
      const paramsAPI = { ID_relationship: relationship?._id };
      dispatch(chapNhanLoiMoiKetBan(paramsAPI))
        .unwrap()
        .then((res) => {
          setRelationship(res.relationship);
          setSuccessMessage("Đã chấp nhận lời mời kết bạn!");
        })
        .catch((err) => {
          setErrorMessage("Lỗi khi chấp nhận lời mời!");
        });
    } catch (error) {
      setErrorMessage("Lỗi khi xử lý!");
    }
  };

  // Hàm hủy lời mời kết bạn
  const handleCancelFriendRequest = async () => {
    try {
      const paramsAPI = { ID_relationship: relationship?._id };
      dispatch(huyLoiMoiKetBan(paramsAPI))
        .unwrap()
        .then((res) => {
          setRelationship(res.relationship);
          setSuccessMessage("Đã hủy lời mời kết bạn!");
        })
        .catch((err) => {
          setErrorMessage("Lỗi khi hủy lời mời!");
        });
    } catch (error) {
      setErrorMessage("Lỗi khi xử lý!");
    }
  };

  // Hàm hủy bạn bè
  const handleUnfriend = async () => {
    try {
      const paramsAPI = { ID_relationship: relationship?._id };
      dispatch(huyBanBe(paramsAPI))
        .unwrap()
        .then((res) => {
          setRelationship(res.relationship);
          setSuccessMessage("Đã hủy bạn bè!");
          fetchProfileData();
        })
        .catch((err) => {
          setErrorMessage("Lỗi khi hủy bạn bè!");
        });
    } catch (error) {
      setErrorMessage("Lỗi khi xử lý!");
    }
  };

  // Hàm xóa bài đăng
  const handleDeletePost = async (postId) => {
    try {
      dispatch(changeDestroyPost({ _id: postId }))
        .unwrap()
        .then(() => {
          setPosts((prev) =>
            prev.map((post) =>
              post._id === postId ? { ...post, _destroy: true } : post
            )
          );
          setSuccessMessage("Đã xóa bài đăng!");
        })
        .catch((err) => {
          setErrorMessage("Lỗi khi xóa bài đăng!");
        });
    } catch (error) {
      setErrorMessage("Lỗi khi xử lý!");
    }
  };

  // Hàm xóa vĩnh viễn bài đăng
  const handleDeletePermanently = async (postId) => {
    try {
      dispatch(changeDestroyPost({ _id: postId, permanent: true }))
        .unwrap()
        .then(() => {
          setPosts((prev) => prev.filter((post) => post._id !== postId));
          setSuccessMessage("Đã xóa vĩnh viễn bài đăng!");
        })
        .catch((err) => {
          setErrorMessage("Lỗi khi xóa vĩnh viễn bài đăng!");
        });
    } catch (error) {
      setErrorMessage("Lỗi khi xử lý!");
    }
  };

  // Hàm cập nhật reaction
  const updatePostReaction = (postId, reaction, reactionId) => {
    setPosts((prev) =>
      prev.map((post) =>
        post._id === postId
          ? {
            ...post,
            post_reactions: [
              ...post.post_reactions,
              {
                _id: reactionId,
                ID_user: {
                  _id: me._id,
                  first_name: me.first_name,
                  last_name: me.last_name,
                  avatar: me.avatar,
                },
                ID_reaction: reaction,
                quantity: 1,
              },
            ],
          }
          : post
      )
    );
  };

  // Hàm xóa reaction
  const deletePostReaction = (postId, reactionId) => {
    setPosts((prev) =>
      prev.map((post) =>
        post._id === postId
          ? {
            ...post,
            post_reactions: post.post_reactions.filter(
              (reaction) => reaction._id !== reactionId
            ),
          }
          : post
      )
    );
  };

  // Hàm sao chép liên kết
  const copyToClipboard = () => {
    navigator.clipboard.writeText(
      `https://linkage.id.vn/deeplink?url=linkage://profile?ID_user=${me?._id}`
    );
    setSuccessMessage("Đã sao chép liên kết!");
  };

  // Hàm lấy dữ liệu profile
  // Hàm lấy dữ liệu profile
  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      // Sử dụng id từ URL, nếu không có thì dùng me._id
      const profileId = id || me._id;
      const paramsAPI = { ID_user: profileId, me: me._id };
      dispatch(allProfile(paramsAPI))
        .unwrap()
        .then((response) => {
          setUser(response.user);
          setPosts(response.posts);
          setRelationship(response.relationship);

          // Biến đổi friends để lấy thông tin của người kia
          const transformedFriends = response.friends.map((relationship) => {
            const otherUser =
              relationship.ID_userA._id === profileId
                ? relationship.ID_userB
                : relationship.ID_userA;

            return {
              id: otherUser._id,
              image: otherUser.avatar,
              name: `${otherUser.first_name} ${otherUser.last_name}`,
            };
          });

          setFriends(transformedFriends);
          setBio(response.user.bio || "");
          setStories({
            user: {
              _id: response.user._id,
              avatar: response.user.avatar,
              first_name: response.user.first_name,
              last_name: response.user.last_name,
            },
            stories: response.stories || [],
          });
          setLoading(false);
        })
        .catch((err) => {
          setErrorMessage("Lỗi khi tải dữ liệu profile!");
          setLoading(false);
        });
    } catch (error) {
      setErrorMessage("Lỗi khi xử lý!");
      setLoading(false);
    }
  }, [dispatch, me, id]);

  // Gọi dữ liệu khi component mount
  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // Hiển thị ảnh lớn
  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageModalVisible(true);
  };

  // Đóng modal ảnh
  const closeImageModal = () => {
    setImageModalVisible(false);
    setSelectedImage(null);
  };

  return (
    <div className="profile-container">
      {/* Thông báo */}
      {successMessage && (
        <div className="snackbar success">{successMessage}</div>
      )}
      {errorMessage && <div className="snackbar error">{errorMessage}</div>}
      {/* Ảnh bìa */}
      <div className="cover-photo-container">
        <img
          src={
            user?.background ||
            "https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg"
          }
          alt="Cover Photo"
          className="cover-photo"
          onClick={() => openImageModal(user?.background)}
        />
        {user?._id === me._id && (
          <label className="cover-photo-button">
            <FaCamera /> Edit cover photo
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={onChangeBackground}
            />
          </label>
        )}
      </div>

      {/* Thông tin hồ sơ */}
      <div className="profile-info-container">
        <div className="profile-pic-wrapper">
          <img
            src={
              user?.avatar ||
              "https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg"
            }
            alt="Profile"
            className="profile-pic"
            onClick={() => openImageModal(user?.avatar)}
          />
          {user?._id === me._id && (
            <label className="camera-icon">
              <FaCamera />
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={onChangeAvatar}
              />
            </label>
          )}
        </div>
        <div className="profile-details">
          <div className="name-and-friends">
            <h1 className="name">{`${user?.first_name || ""} ${user?.last_name || ""
              }`}</h1>
            <p className="friends-count">{friends.length} friends</p>
          </div>
          <div className="action-buttons">
            {user?._id === me._id ? (
              <>
                <button
                  className="story-button"
                  onClick={() => navigate("/post-story")}
                >
                  + Thêm vào tin
                </button>
                <button
                  className="edit-profile-button"
                  onClick={() => setIsEditBio(true)}
                >
                  Chỉnh sửa trang cá nhân
                </button>
              </>
            ) : (
              <>
                {relationship?.relation === "Người lạ" && (
                  <button
                    className="story-button"
                    onClick={handleSendFriendRequest}
                  >
                    + Thêm bạn bè
                  </button>
                )}
                {relationship?.relation === "Bạn bè" && (
                  <button className="story-button" onClick={handleUnfriend}>
                    Hủy bạn bè
                  </button>
                )}
                {(relationship?.relation === "A gửi lời kết bạn B" ||
                  relationship?.relation === "B gửi lời kết bạn A") && (
                    <button
                      className="story-button"
                      onClick={handleCancelFriendRequest}
                    >
                      Hủy lời mời
                    </button>
                  )}
                {(relationship?.relation === "B gửi lời kết bạn A" ||
                  relationship?.relation === "A gửi lời kết bạn B") && (
                    <button
                      className="story-button"
                      onClick={handleAcceptFriendRequest}
                    >
                      + Phản hồi
                    </button>
                  )}
                <button
                  className="edit-profile-button"
                  onClick={() => navigate("/chat")}
                >
                  Nhắn tin
                </button>
              </>
            )}
            <button className="more-button" onClick={copyToClipboard}>
              <FaLink /> Sao chép liên kết
            </button>
          </div>
        </div>
      </div>

      {/* Modal xem ảnh lớn */}
      {isImageModalVisible && (
        <div className="post-modal-container">
          <div className="modal-background" onClick={closeImageModal}></div>
          <img src={selectedImage} alt="Full Image" className="full-image" />
          <button className="close-button-full-image" onClick={closeImageModal}>
            ✕
          </button>
        </div>
      )}

      {/* Modal chỉnh sửa bio */}
      {isEditBio && (
        <div className="post-modal-container">
          {/* <div
            className="modal-background"
            onClick={() => setIsEditBio(false)}
          ></div> */}
          <div className="modal-dialog">
            <h3>Chỉnh sửa Bio</h3>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Nhập miêu tả..."
              className="bio-input"
            />
            <div className="modal-actions">
              <button
                onClick={() => handleEditBio(bio)}
                className="confirm-button"
              >
                Lưu
              </button>
              <button
                onClick={() => {
                  setBio(user?.bio || "");
                  setIsEditBio(false);
                }}
                className="cancel-button"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thanh tab */}
      <div className="tabs-container">
        <button className="tab active-tab">Posts</button>
        <button className="tab" onClick={() => navigate("/friend")}>
          Friends
        </button>
        <button className="tab">More ▼</button>
      </div>

      {/* Nội dung chính */}
      <div className="content-container">
        {/* Cột trái */}
        <div className="left-column">
          <div className="intro-section">
            <h2 className="section-title">Giới thiệu</h2>
            <p className="intro-text">{bio || "Chưa có bio"}</p>
          </div>
          <div className="friends-section">
            <div className="friends-header">
              <h2 className="section-title">Bạn bè</h2>
              <p className="friends-count">{friends.length} Bạn bè</p>
              <button
                className="see-all-button"
                onClick={() => navigate("/friend")}
              >
                Xem tất cả bạn bè
              </button>
            </div>
            <div className="friends-grid">
              {/* Hàng 1: 3 người bạn đầu tiên */}
              <div className="friends-row">
                {friends.slice(0, 3).map((friend) => (
                  <div key={friend.id} className="friend-item">
                    <img
                      src={friend.image}
                      alt={friend.name}
                      className="friend-pic"
                      onClick={() => navigate(`/profile/${friend.id}`)}
                      style={{ cursor: "pointer" }}
                    />
                    <p
                      className="friend-name"
                      onClick={() => navigate(`/profile/${friend.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      {friend.name}
                    </p>
                  </div>
                ))}
              </div>
              {/* Hàng 2: 3 người bạn tiếp theo */}
              <div className="friends-row">
                {friends.slice(3, 6).map((friend) => (
                  <div key={friend.id} className="friend-item">
                    <img
                      src={friend.image}
                      alt={friend.name}
                      className="friend-pic"
                      onClick={() => navigate(`/profile/${friend.id}`)}
                      style={{ cursor: "pointer" }}
                    />
                    <p
                      className="friend-name"
                      onClick={() => navigate(`/profile/${friend.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      {friend.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải */}
        <div className="right-column">
          <div className="posts-section">
            <div className="posts-header">
              <h2 className="section-title">Bài viết</h2>
              <div className="posts-options">
                <button
                  className="manage-posts-button"
                  onClick={() => navigate("/trash")}
                >
                  Quản lý bài viết
                </button>
              </div>
            </div>
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostProfile
                  key={post._id}
                  post={post}
                  ID_user={me._id}
                  currentTime={currentTime}
                  onDelete={() => handleDeletePost(post._id)}
                  onDeleteVinhVien={() => handleDeletePermanently(post._id)}
                  updatePostReaction={updatePostReaction}
                  deletPostReaction={deletePostReaction}
                />
              ))
            ) : (
              <p>Chưa có bài đăng nào.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;