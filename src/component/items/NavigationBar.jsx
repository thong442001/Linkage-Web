import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../rtk/Reducer';
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
} from 'react-icons/fa';
import '../css/NavigationBar.css';

const NavigationBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [activeIcon, setActiveIcon] = useState('home');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleAvatarClick = () => {
    navigate('/profile');
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
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
  );
};

export default NavigationBar;