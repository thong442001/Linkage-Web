import React, { useState, useEffect, useRef, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import ReactPlayer from 'react-player';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaEllipsisH,
  FaPlayCircle,
  FaThumbsUp,
  FaComment,
  FaShareAlt,
  FaGlobe,
  FaUsers,
  FaLock,
  FaAngleLeft,
  FaTrash,
  FaSyncAlt,
  FaExclamationCircle,
} from 'react-icons/fa';
import {
  addPost_Reaction,
  addPost,
  deletePost_reaction,
} from '../../rtk/API';
import '../../styles/components/items/PostItem.css'; // File CSS riêng

Modal.setAppElement('#root'); // Cần cho react-modal

const WebPostItem = memo(({
  post,
  ID_user,
  onDelete = () => {},
  onDeleteVinhVien = () => {},
  updatePostReaction = () => {},
  deletPostReaction = () => {},
  currentTime,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const me = useSelector((state) => state.app.user);
  const reactions = useSelector((state) => state.app.reactions);

  // State
  const [timeAgo, setTimeAgo] = useState(post.createdAt);
  const [timeAgoShare, setTimeAgoShare] = useState(post?.ID_post_shared?.createdAt);
  const [reactionsVisible, setReactionsVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState({ status: 1, name: 'Công khai' });
  const [captionShare, setCaptionShare] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageModalVisible, setImageModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');
  const [isFirstRender, setIsFirstRender] = useState(true);
  const reactionRef = useRef(null);
  const menuRef = useRef(null);

  // Tính toán thời gian
  useEffect(() => {
    const updateDiff = () => {
      const now = Date.now();
      const createdTime = new Date(post.createdAt).getTime();
      let createdTimeShare = post?.ID_post_shared?.createdAt
        ? new Date(post.ID_post_shared.createdAt).getTime()
        : null;

      if (isNaN(createdTime)) {
        setTimeAgo('Không xác định');
        setTimeAgoShare('Không xác định');
        return;
      }

      const diffMs = now - createdTime;
      setTimeAgo(formatTimeDiff(diffMs));

      if (createdTimeShare) {
        const diffMsShare = now - createdTimeShare;
        setTimeAgoShare(formatTimeDiff(diffMsShare));
      }
    };

    updateDiff();
  }, [currentTime, post.createdAt, post?.ID_post_shared?.createdAt]);

  const formatTimeDiff = (diffMs) => {
    if (diffMs < 0) return 'Vừa xong';
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    if (minutes > 0) return `${minutes} phút trước`;
    return `${seconds} giây trước`;
  };

  // Reactions và tabs
  const uniqueReactions = Array.from(
    new Map(
      post.post_reactions
        .filter((reaction) => reaction.ID_reaction)
        .map((reaction) => [reaction.ID_reaction._id, reaction.ID_reaction]),
    ).values(),
  );

  const tabs = [
    { id: 'all', icon: 'Tất cả' },
    ...uniqueReactions.map((reaction) => ({
      id: reaction._id,
      icon: reaction.icon,
    })),
  ];

  const filteredUsers = post.post_reactions
    .filter(
      (reaction) =>
        selectedTab === 'all' || reaction.ID_reaction?._id === selectedTab,
    )
    .map((reaction) => ({
      id: `${reaction.ID_user._id}-${reaction._id}`,
      userId: reaction.ID_user._id,
      name: `${reaction.ID_user.first_name} ${reaction.ID_user.last_name}`,
      avatar: reaction.ID_user.avatar,
      reactionId: reaction.ID_reaction?._id,
      reactionIcon: reaction.ID_reaction?.icon,
      quantity: reaction.quantity,
    }));

  const reactionCount = post.post_reactions.reduce((acc, reaction) => {
    if (!reaction.ID_reaction) return acc;
    const id = reaction.ID_reaction._id;
    acc[id] = acc[id]
      ? { ...acc[id], count: acc[id].count + 1 }
      : { ...reaction, count: 1 };
    return acc;
  }, {});

  const topReactions = Object.values(reactionCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 2);

  const userReaction = post.post_reactions.find(
    (reaction) => reaction.ID_user._id === ID_user,
  );

  // Xử lý reactions
  const handleLongPress = (e) => {
    const { clientX, clientY } = e;
    setMenuPosition({ top: clientY - 50, left: clientX });
    setReactionsVisible(true);
  };

  const callAddPost_Reaction = async (ID_reaction, name, icon) => {
    try {
      const paramsAPI = {
        ID_post: post._id,
        ID_user: ID_user,
        ID_reaction,
      };
      await dispatch(addPost_Reaction(paramsAPI))
        .unwrap()
        .then((response) => {
          const newReaction = { _id: ID_reaction, name, icon };
          updatePostReaction(post._id, newReaction, response.post_reaction._id);
        });
    } catch (error) {
      console.log('Lỗi trong addPost_Reaction:', error);
    }
  };

  const callDeletePost_reaction = async (ID_post, ID_post_reaction) => {
    try {
      const paramsAPI = { _id: ID_post_reaction };
      await dispatch(deletePost_reaction(paramsAPI))
        .unwrap()
        .then(() => {
          deletPostReaction(ID_post, ID_post_reaction);
        });
    } catch (error) {
      console.log('Lỗi trong callDeletePost_reaction:', error);
    }
  };

  // Xử lý share
  const handleShare = (e) => {
    const { clientX, clientY } = e;
    setMenuPosition({ top: clientY - 50, left: clientX });
    setShareVisible(true);
  };

  const callAddPostShare = async () => {
    try {
      const paramsAPI = {
        ID_user,
        caption: captionShare,
        medias: [],
        status: selectedOption.name,
        type: 'Share',
        ID_post_shared: post.ID_post_shared ? post.ID_post_shared._id : post._id,
        tags: [],
      };
      await dispatch(addPost(paramsAPI))
        .unwrap()
        .then(() => {
          setShareVisible(false);
          toast.success('Chia sẻ bài viết thành công!');
        })
        .catch(() => {
          setShareVisible(false);
          toast.error('Chia sẻ bài viết thất bại. Vui lòng thử lại!');
        });
    } catch (error) {
      setShareVisible(false);
      toast.error('Chia sẻ bài viết thất bại. Vui lòng thử lại!');
      console.log('Lỗi share bài viết:', error);
    }
  };

  // Media
  const hasCaption = post?.caption?.trim() !== '';
  const hasMedia = post?.medias?.length > 0 || post?.ID_post_shared?.medias?.length > 0;
  const isVideo = (uri) => uri?.endsWith('.mp4') || uri?.endsWith('.mov');

  const renderMediaGrid = (medias) => {
    const mediaCount = medias.length;
    if (mediaCount === 0) return null;

    return (
      <div className="media-container">
        {medias.slice(0, 5).map((uri, index) => (
          <div
            key={index}
            className={`media-item media-${mediaCount}-${index}`}
            onClick={() => {
              setSelectedImage(uri);
              if (mediaCount > 5) {
                navigate(`/post/${post._id}?type=image`);
              } else {
                setImageModalVisible(true);
              }
            }}
          >
            {isVideo(uri) ? (
              <div className="video-wrapper">
                <ReactPlayer
                  url={uri}
                  width="100%"
                  height="100%"
                  playing={false}
                  muted
                />
                <div className="play-button">
                  <FaPlayCircle size={40} color="white" />
                </div>
              </div>
            ) : (
              <img src={uri} alt="Media" className="media-image" />
            )}
            {index === 4 && mediaCount > 5 && (
              <div className="overlay">
                <span className="overlay-text">+{mediaCount - 5}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Menu
  const handleMenuClick = (e) => {
    const { clientX, clientY } = e;
    setMenuPosition({ top: clientY, left: clientX });
    setMenuVisible(true);
  };

  const statusOptions = [
    { status: 1, name: 'Công khai' },
    { status: 2, name: 'Bạn bè' },
    { status: 3, name: 'Chỉ mình tôi' },
  ];

  const getIcon = (status) => {
    switch (status) {
      case 'Bạn bè':
        return <FaUsers size={12} color="gray" />;
      case 'Công khai':
        return <FaGlobe size={12} color="gray" />;
      case 'Chỉ mình tôi':
        return <FaLock size={12} color="gray" />;
      default:
        return <FaLock size={12} color="gray" />;
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Đã sao chép liên kết!');
  };

  // BottomSheet content (dùng Modal thay thế)
  const renderReactionsContent = () => (
    <div className="reactions-modal-content">
      <div className="reactions-header">
        <button onClick={() => setSelectedTab(null)} className="back-button">
          <FaAngleLeft size={20} />
        </button>
        <span className="reactions-title">Người đã bày tỏ cảm xúc</span>
      </div>
      <div className="tabs-container">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${selectedTab === tab.id ? 'selected' : ''}`}
            onClick={() => setSelectedTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
          </button>
        ))}
      </div>
      <div className="users-list">
        {filteredUsers.map((user) => (
          <div key={user.id} className="user-item">
            <img src={user.avatar} alt="Avatar" className="user-avatar" />
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <div className="reaction-info">
                <span>{user.reactionIcon}</span>
                <span>{user.quantity}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }
    if (selectedTab !== null && selectedTab !== 'all') {
      setMenuVisible(true);
    }
  }, [selectedTab]);

  return (
    <div className="post-container">
      {/* Header bài share */}
      {post.ID_post_shared && (
        <div className="header-share">
          <div className="user-info">
            <img
              src={post.ID_user.avatar}
              alt="Avatar"
              className="avatar"
              onClick={() => navigate(`/profile/${post.ID_user._id}`)}
            />
            <div className="user-details">
              <span
                className="name"
                onClick={() => navigate(`/profile/${post.ID_user._id}`)}
              >
                {`${post.ID_user.first_name} ${post.ID_user.last_name}`}
              </span>
              <div className="meta">
                <span className="time">{timeAgo}</span>
                {getIcon(post.status)}
              </div>
            </div>
          </div>
          <button className="menu-button" onClick={handleMenuClick}>
            <FaEllipsisH size={22} />
          </button>
          {hasCaption && <p className="caption">{post.caption}</p>}
        </div>
      )}

      {/* Header bài gốc */}
      <div className={post.ID_post_shared ? 'header-shared' : 'header'}>
        <div className="header-content">
          <div className="user-info">
            <img
              src={
                post.ID_post_shared ? post.ID_post_shared.ID_user.avatar : post.ID_user.avatar
              }
              alt="Avatar"
              className="avatar"
              onClick={() =>
                navigate(
                  `/profile/${
                    post.ID_post_shared ? post.ID_post_shared.ID_user._id : post.ID_user._id
                  }`,
                )
              }
            />
            <div className="user-details">
              <span
                className="name"
                onClick={() =>
                  navigate(
                    `/profile/${
                      post.ID_post_shared ? post.ID_post_shared.ID_user._id : post.ID_user._id
                    }`,
                  )
                }
              >
                {post.ID_post_shared
                  ? `${post.ID_post_shared.ID_user.first_name} ${post.ID_post_shared.ID_user.last_name}`
                  : `${post.ID_user.first_name} ${post.ID_user.last_name}`}
                {(post.ID_post_shared ? post.ID_post_shared.tags : post.tags).length > 0 && (
                  <span>
                    <span className="tag-text"> cùng với </span>
                    <span
                      className="name"
                      onClick={() =>
                        navigate(
                          `/profile/${
                            (post.ID_post_shared ? post.ID_post_shared.tags : post.tags)[0]._id
                          }`,
                        )
                      }
                    >
                      {(post.ID_post_shared ? post.ID_post_shared.tags : post.tags)[0].first_name}{' '}
                      {(post.ID_post_shared ? post.ID_post_shared.tags : post.tags)[0].last_name}
                    </span>
                    {(post.ID_post_shared ? post.ID_post_shared.tags : post.tags).length > 1 && (
                      <>
                        <span className="tag-text"> và </span>
                        <span
                          className="name"
                          onClick={() =>
                            navigate('/list-tags', {
                              state: {
                                tags: post.ID_post_shared ? post.ID_post_shared.tags : post.tags,
                              },
                            })
                          }
                        >
                          {(post.ID_post_shared ? post.ID_post_shared.tags : post.tags).length - 1}{' '}
                          người khác
                        </span>
                      </>
                    )}
                  </span>
                )}
              </span>
              <div className="meta">
                <span className="time">{post.ID_post_shared ? timeAgoShare : timeAgo}</span>
                {getIcon(post.ID_post_shared ? post.ID_post_shared.status : post.status)}
              </div>
            </div>
          </div>
          {!post.ID_post_shared && (
            <button className="menu-button" onClick={handleMenuClick}>
              <FaEllipsisH size={22} />
            </button>
          )}
        </div>
        {(post.ID_post_shared ? post.ID_post_shared.caption : post.caption) && (
          <p className="caption">
            {post.ID_post_shared ? post.ID_post_shared.caption : post.caption}
          </p>
        )}
      </div>

      {/* Media */}
      {hasMedia &&
        renderMediaGrid(post.ID_post_shared ? post.ID_post_shared.medias : post.medias)}

      {/* Footer */}
      {!post._destroy && (
        <div className="footer">
          {post.post_reactions.length > 0 && (
            <div className="reactions">
              <button
                className="reactions-button"
                onClick={() => setSelectedTab('all')}
              >
                {topReactions.map((reaction, index) => (
                  <span key={index} className="reaction-icon">
                    {reaction.ID_reaction.icon}
                  </span>
                ))}
                <span className="reactions-count">
                  {post.post_reactions.some((reaction) => reaction.ID_user._id === ID_user)
                    ? post.post_reactions.length === 1
                      ? `${me?.first_name} ${me?.last_name}`
                      : `Bạn và ${post.post_reactions.length - 1} người khác`
                    : `${post.post_reactions.length}`}
                </span>
              </button>
            </div>
          )}
          {post?.comments.length > 0 && (
            <span
              className="comments-count"
              onClick={() => navigate(`/post/${post._id}?type=comment`)}
            >
              {post.comments.length} bình luận
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      {!post._destroy && (
        <div className="interactions">
          <button
            ref={reactionRef}
            className={`action ${userReaction ? 'reacted' : ''}`}
            onMouseEnter={() => setReactionsVisible(true)}
            onMouseLeave={() => setTimeout(() => setReactionsVisible(false), 200)}
            onClick={() =>
              userReaction
                ? callDeletePost_reaction(post._id, userReaction._id)
                : callAddPost_Reaction(reactions[0]._id, reactions[0].name, reactions[0].icon)
            }
          >
            <span className="action-icon">
              {userReaction ? userReaction.ID_reaction.icon : <FaThumbsUp />}
            </span>
            <span className="action-text">
              {userReaction ? userReaction.ID_reaction.name : reactions[0].name}
            </span>
            {reactionsVisible && (
              <div className="reactions-bar" style={{ top: -40, left: 0 }}>
                {reactions.map((reaction, index) => (
                  <button
                    key={index}
                    className="reaction-button"
                    onClick={() => {
                      callAddPost_Reaction(reaction._id, reaction.name, reaction.icon);
                      setReactionsVisible(false);
                    }}
                  >
                    <span className="reaction-text">{reaction.icon}</span>
                  </button>
                ))}
              </div>
            )}
          </button>
          <button
            className="action"
            onClick={() => navigate(`/post/${post._id}?type=comment`)}
          >
            <FaComment className="action-icon" />
            <span className="action-text">Bình luận</span>
          </button>
          <button className="action" onClick={handleShare}>
            <FaShareAlt className="action-icon" />
            <span className="action-text">Chia sẻ</span>
          </button>
        </div>
      )}

      {/* Modal Share */}
      <Modal
        isOpen={shareVisible}
        onRequestClose={() => setShareVisible(false)}
        style={{
          overlay: { backgroundColor: 'rgba(0, 0, 0, 0.6)' },
          content: {
            width: '40%',
            margin: 'auto',
            borderRadius: '10px',
            padding: '20px',
          },
        }}
      >
        <div className="share-modal">
          <div className="user-info">
            <img src={me?.avatar} alt="Avatar" className="avatar" />
            <div className="user-details">
              <span className="name">{`${me?.first_name} ${me?.last_name}`}</span>
              <button
                className="status-button"
                onClick={() => setStatusModalVisible(true)}
              >
                <span className="status-text">{selectedOption.name}</span>
              </button>
            </div>
          </div>
          <textarea
            placeholder="Hãy nói gì đó về nội dung này"
            className="share-caption"
            value={captionShare}
            onChange={(e) => setCaptionShare(e.target.value)}
          />
          <button
            className="copy-link-button"
            onClick={() =>
              copyToClipboard(
                `https://linkage.id.vn/deeplink?url=linkage://post-chi-tiet?ID_post=${post._id}`,
              )
            }
          >
            Sao chép liên kết
          </button>
          <button className="share-button" onClick={callAddPostShare}>
            Chia sẻ ngay
          </button>
        </div>
      </Modal>

      {/* Modal Status Options */}
      <Modal
        isOpen={statusModalVisible}
        onRequestClose={() => setStatusModalVisible(false)}
        style={{
          overlay: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
          content: {
            width: '20%',
            margin: 'auto',
            borderRadius: '8px',
            padding: '16px',
          },
        }}
      >
        <div className="status-modal">
          {statusOptions.map((option, index) => (
            <button
              key={index}
              className="option-button"
              onClick={() => {
                setSelectedOption(option);
                setStatusModalVisible(false);
              }}
            >
              {option.name}
            </button>
          ))}
        </div>
      </Modal>

      {/* Modal Media */}
      <Modal
        isOpen={isImageModalVisible}
        onRequestClose={() => setImageModalVisible(false)}
        style={{
          overlay: { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
          content: {
            top: '10%',
            left: '10%',
            right: '10%',
            bottom: '10%',
            border: 'none',
            background: 'transparent',
          },
        }}
      >
        <div className="media-modal">
          {isVideo(selectedImage) ? (
            <ReactPlayer
              url={selectedImage}
              width="100%"
              height="100%"
              controls
              playing
            />
          ) : (
            <img src={selectedImage} alt="Media" className="full-image" />
          )}
        </div>
      </Modal>

      {/* Modal Reactions */}
      <Modal
        isOpen={selectedTab !== null}
        onRequestClose={() => setSelectedTab(null)}
        style={{
          overlay: { backgroundColor: 'rgba(0, 0, 0, 0.6)' },
          content: {
            width: '50%',
            margin: 'auto',
            borderRadius: '10px',
            padding: '20px',
          },
        }}
      >
        {renderReactionsContent()}
      </Modal>

      {/* Menu */}
      <Modal
        isOpen={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
        style={{
          overlay: { backgroundColor: 'transparent' },
          content: {
            position: 'absolute',
            top: menuPosition.top,
            left: menuPosition.left,
            width: '200px',
            padding: '10px',
            borderRadius: '10px',
            backgroundColor: '#d9d9d960',
          },
        }}
      >
        <div className="menu-content">
          {ID_user !== (post.ID_post_shared ? post.ID_post_shared.ID_user._id : post.ID_user._id) ? (
            <button
              className="menu-item"
              onClick={() => {
                setMenuVisible(false);
                navigate(`/report/${post._id}`);
              }}
            >
              <FaExclamationCircle />
              <span>Báo cáo</span>
            </button>
          ) : (
            <>
              <button
                className="menu-item"
                onClick={() => {
                  onDelete();
                  setMenuVisible(false);
                }}
              >
                {post._destroy ? <FaSyncAlt /> : <FaTrash />}
                <span>{post._destroy ? 'Phục hồi' : 'Xóa bài viết'}</span>
              </button>
              {post._destroy && (
                <button
                  className="menu-item"
                  onClick={() => {
                    onDeleteVinhVien();
                    setMenuVisible(false);
                  }}
                >
                  <FaTrash />
                  <span>Xóa vĩnh viễn</span>
                </button>
              )}
            </>
          )}
        </div>
      </Modal>

      <ToastContainer />
    </div>
  );
});

export default WebPostItem;