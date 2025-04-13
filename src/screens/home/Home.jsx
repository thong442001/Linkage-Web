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
import Post from '../../components/items/Post'; // Import the Post component
import Friend from '../friend/Friend'; // Import the Friend component
import Chat from '../chat/Chat'; // Import the Chat component
import Profile from '../profile/Profile';

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
            <button
                onClick={handleLogout}
                style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#1e90ff', // Màu xanh dương cho nút
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s',
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = '#1478d1')} // Hiệu ứng hover
                onMouseOut={(e) => (e.target.style.backgroundColor = '#1e90ff')}
            >
                Log Out
            </button>
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
                    <div className="avatar-wrapper"
                        onClick={() => {
                            setActiveIcon('');
                            navigate('/profile'); // Navigate to the friend route
                        }}
                    >
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
                <Routes>
                    <Route path="/" element={<Post />} />
                </Routes>
                <Routes>
                    <Route path="/friend" element={<Friend />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/profile" element={<Profile />} />
                </Routes>
            </div>
        </div>
    );
};

export default Home;