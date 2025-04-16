import React, { useState, useEffect } from 'react';
import { logout } from '../../rtk/Reducer';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
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
    FaChevronDown,
    FaUserFriends,
    FaUsers as FaGroups,
    FaClock,
    FaBookmark,
    FaPlayCircle,
    FaShoppingBag,
} from 'react-icons/fa';
import {
    getAllNotificationOfUser,
    getAllUsers,
    getAllPostsInHome,
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
} from '../../rtk/API';
import './../../styles/screens/home/HomeS.css';
import Post from '../../components/items/Post';
import NotificationDialog from '../../components/items/NotificationDialog';
import SearchDialog from '../../components/items/SearchDialog';
import ReportDialog from '../../components/dialogs/ReportDialog';

const Home = ({ content }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const me = useSelector((state) => state.app.user);
    const token = useSelector((state) => state.app.token);

    const [activeIcon, setActiveIcon] = useState('home');
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [formattedNotifications, setFormattedNotifications] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stories, setStories] = useState([]);
    const [liveSessions, setLiveSessions] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    //dialog report
    const [open, setOpen] = useState(true);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    // Search
    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Đồng bộ activeIcon với URL
    useEffect(() => {
        if (location.pathname === '/') setActiveIcon('home');
        else if (location.pathname === '/friend') setActiveIcon('users');
        else if (location.pathname === '/chat') setActiveIcon('chat');
        else if (location.pathname.startsWith('/profile')) setActiveIcon('profile');
    }, [location.pathname]);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    // Gọi API
    const callGetAllPostsInHome = async (ID_user) => {
        try {
            if (!refreshing) setLoading(true);
            await dispatch(getAllPostsInHome({ me: ID_user, token, timestamp: Date.now() }))
                .unwrap()
                .then((response) => {
                    setPosts(response.posts || []);
                    setStories(response.stories || []);
                    setLiveSessions([]);
                    setLoading(false);
                })
                .catch((error) => {
                    console.log('Error getAllPostsInHome:: ', error);
                    setPosts([]);
                    setStories([]);
                    setLiveSessions([]);
                    setLoading(false);
                });
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (location.pathname === '/') {
            callGetAllPostsInHome(me._id);
        }
    }, [me._id, location.pathname]);

    // Search
    useEffect(() => {
        getData();
    }, []);

    const getData = async () => {
        try {
            const response = await dispatch(getAllUsers({ token })).unwrap();
            setData(response.users);
        } catch (error) {
            console.log('Error:', error);
        }
    };

    const normalizeText = (text) => {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D');
    };

    const handleInputChange = (query) => {
        setIsSearchOpen(!isSearchOpen);
        setSearchQuery(query.target.value);
        if (query.target.value === '') {
            setFilteredProducts([]);
            setIsSearching(false);
        } else {
            setIsSearching(true);
            setFilteredProducts(
                data.filter((user) =>
                    normalizeText(user.first_name + ' ' + user.last_name)
                        .toLowerCase()
                        .includes(normalizeText(query.target.value).toLowerCase())
                )
            );
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
                        post_reactions: post.post_reactions.filter((reaction) => reaction._id !== reactionId),
                    }
                    : post
            )
        );
    };

    // Hàm xóa bài đăng
    const handleDeletePost = async (postId) => {
        try {
            dispatch(changeDestroyPost({ _id: postId }))
                .unwrap()
                .then(() => {
                    setPosts((prev) =>
                        prev.map((post) => (post._id === postId ? { ...post, _destroy: true } : post))
                    );
                    setSuccessMessage('Đã xóa bài đăng!');
                })
                .catch((err) => {
                    setErrorMessage('Lỗi khi xóa bài đăng!');
                });
        } catch (error) {
            setErrorMessage('Lỗi khi xử lý!');
        }
    };

    // Hàm xóa vĩnh viễn bài đăng
    const handleDeletePermanently = async (postId) => {
        try {
            dispatch(changeDestroyPost({ _id: postId, permanent: true }))
                .unwrap()
                .then(() => {
                    setPosts((prev) => prev.filter((post) => post._id !== postId));
                    setSuccessMessage('Đã xóa vĩnh viễn bài đăng!');
                })
                .catch((err) => {
                    setErrorMessage('Lỗi khi xóa vĩnh viễn bài đăng!');
                });
        } catch (error) {
            setErrorMessage('Lỗi khi xử lý!');
        }
    };

    const calculateTimeAgo = (updatedAt) => {
        const now = Date.now();
        const createdTime = new Date(updatedAt).getTime();

        if (isNaN(createdTime)) {
            return 'Không xác định';
        }

        const diffMs = now - createdTime;
        if (diffMs < 0) {
            return 'Vừa xong';
        }

        const seconds = Math.floor(diffMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days} ngày trước`;
        } else if (hours > 0) {
            return `${hours} giờ trước`;
        } else if (minutes > 0) {
            return `${minutes} phút trước`;
        } else {
            return `${seconds} giây trước`;
        }
    };

    const callGetAllNotificationOfUser = async () => {
        try {
            await dispatch(getAllNotificationOfUser({ me: me._id, token: token }))
                .unwrap()
                .then((response) => {
                    setNotifications(response.notifications || []);
                    console.log('Notifications:', response.notifications);
                })
                .catch((error) => {
                    console.log('Error getAllNotificationOfUser: ', error);
                });
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        callGetAllNotificationOfUser();
    }, [me._id, token]);

    useEffect(() => {
        const formatNotifications = () => {
            const formatted = notifications.map((notification) => {
                let name = '';
                let avatar = '';
                let icon = '';
                let background = '';
                let content = '';
                let showActions = false;

                if (notification.type === 'Lời mời kết bạn') {
                    if (notification.ID_relationship.ID_userA._id === me._id) {
                        name = `${notification.ID_relationship.ID_userB.first_name} ${notification.ID_relationship.ID_userB.last_name}`;
                        avatar = notification.ID_relationship.ID_userB.avatar;
                    } else {
                        name = `${notification.ID_relationship.ID_userA.first_name} ${notification.ID_relationship.ID_userA.last_name}`;
                        avatar = notification.ID_relationship.ID_userA.avatar;
                    }
                    content = `${name} đã gửi cho bạn một lời mời kết bạn.`;
                    icon = 'person-add';
                    background = '#007bff';
                    showActions = true;
                } else if (notification.type === 'Đã đăng story mới') {
                    name = `${notification.ID_post.ID_user.first_name} ${notification.ID_post.ID_user.last_name}`;
                    avatar = notification.ID_post.ID_user.avatar;
                    content = `${name} đã đăng một story mới.`;
                    icon = 'book';
                    background = '#DA7F00';
                } else if (notification.type === 'Đã thành bạn bè của bạn') {
                    if (notification.ID_relationship.ID_userA._id === me._id) {
                        name = `${notification.ID_relationship.ID_userB.first_name} ${notification.ID_relationship.ID_userB.last_name}`;
                        avatar = notification.ID_relationship.ID_userB.avatar;
                    } else {
                        name = `${notification.ID_relationship.ID_userA.first_name} ${notification.ID_relationship.ID_userA.last_name}`;
                        avatar = notification.ID_relationship.ID_userA.avatar;
                    }
                    content = `${name} đã trở thành bạn bè của bạn.`;
                    icon = 'people';
                    background = '#007bff';
                } else if (notification.type === 'Đã đăng bài mới') {
                    name = `${notification.ID_post.ID_user.first_name} ${notification.ID_post.ID_user.last_name}`;
                    avatar = notification.ID_post.ID_user.avatar;
                    content = `${name} đã đăng một bài viết mới.`;
                    icon = 'reader';
                    background = '#E1E111';
                } else if (notification.type === 'Bạn có 1 cuộc gọi video đến' || notification.type === 'Bạn có 1 cuộc gọi đến') {
                    if (notification.ID_group.isPrivate) {
                        const otherUser = notification.ID_group.members?.find((user) => user._id !== me._id);
                        name = otherUser ? `${otherUser.first_name} ${otherUser.last_name}` : 'Người gọi';
                        avatar = otherUser?.avatar || 'https://example.com/default-avatar.png';
                    } else {
                        name = notification.ID_group.name || notification.ID_group.members
                            ?.filter((user) => user._id !== me._id)
                            .map((user) => `${user.first_name} ${user.last_name}`)
                            .join(', ');
                        avatar = notification.ID_group.avatar || 'https://example.com/default-group-avatar.png';
                    }
                    content = notification.type === 'Bạn có 1 cuộc gọi video đến' ? `${name} đang gọi video cho bạn.` : `${name} đang gọi cho bạn.`;
                    icon = notification.type === 'Bạn có 1 cuộc gọi video đến' ? 'videocam-outline' : 'call';
                    background = '#FF5733';
                } else if (notification.type === 'Bạn đã được mời vào nhóm mới') {
                    if (notification.ID_group.isPrivate) {
                        const otherUser = notification.ID_group.members?.find((user) => user._id !== me._id);
                        name = otherUser ? `${otherUser.first_name} ${otherUser.last_name}` : 'Người gọi';
                        avatar = otherUser?.avatar || 'https://example.com/default-avatar.png';
                    } else {
                        name = notification.ID_group.name || notification.ID_group.members
                            ?.filter((user) => user._id !== me._id)
                            .map((user) => `${user.first_name} ${user.last_name}`)
                            .join(', ');
                        avatar = notification.ID_group.avatar || 'https://example.com/default-group-avatar.png';
                    }
                    content = `${name} đã mời bạn vào một nhóm mới.`;
                    icon = 'people-circle';
                    background = 'green';
                } else if (notification.type === 'Tin nhắn mới') {
                    name = `${notification.ID_message.sender.first_name} ${notification.ID_message.sender.last_name}`;
                    avatar = notification.ID_message.sender.avatar;
                    content = `${name} đã gửi cho bạn một tin nhắn mới.`;
                    icon = 'chatbox-ellipses';
                    background = 'green';
                } else if (notification.type === 'Đang livestream') {
                    if (notification.ID_relationship.ID_userA._id === me._id) {
                        name = `${notification.ID_relationship.ID_userB.first_name} ${notification.ID_relationship.ID_userB.last_name}`;
                        avatar = notification.ID_relationship.ID_userB.avatar;
                    } else {
                        name = `${notification.ID_relationship.ID_userA.first_name} ${notification.ID_relationship.ID_userA.last_name}`;
                        avatar = notification.ID_relationship.ID_userA.avatar;
                    }
                    content = `${name} đang livestream.`;
                    icon = 'logo-rss';
                    background = 'red';
                } else if (notification.type === 'Đã thả biểu cảm vào bài viết của bạn') {
                    name = `${notification.ID_post_reaction?.ID_user?.first_name} ${notification.ID_post_reaction?.ID_user?.last_name}`;
                    avatar = notification.ID_post_reaction?.ID_user?.avatar;
                    content = `${name} đã thả biểu cảm vào bài viết của bạn.`;
                    icon = 'happy';
                    background = 'green';
                } else if (notification.type === 'Đã bình luận vào bài viết của bạn' || notification.type === 'Đã trả lời bình luận của bạn') {
                    name = `${notification.ID_comment.ID_user.first_name} ${notification.ID_comment.ID_user.last_name}`;
                    avatar = notification.ID_comment.ID_user.avatar;
                    content = notification.type === 'Đã bình luận vào bài viết của bạn' ? `${name} đã bình luận vào bài viết của bạn.` : `${name} đã trả lời bình luận của bạn.`;
                    icon = 'chatbubble-ellipses';
                    background = 'green';
                } else if (notification.type === 'Mời chơi game 3 lá') {
                    const otherUser = notification.ID_group.members?.find((user) => user._id !== me._id);
                    name = otherUser ? `${otherUser.first_name} ${otherUser.last_name}` : 'Người gọi';
                    avatar = otherUser?.avatar || 'https://example.com/default-avatar.png';
                    content = `${name} đã mời bạn chơi game 3 lá.`;
                    icon = 'game-controller-outline';
                    background = '#007bff';
                } else if (notification.type === 'Đã thả biểu cảm vào story của bạn') {
                    name = 'Người nào đó';
                    avatar = notification.ID_post.ID_user?.avatar;
                    content = `${name} đã thả biểu cảm vào story của bạn.`;
                    icon = 'happy';
                    background = 'green';
                }

                return {
                    _id: notification._id,
                    content,
                    avatar,
                    time: calculateTimeAgo(notification.updatedAt),
                    showActions,
                    icon,
                    background,
                };
            });

            setFormattedNotifications(formatted);
        };

        formatNotifications();
    }, [notifications, me._id]);

    return (
        <div className="home-container">
            <div className="header-container">
                <div className="logo-search-container">
                    <img src="/Logo_app.png" alt="Logo" className="logo" />
                    <div className="search-bar">
                        <FaSearch className="search-icon" />
                        <input
                            className="search-input"
                            type="text"
                            value={searchQuery}
                            onChange={handleInputChange}
                            placeholder="Search..."
                        />
                        {isSearchOpen && (
                            <SearchDialog item={filteredProducts} onClose={() => setIsSearchOpen(false)} />
                        )}
                    </div>
                </div >
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
                        className={`icon-wrapper ${activeIcon === 'users' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveIcon('users');
                            navigate('/friend');
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
                <div className="mid-header1">
                    <div className="icon-wrapper1" onClick={handleLogout}>
                        <FaTh className="nav-icon1" />
                    </div>
                    <div
                        className="icon-wrapper1"
                        onClick={() => {
                            setIsNotificationOpen(false);
                            setActiveIcon('chat');
                            navigate('/chat');
                        }}
                    >
                        <FaFacebookMessenger className="nav-icon1" />
                    </div>
                    <div className="icon-wrapper1" onClick={() => setIsNotificationOpen(!isNotificationOpen)}>
                        <FaBell className="nav-icon1" />
                        {isNotificationOpen && (
                            <NotificationDialog
                                notifications={formattedNotifications}
                                onClose={() => setIsNotificationOpen(false)}
                            />
                        )}
                    </div>
                    <div
                        className="avatar-wrapper"
                        onClick={() => {
                            setIsNotificationOpen(false);
                            setActiveIcon('profile');
                            navigate('/profile');
                        }}
                    >
                        <img
                            src={me.avatar || 'https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg'}
                            alt="Hồ Sơ"
                            className="avatar"
                        />
                    </div>
                </div>
            </div >
            <div className="body-container">
                {location.pathname === '/' ? (
                    <div className="mid-sidebar">
                        {loading ? (
                            <p>Đang tải...</p>
                        ) : posts.length > 0 ? (
                            posts.map((post) => (
                                <Post
                                    key={post._id}
                                    post={post}
                                    ID_user={me._id}
                                    currentTime={currentTime}
                                    onDelete={() => handleDeletePost(post._id)}
                                    onDeleteVinhVien={() => handleDeletePermanently(post._id)}
                                    updatePostReaction={updatePostReaction}
                                    deletePostReaction={deletePostReaction}
                                />
                            ))
                        ) : (
                            <p>Chưa có bài đăng nào.</p>
                        )}
                    </div>
                ) : (
                    content
                )}
            </div>
        </div >
    );
};

export default Home;