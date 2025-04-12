import React, { useState } from 'react';
import { logout } from '../../rtk/Reducer'; // Import actions
import { useDispatch } from 'react-redux';
import { Routes, Route, useNavigate } from 'react-router-dom'; // Import Routes and Route
import {
    FaHome, FaSearch, FaVideo, FaStore,
    FaUsers, FaPlusCircle, FaTh, FaBell,
    FaFacebookMessenger, FaChevronDown,
    FaUserFriends, FaUsers as FaGroups, FaClock,
    FaBookmark, FaPlayCircle, FaShoppingBag
} from 'react-icons/fa';
import './../../styles/screens/home/HomeS.css'; // Import file CSS
import Post from '../../component/items/Post';
import Friend from '../friend/Friend'; // Import the Friend component
import Chat from '../chat/Chat'; // Import the Chat component

const Home = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate(); // Khởi tạo useNavigate
    const handleLogout = () => {
        dispatch(logout());
    };

    // Khai báo state để lưu giá trị của input
    const [inputValue, setInputValue] = useState('');

    // State để theo dõi icon đang được chọn
    const [activeIcon, setActiveIcon] = useState('home');

    // Hàm xử lý khi người dùng nhập
    const handleInputChange = (e) => {
        setInputValue(e.target.value); // Cập nhật giá trị state
    };

    return (
        <div className="home-container">
            {/* Header remains fixed */}
            <div className="header-container">
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
                <div className='mid-header'>
                    <div
                        className={`icon-wrapper ${activeIcon === 'home' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveIcon('home');
                            navigate('/'); // Navigate to the home route
                        }}
                    >
                        <FaHome className="nav-icon" />
                    </div>
                    <div
                        className={`icon-wrapper ${activeIcon === 'users' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveIcon('users');
                            navigate('/friend'); // Navigate to the friend route
                        }}
                    >
                        <FaUsers className="nav-icon" />
                    </div>
                    <div
                        className={`icon-wrapper ${activeIcon === 'menu' ? 'active' : ''}`}
                        onClick={() => setActiveIcon('menu')}
                    >
                        <FaPlusCircle className="nav-icon" />
                    </div>
                    <div
                        className={`icon-wrapper ${activeIcon === 'bell' ? 'active' : ''}`}
                        onClick={() => setActiveIcon('bell')}
                    >
                        <FaBell className="nav-icon" />
                    </div>
                </div>
                <div className='mid-header1'>
                    <div className="icon-wrapper1">
                        <FaTh className="nav-icon1" />
                    </div>
                    <div className="icon-wrapper1" onClick={() => navigate('/chat')}>
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
                        />
                    </div>
                </div>
            </div>

            {/* Content section switches based on the route */}
            <div className="body-container">
                <div className="main-content">
                    <Routes>
                        <Route path="/" element={<Post />} />
                        <Route path="/friend" element={<Friend />} />
                        <Route path="/chat" element={<Chat />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default Home;