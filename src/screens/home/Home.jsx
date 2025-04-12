import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Thêm useLocation
import { logout } from '../../rtk/Reducer';
import { useDispatch } from 'react-redux';
import {
  FaHome,
  FaSearch,
  FaVideo,
  FaStore,
  FaUsers,
  FaPlusCircle,
  FaTh,
  FaBell,
  FaFacebookMessenger,
  FaUser, // Thêm icon cho trang Profile
} from 'react-icons/fa';
import './../../css/Home.css';
import MainContent from '../../component/items/MainContent';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // Sử dụng useLocation để lấy đường dẫn hiện tại

  const [inputValue, setInputValue] = useState('');
  const [activeIcon, setActiveIcon] = useState(location.pathname === '/' ? 'home' : 'profile');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleAvatarClick = () => {
    setActiveIcon('profile');
    navigate('/profile');
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="home-container">
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
              navigate('/');
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

      {/* Body: Chia thành 3 phần bằng Grid */}
      <div className="body-container">
        {/* Sidebar trái */}
        <div className="sidebar-left">
          {/* Sidebar content (commented out in your code) */}
        </div>

        {/* Nội dung chính (giữa) */}
        <MainContent />

        {/* Sidebar phải */}
        <div className="sidebar-right">
          <div className="contacts">
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#1e90ff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = '#1478d1')}
              onMouseOut={(e) => (e.target.style.backgroundColor = '#1e90ff')}
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;