import React, { useState } from 'react';
import { logout } from '../../rtk/Reducer'; // Import actions
import { useDispatch } from 'react-redux';
import {
    FaHome, FaSearch, FaVideo, FaStore,
    FaUsers, FaPlusCircle, FaTh, FaBell,
    FaFacebookMessenger, FaChevronDown,
    FaUserFriends, FaUsers as FaGroups, FaClock,
    FaBookmark, FaPlayCircle, FaShoppingBag
} from 'react-icons/fa';
import './../../css/Home.css'; // Import file CSS
import MainContent from '../../component/items/MainContent';
const Home = () => {
    const dispatch = useDispatch();
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
                <div className='mid-header'>
                    <div
                        className={`icon-wrapper ${activeIcon === 'home' ? 'active' : ''}`}
                        onClick={() => setActiveIcon('home')}
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
                <div className='mid-header1'>
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
                            src="https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg" // Thay bằng URL ảnh đại diện thực tế
                            alt="Profile"
                            className="avatar"
                        />
                    </div>
                </div>
            </div>

            {/* Body: Chia thành 3 phần bằng Grid */}
            <div className="body-container">
                {/* Sidebar trái */}
                <div className="sidebar-left">
                    {/* <div className="menu-item">
                        <img
                            src="https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg" // Thay bằng URL ảnh đại diện thực tế
                            alt="Profile"
                            className="menu-avatar"
                        />
                        <span>Nguyen Anh Dien Do</span>
                    </div>
                    <div className="menu-item">
                        <FaUserFriends className="menu-icon" />
                        <span>Friends</span>
                    </div>
                    <div className="menu-item">
                        <FaGroups className="menu-icon" />
                        <span>Groups</span>
                    </div>
                    <div className="menu-item">
                        <FaClock className="menu-icon" />
                        <span>Memories</span>
                    </div>
                    <div className="menu-item">
                        <FaBookmark className="menu-icon" />
                        <span>Saved</span>
                    </div>
                    <div className="menu-item">
                        <FaPlayCircle className="menu-icon" />
                        <span>Video</span>
                    </div>
                    <div className="menu-item">
                        <FaShoppingBag className="menu-icon" />
                        <span>Marketplace</span>
                    </div>
                    <div className="menu-item">
                        <FaVideo className="menu-icon" />
                        <span>Feeds</span>
                    </div>
                    <div className="menu-item see-more">
                        <span>See more</span>
                    </div> */}
                </div>

                {/* Nội dung chính (giữa) */}
                <MainContent />

                {/* Sidebar phải */}
                <div className="sidebar-right">
                    <div className="contacts">
                        {/* <h3>Contacts</h3>
                        <div className="contact-item">
                            <img
                                src="https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg" // Thay bằng URL ảnh đại diện thực tế
                                alt="Contact"
                                className="contact-avatar"
                            />
                            <span>Nguyễn Văn A</span>
                        </div>
                        <div className="contact-item">
                            <img
                                src="https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg" // Thay bằng URL ảnh đại diện thực tế
                                alt="Contact"
                                className="contact-avatar"
                            />
                            <span>Nguyễn Văn A</span>
                        </div>
                        <div className="contact-item">
                            <img
                                src="https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg" // Thay bằng URL ảnh đại diện thực tế
                                alt="Contact"
                                className="contact-avatar"
                            />
                            <span>Nguyễn Văn A</span>
                        </div>
                        <div className="contact-item">
                            <img
                                src="https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg" // Thay bằng URL ảnh đại diện thực tế
                                alt="Contact"
                                className="contact-avatar"
                            />
                            <span>Nguyễn Văn A</span>
                        </div>
                        <div className="contact-item">
                            <img
                                src="https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg" // Thay bằng URL ảnh đại diện thực tế
                                alt="Contact"
                                className="contact-avatar"
                            />
                            <span>Nguyễn Văn A</span>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
{/* <button
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
            </button> */}