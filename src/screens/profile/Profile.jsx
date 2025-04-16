import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { FaThumbsUp, FaComment, FaShare, FaEllipsisH } from "react-icons/fa";
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
import style from "../../styles/screens/profile/Profile.module.css";
import axios from "axios";
import Post from "../../components/items/Post";
import ReportDialog from "../../components/dialogs/ReportDialog"; // Import ReportDialog
import { Menu, MenuItem } from "@mui/material"; // Import Menu từ MUI

const Profile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const me = useSelector((state) => state.app.user);

  const [inputValue, setInputValue] = useState("");
  const [activeIcon, setActiveIcon] = useState(
    location.pathname === "/" ? "home" : "profile"
  );
  const [user, setUser] = useState(null);
  console.log("User: ", user);
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
  const [successFadeOut, setSuccessFadeOut] = useState(false);
  const [errorFadeOut, setErrorFadeOut] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [reportDialogOpen, setReportDialogOpen] = useState(false); // State cho ReportDialog
  const [anchorEl, setAnchorEl] = useState(null); // State cho menu ngữ cảnh
  

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleAvatarClick = () => {
    setActiveIcon("profile");
    navigate("/profile");
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const uploadFile = async (file) => {
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "ml_default");

      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/ddasyg5z3/upload",
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

  // Xử lý mở/đóng menu ngữ cảnh
  const handleMoreClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Xử lý mở ReportDialog
  const handleReportClick = () => {
    setReportDialogOpen(true);
    handleMenuClose();
  };

  // Xử lý đóng ReportDialog
  const handleReportDialogClose = () => {
    setReportDialogOpen(false);
  };

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(
      `https://linkage.id.vn/deeplink?url=linkage://profile?ID_user=${me?._id}`
    );
    setSuccessMessage("Đã sao chép liên kết!");
  };

  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      const profileId = id || me._id;
      const paramsAPI = { ID_user: profileId, me: me._id };
      dispatch(allProfile(paramsAPI))
        .unwrap()
        .then((response) => {
          setUser(response.user);
          setPosts(response.posts);
          setRelationship(response.relationship);

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

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageModalVisible(true);
  };

  const closeImageModal = () => {
    setImageModalVisible(false);
    setSelectedImage(null);
  };
  useEffect(() => {
    if (successMessage) {
      setSuccessFadeOut(false);
      const fadeTimer = setTimeout(() => {
        setSuccessFadeOut(true);
      }, 2700); // Bắt đầu fade-out trước 300ms
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setSuccessFadeOut(false);
      }, 3000);
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(timer);
      };
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      setErrorFadeOut(false);
      const fadeTimer = setTimeout(() => {
        setErrorFadeOut(true);
      }, 2700);
      const timer = setTimeout(() => {
        setErrorMessage("");
        setErrorFadeOut(false);
      }, 3000);
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(timer);
      };
    }
  }, [errorMessage]);

  return (
    <div className={style.profileContainer}>
      {/* Thông báo */}
      {successMessage && (
        <div
          className={`${style.snackbar} ${style.success} ${
            successFadeOut ? style.fadeOut : ""
          }`}
        >
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div
          className={`${style.snackbar} ${style.error} ${
            errorFadeOut ? style.fadeOut : ""
          }`}
        >
          {errorMessage}
        </div>
      )}
      {/* Ảnh bìa */}
      <div className={style.coverPhotoContainer}>
        {user?.background ? (
          <img
            src={user?.background}
            alt="Cover Photo"
            className={style.coverPhoto}
            onClick={() => openImageModal(user?.background)}
          />
        ) : (
          <div className={`${style.coverPhoto} ${style.noBackground}`} />
        )}
        {user?._id === me._id && (
          <label className={style.coverPhotoButton}>
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
      <div className={style.profileInfoContainer}>
        <div className={style.profilePicWrapper}>
          <img
            src={user?.avatar}
            alt="Profile"
            className={`${style.profilePic} ${
              !user?.avatar ? style.noBackground : ""
            }`}
            onClick={() => openImageModal(user?.avatar)}
          />
          {user?._id === me._id && (
            <label className={style.cameraIcon}>
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
        <div className={style.profileDetails}>
          <div className={style.nameAndFriends}>
            <h1 className={style.name}>{`${user?.first_name || ""} ${
              user?.last_name || ""
            }`}</h1>
            <p className={style.friendsCount}>{friends.length} friends</p>
          </div>
          <div className={style.actionButtons}>
            {user?._id === me._id ? (
              <>
                <button
                  className={style.storyButton}
                  onClick={() => navigate("/post-story")}
                >
                  + Thêm vào tin
                </button>
                <button
                  className={style.editProfileButton}
                  onClick={() => setIsEditBio(true)}
                >
                  Chỉnh sửa trang cá nhân
                </button>
              </>
            ) : (
              <>
                {relationship?.relation === "Người lạ" && (
                  <button
                    className={style.storyButton}
                    onClick={handleSendFriendRequest}
                  >
                    + Thêm bạn bè
                  </button>
                )}
                {relationship?.relation === "Bạn bè" && (
                  <button
                    className={style.storyButton}
                    onClick={handleUnfriend}
                  >
                    Hủy bạn bè
                  </button>
                )}
                {((relationship?.ID_userA == me?._id &&
                  relationship?.relation === "A gửi lời kết bạn B") ||
                  (relationship?.ID_userB == me?._id &&
                    relationship?.relation === "B gửi lời kết bạn A")) && (
                  <button
                    className="story-button"
                    onClick={handleCancelFriendRequest}
                  >
                    Hủy lời mời
                  </button>
                )}
                {((relationship?.ID_userA == me?._id &&
                  relationship?.relation === "B gửi lời kết bạn A") ||
                  (relationship?.ID_userB == me?._id &&
                    relationship?.relation === "A gửi lời kết bạn B")) && (
                  <button
                    className="story-button"
                    onClick={handleCancelFriendRequest}
                  >
                    Hủy lời mời kết bạn
                  </button>
                )}
                {((relationship?.ID_userA == me?._id &&
                  relationship?.relation === "B gửi lời kết bạn A") ||
                  (relationship?.ID_userB == me?._id &&
                    relationship?.relation === "A gửi lời kết bạn B")) && (
                  <button
                    className="story-button"
                    onClick={handleAcceptFriendRequest}
                  >
                    Đồng ý kết bạn
                  </button>
                )}
                <button
                  className={style.editProfileButton}
                  onClick={() => navigate("/chat")}
                >
                  Nhắn tin
                </button>
              </>
            )}
            <button className={style.moreButton} onClick={copyToClipboard}>
              <FaLink /> Sao chép liên kết
            </button>
          </div>
        </div>
      </div>

      {/* Modal xem ảnh lớn */}
      {isImageModalVisible && (
        <div className={style.postModalContainer}>
          <div
            className={style.modalBackground}
            onClick={closeImageModal}
          ></div>
          <img
            src={selectedImage}
            alt="Full Image"
            className={style.fullImage}
          />
          <button
            className={style.closeButtonFullImage}
            onClick={closeImageModal}
          >
            ✕
          </button>
        </div>
      )}

      {/* Modal chỉnh sửa bio */}
      {isEditBio && (
        <div className={style.postModalContainer}>
          <div className={style.modalDialog}>
            <h3>Chỉnh sửa Bio</h3>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Nhập miêu tả..."
              className={style.bioInput}
            />
            <div className={style.modalActions}>
              <button
                onClick={() => handleEditBio(bio)}
                className={style.confirmButton}
              >
                Lưu
              </button>
              <button
                onClick={() => {
                  setBio(user?.bio || "");
                  setIsEditBio(false);
                }}
                className={style.cancelButton}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

     {/* Thanh tab */}
<div className={style.tabsContainer}>
  <button className={`${style.tab} ${style.activeTab}`}>Posts</button>
  {user && me && user._id !== me._id && (
    <div>
      <button
        className={style.moreButton}
        onClick={handleMoreClick}
      >
        <FaEllipsisH size={22} />
      </button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          style: {
            width: "200px",
          },
        }}
      >
        <MenuItem onClick={handleReportClick}>
          <FaFlag style={{ marginRight: "8px" }} /> Báo cáo
        </MenuItem>
      </Menu>
    </div>
  )}
</div>

{/* ReportDialog */}
<div>
<ReportDialog open={reportDialogOpen} onClose={handleReportDialogClose} />
    </div>

      {/* Nội dung chính */}
      <div className={style.contentContainer}>
        {/* Cột trái */}
        <div className={style.leftColumn}>
          <div className={style.introSection}>
            <h2 className={style.sectionTitle}>Giới thiệu</h2>
            <p className={style.introText}>{bio || "Chưa có bio"}</p>
          </div>
          <div className={style.friendsSection}>
            <div className={style.friendsHeader}>
              <div>
                <h2 className={style.sectionTitle}>Bạn bè</h2>
                <p className={style.friendsCount}>{friends.length} Bạn bè</p>
              </div>
              <button
                className={style.seeAllButton}
                onClick={() => navigate("/friend")}
              >
                Xem tất cả bạn bè
              </button>
            </div>
            <div className={style.friendsGrid}>
              {/* Hàng 1: 3 người bạn đầu tiên */}
              <div className={style.friendsRow}>
                {friends.slice(0, 3).map((friend) => (
                  <div key={friend.id} className={style.friendItem}>
                    <img
                      src={friend.image}
                      alt={friend.name}
                      className={`${style.friendPic} ${style.cursorPointer}`}
                      onClick={() => navigate(`/profile/${friend.id}`)}
                    />
                    <p
                      className={`${style.friendName} ${style.cursorPointer}`}
                      onClick={() => navigate(`/profile/${friend.id}`)}
                    >
                      {friend.name}
                    </p>
                  </div>
                ))}
              </div>
              {/* Hàng 2: 3 người bạn tiếp theo */}
              <div className={style.friendsRow}>
                {friends.slice(3, 6).map((friend) => (
                  <div key={friend.id} className={style.friendItem}>
                    <img
                      src={friend.image}
                      alt={friend.name}
                      className={`${style.friendPic} ${style.cursorPointer}`}
                      onClick={() => navigate(`/profile/${friend.id}`)}
                    />
                    <p
                      className={`${style.friendName} ${style.cursorPointer}`}
                      onClick={() => navigate(`/profile/${friend.id}`)}
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
        <div className={style.rightColumn}>
          <div className={style.postsSection}>
            <div className={style.postsHeader}>
              <h2 className={style.sectionTitle}>Bài viết</h2>
              <div className={style.postsOptions}>
                <button
                  className={style.managePostsButton}
                  onClick={() => navigate("/trash")}
                >
                  Quản lý bài viết
                </button>
              </div>
            </div>
            {posts.length > 0 ? (
              posts.map((post) => (
                <Post
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
