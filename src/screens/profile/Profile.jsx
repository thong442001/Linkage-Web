import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Thêm useLocation
import { useDispatch } from 'react-redux';
import { logout } from '../../rtk/Reducer';
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
  FaUser, // Thêm icon cho trang Profile
} from 'react-icons/fa';
import '../../css/Profile.css';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // Sử dụng useLocation để lấy đường dẫn hiện tại

  // State để lưu giá trị của input
  const [inputValue, setInputValue] = useState('');

  // State để theo dõi icon đang được chọn, đặt mặc định dựa trên đường dẫn
  const [activeIcon, setActiveIcon] = useState(location.pathname === '/' ? 'home' : 'profile');

  // Hàm xử lý khi người dùng nhập
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Hàm xử lý khi nhấn vào avatar để chuyển đến trang profile
  const handleAvatarClick = () => {
    setActiveIcon('profile');
    navigate('/profile');
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="profile-container">
      {/* Header Section */}
      <div className="header">
        <div className="logo-search-container">
          <img src="/Logo_app.png" alt="Logo" className="logo" />
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              className="search-input"
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Search..."
            />
          </div>
        </div>
        <div className="mid-header">
          <div
            className={`icon-wrapper ${activeIcon === 'home' ? 'active' : ''}`}
            onClick={() => {
              setActiveIcon('home');
              navigate('/'); // Chuyển đến trang Home
            }}
          >
            <FaHome className="nav-icon" />
          </div>
          <div
            className={`icon-wrapper ${activeIcon === 'video' ? 'active' : ''}`}
            onClick={() => setActiveIcon('video')}
          >
            <FaVideo className="nav-icon" />
          </div>
          <div
            className={`icon-wrapper ${activeIcon === 'store' ? 'active' : ''}`}
            onClick={() => setActiveIcon('store')}
          >
            <FaStore className="nav-icon" />
          </div>
          <div
            className={`icon-wrapper ${activeIcon === 'users' ? 'active' : ''}`}
            onClick={() => setActiveIcon('users')}
          >
            <FaUsers className="nav-icon" />
          </div>
     
          <div
            className={`icon-wrapper ${activeIcon === 'menu' ? 'active' : ''}`}
            onClick={() => setActiveIcon('menu')}
          >
            <FaPlusCircle className="nav-icon" />
          </div>
        </div>
        <div className="mid-header1">
          <div className="icon-wrapper1">
            <FaTh className="nav-icon1" />
          </div>
          <div className="icon-wrapper1">
            <FaFacebookMessenger className="nav-icon1" />
          </div>
          <div className="icon-wrapper1">
            <FaBell className="nav-icon1" />
          </div>
          <div className="avatar-wrapper">
            <img
              src="https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg"
              alt="Profile"
              className="avatar"
              onClick={handleAvatarClick}
              style={{ cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {/* Cover Photo Section */}
      <div className="cover-photo-container">
        <img
          src="https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg"
          alt="Cover Photo"
          className="cover-photo"
        />
        <button className="cover-photo-button">
          <span role="img" aria-label="camera">📷</span> Edit cover photo
        </button>
      </div>

      {/* Profile Picture and Info */}
      <div className="profile-info-container">
        <div className="profile-pic-wrapper">
          <img
            src="https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg"
            alt="Profile"
            className="profile-pic"
          />
          <div className="camera-icon">
            <FaCamera />
          </div>
        </div>
        <div className="profile-details">
          <div className="name-and-friends">
            <h1 className="name">Quảng Thông</h1>
            <p className="friends-count">75 friends</p>
          </div>
          <div className="action-buttons">
            <button className="story-button">+ Add to story</button>
            <button className="edit-profile-button">Edit profile</button>
            <button className="more-button">
              <FaEllipsisH />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs (Posts, About, Friends, etc.) */}
      <div className="tabs-container">
        <button className="tab active-tab">Posts</button>
        <button className="tab">About</button>
        <button className="tab">Friends</button>
        <button className="tab">Photos</button>
        <button className="tab">Videos</button>
        <button className="tab">Check-ins</button>
        <button className="tab">
          More <span role="img" aria-label="dropdown">▼</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="content-container">
        {/* Left Column: Intro */}
        <div className="left-column">
          {/* Intro Section */}
          <div className="intro-section">
            <h2 className="section-title">Intro</h2>
            <p className="intro-text">Kiếm lời, gà lành để ăn tiệc cuối</p>
            <button className="edit-button">Edit Bio</button>
            <button className="edit-button">Edit details</button>
          </div>
        </div>

        {/* Right Column: Posts */}
        <div className="right-column">
          {/* Post Input */}
          <div className="post-input-container">
            <img
              src="https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg"
              alt="Profile"
              className="small-profile-pic"
            />
            <button className="post-input">What's on your mind?</button>
          </div>
          <div className="post-actions">
            <button className="post-action-button">
              <FaVideo style={{ color: 'red', marginRight: '5px' }} />
              Live video
            </button>
            <button className="post-action-button">
              <FaPhotoVideo style={{ color: 'green', marginRight: '5px' }} />
              Photo/video
            </button>
            <button className="post-action-button">
              <FaFlag style={{ color: 'blue', marginRight: '5px' }} />
              Life event
            </button>
          </div>

          {/* Posts Section */}
          <div className="posts-section">
            <div className="posts-header">
              <h2 className="section-title">Posts</h2>
              <div className="posts-options">
                <button className="filter-button">Filters</button>
                <button className="manage-posts-button">Manage posts</button>
              </div>
            </div>

            {/* Post Item */}
            <div className="post">
              <div className="post-header">
                <img
                  src="https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg"
                  alt="Profile"
                  className="small-profile-pic"
                />
                <div className="post-info">
                  <h3 className="post-author">Quảng Thông</h3>
                  <p className="post-meta">
                    10 April at 19:02 · <span role="img" aria-label="public">🌐</span>
                  </p>
                </div>
                <button className="post-options">
                  <FaEllipsisH />
                </button>
              </div>
              <p className="post-content">Quảng Thông updated his profile picture.</p>
              <img
                src="https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg"
                alt="Post Image"
                className="post-image"
              />
              <div className="post-interactions">
                <button className="interaction-button">
                  <FaThumbsUp style={{ marginRight: '5px' }} /> Like
                </button>
                <button className="interaction-button">
                  <FaComment style={{ marginRight: '5px' }} /> Comment
                </button>
                <button className="interaction-button">
                  <FaShare style={{ marginRight: '5px' }} /> Share
                </button>
              </div>
              <div className="comment-section">
                <img
                  src="https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg"
                  alt="Profile"
                  className="small-profile-pic"
                />
                <div className="comment-input-container">
                  <input
                    type="text"
                    placeholder="Comment as Quảng Thông"
                    className="comment-input"
                  />
                  <div className="comment-icons">
                    <FaSmile className="comment-icon" />
                    <FaCamera className="comment-icon" />
                    <span role="img" aria-label="gif">GIF</span>
                    <span role="img" aria-label="sticker">😺</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;