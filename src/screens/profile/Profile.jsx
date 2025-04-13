import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../rtk/Reducer";
import {
  FaVideo,
  FaPhotoVideo,
  FaFlag,
  FaEllipsisH,
  FaCamera,
  FaThumbsUp,
  FaComment,
  FaShare,
  FaSmile,
  FaHome,
  FaSearch,
  FaStore,
  FaUsers,
  FaPlusCircle,
  FaTh,
  FaBell,
  FaFacebookMessenger,
  FaUser,
} from "react-icons/fa";
import styles from "../../styles/screens/profile/Profile.module.css";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [inputValue, setInputValue] = useState("");
  const [activeIcon, setActiveIcon] = useState(
    location.pathname === "/" ? "home" : "profile"
  );

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleAvatarClick = () => {
    setActiveIcon("profile");
    navigate("/profile");
  };

  const friends = [
    {
      id: 1,
      name: "Tô Quốc Khánh",
      image:
        "https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg",
    },
    {
      id: 2,
      name: "Tấn Tài",
      image:
        "https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg",
    },
    {
      id: 3,
      name: "Huỳnh Quốc Huy",
      image:
        "https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg",
    },
    {
      id: 4,
      name: "Nghĩa Nguyện",
      image:
        "https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg",
    },
    {
      id: 5,
      name: "Hiền Nguyện",
      image:
        "https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg",
    },
    {
      id: 6,
      name: "Voong Bà Thịnh",
      image:
        "https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg",
    },
    {
      id: 7,
      name: "Phan Trường Hoài Phúc",
      image:
        "https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg",
    },
    {
      id: 8,
      name: "Đỗ Minh Hiếu",
      image:
        "https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg",
    },
    {
      id: 9,
      name: "Bình Bùi",
      image:
        "https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg",
    },
  ];

  const posts = [
    {
      id: 1,
      author: "Quảng Thông",
      date: "10 April at 19:02",
      content: "Quảng Thông updated his profile picture.",
      image:
        "https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg",
    },
    {
      id: 2,
      author: "Quảng Thông",
      date: "10 April at 19:02",
      content: "Quảng Thông updated his profile picture.",
      image:
        "https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg",
    },
    {
      id: 3,
      author: "Quảng Thông",
      date: "10 April at 19:02",
      content: "Quảng Thông updated his profile picture.",
      image:
        "https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg",
    },
  ];

  return (
    <div className={styles.profileContainer}>
      {/* Cover Photo Section */}
      <div className={styles.coverPhotoContainer}>
        <img
          src="https://cdn.pixabay.com/photo/2017/05/09/03/46/alberta-2297204_640.jpg"
          alt="Cover Photo"
          className={styles.coverPhoto}
        />
        <button className={styles.coverPhotoButton}>
          <span role="img" aria-label="camera">
            📷
          </span>{" "}
          Edit cover photo
        </button>
      </div>

      {/* Profile Picture and Info */}
      <div className={styles.profileInfoContainer}>
        <div className={styles.profilePicWrapper}>
          <img
            src="https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg"
            alt="Profile"
            className={styles.profilePic}
          />
          <div className={styles.cameraIcon}>
            <FaCamera />
          </div>
        </div>
        <div className={styles.profileDetails}>
          <div className={styles.nameAndFriends}>
            <h1 className={styles.name}>Quảng Thông</h1>
            <p className={styles.friendsCount}>75 friends</p>
          </div>
          <div className={styles.actionButtons}>
            <button className={styles.storyButton}>+ Add to story</button>
            <button className={styles.editProfileButton}>Edit profile</button>
            <button className={styles.moreButton}>
              <FaEllipsisH />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs (Posts, About, Friends, etc.) */}
      <div className={styles.tabsContainer}>
        <button className={`${styles.tab} ${styles.activeTab}`}>Posts</button>
        <button className={styles.tab}>About</button>
        <button className={styles.tab}>Friends</button>
        <button className={styles.tab}>Photos</button>
        <button className={styles.tab}>Videos</button>
        <button className={styles.tab}>Check-ins</button>
        <button className={styles.tab}>
          More{" "}
          <span role="img" aria-label="dropdown">
            ▼
          </span>
        </button>
      </div>

      {/* Main Content */}
      <div className={styles.contentContainer}>
        {/* Left Column: Intro */}
        <div className={styles.leftColumn}>
          {/* Intro Section */}
          <div className={styles.introSection}>
            <h2 className={styles.sectionTitle}>Intro</h2>
            <p className={styles.introText}>12345</p>
            <button className={styles.editButton}>Edit Bio</button>
            <button className={styles.editButton}>Edit details</button>
          </div>
          {/* Friends Section */}
          <div className={styles.friendsSection}>
            <div className={styles.friendsHeader}>
              <h2 className={styles.sectionTitle}>Friends</h2>
              <p className={styles.friendsCount}>75 friends</p>
              <button className={styles.seeAllButton}>See all friends</button>
            </div>
            <div className={styles.friendsList}>
              {friends.map((friend) => (
                <div key={friend.id} className={styles.friendItem}>
                  <img
                    src={friend.image}
                    alt={friend.name}
                    className={styles.friendPic}
                  />
                  <p className={styles.friendName}>{friend.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Posts */}
        <div className={styles.rightColumn}>
          {/* Post Input */}
          <div className={styles.postInputContainer}>
            <img
              src="https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg"
              alt="Profile"
              className={styles.smallProfilePic}
            />
            <button className={styles.postInput}>What's on your mind?</button>
          </div>
          <div className={styles.postActions}>
            <button className={styles.postActionButton}>
              <FaVideo style={{ color: "red", marginRight: "5px" }} />
              Live video
            </button>
            <button className={styles.postActionButton}>
              <FaPhotoVideo style={{ color: "green", marginRight: "5px" }} />
              Photo/video
            </button>
            <button className={styles.postActionButton}>
              <FaFlag style={{ color: "blue", marginRight: "5px" }} />
              Life event
            </button>
          </div>

          {/* Posts Section */}
          <div className={styles.postsSection}>
            <div className={styles.postsHeader}>
              <h2 className={styles.sectionTitle}>Posts</h2>
              <div className={styles.postsOptions}>
                <button className={styles.filterButton}>Filters</button>
                <button className={styles.managePostsButton}>Manage posts</button>
              </div>
            </div>
            {posts.map((post) => (
              <div key={post.id} className={styles.post}>
                <div className={styles.postHeader}>
                  <img
                    src="https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg"
                    alt="Profile"
                    className={styles.smallProfilePic}
                  />
                  <div className={styles.postInfo}>
                    <h3 className={styles.postAuthor}>{post.author}</h3>
                    <p className={styles.postMeta}>
                      {post.date} ·{" "}
                      <span role="img" aria-label="public">
                        🌐
                      </span>
                    </p>
                  </div>
                  <button className={styles.postOptions}>
                    <FaEllipsisH />
                  </button>
                </div>
                <p className={styles.postContent}>{post.content}</p>
                <img src={post.image} alt="Post Image" className={styles.postImage} />
                <div className={styles.postInteractions}>
                  <button className={styles.interactionButton}>
                    <FaThumbsUp style={{ marginRight: "5px" }} /> Like
                  </button>
                  <button className={styles.interactionButton}>
                    <FaComment style={{ marginRight: "5px" }} /> Comment
                  </button>
                  <button className={styles.interactionButton}>
                    <FaShare style={{ marginRight: "5px" }} /> Share
                  </button>
                </div>
                <div className={styles.commentSection}>
                  <img
                    src="https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg"
                    alt="Profile"
                    className={styles.smallProfilePic}
                  />
                  <div className={styles.commentInputContainer}>
                    <input
                      type="text"
                      placeholder="Comment as Quảng Thông"
                      className={styles.commentInput}
                    />
                    <div className={styles.commentIcons}>
                      <FaSmile className={styles.commentIcon} />
                      <FaCamera className={styles.commentIcon} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;