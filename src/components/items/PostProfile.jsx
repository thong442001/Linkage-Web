import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaThumbsUp, FaComment, FaShare, FaEllipsisH } from 'react-icons/fa';
import { AiOutlineGlobal, AiOutlineUsergroupAdd, AiOutlineLock } from 'react-icons/ai';
import { addPost_Reaction, deletePost_reaction, addPost } from '../../rtk/API';
import './../../styles/screens/profile/Profile.css';

const PostProfile = ({ post, ID_user, currentTime, onDelete, onDeleteVinhVien, updatePostReaction, deletPostReaction }) => {
  const dispatch = useDispatch();
  const me = useSelector((state) => state.app.user);
  const reactions = useSelector((state) => state.app.reactions || []);
  const [reactionsVisible, setReactionsVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [failedModalVisible, setFailedModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [captionShare, setCaptionShare] = useState('');
  const [selectedOption, setSelectedOption] = useState({ status: 1, name: 'Công khai' });
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const reactionRef = useRef(null);

  const status = [
    { status: 1, name: 'Công khai' },
    { status: 2, name: 'Bạn bè' },
    { status: 3, name: 'Chỉ mình tôi' },
  ];

  // Hàm tính thời gian đăng bài
  const getTimeAgo = (createdAt) => {
    if (!createdAt) return 'Không xác định';
    const diffMs = currentTime - new Date(createdAt).getTime();
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

  // Hàm hiển thị icon trạng thái
  const getIcon = (status) => {
    switch (status) {
      case 'Công khai':
        return <AiOutlineGlobal size={12} color="gray" />;
      case 'Bạn bè':
        return <AiOutlineUsergroupAdd size={12} color="gray" />;
      case 'Chỉ mình tôi':
        return <AiOutlineLock size={12} color="gray" />;
      default:
        return null;
    }
  };

  const getMediaStyle = (count, index) => {
    if (count === 1) return 'single-media';
    else if (count === 2) return 'double-media';
    else if (count === 3) return index === 0 ? 'triple-media-first' : 'triple-media-second';
    else if (count === 4) return 'quad-media';
    else {
      if (index < 2) return 'five-plus-media-first-row';
      else if (index === 2) return 'five-plus-media-second-row-left';
      else if (index === 3) return 'five-plus-media-second-row-middle';
      else return 'five-plus-media-second-row-right';
    }
  };

  const isVideo = (uri) => {
    return uri.endsWith('.mp4') || uri.endsWith('.mov') || uri.endsWith('.avi');
  };

  const renderMediaGrid = (medias) => {
    const mediaCount = medias.length;
    if (mediaCount === 0) return null;

    return (
      <div className="media-container">
        {medias.slice(0, 5).map((uri, index) => (
          <div
            key={index}
            className={`media-item ${getMediaStyle(mediaCount, index)}`}
            onClick={() => {
              setSelectedImage(uri);
              setImageModalVisible(true);
            }}
          >
            {isVideo(uri) ? (
              <div className="video-wrapper">
                <video src={uri} className="video" />
                <div className="play-button"></div>
              </div>
            ) : (
              <img src={uri} alt="Post Media" className="image" />
            )}
            {index === 4 && mediaCount > 5 && (
              <div className="overlay-container">
                <span className="overlay-text">+{mediaCount - 5}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const handleLongPress = (e) => {
    const rect = reactionRef.current.getBoundingClientRect();
    setMenuPosition({ top: rect.top - 50, left: rect.left });
    setReactionsVisible(true);
  };

  const handleShare = () => {
    setShareVisible(true);
  };

  const handleSelectOption = (option) => {
    setSelectedOption(option);
    setModalVisible(false);
  };

  const callAddPost_Reaction = async (ID_reaction, name, icon) => {
    try {
      const paramsAPI = { ID_post: post._id, ID_user: me._id, ID_reaction };
      await dispatch(addPost_Reaction(paramsAPI))
        .unwrap()
        .then((response) => {
          updatePostReaction(post._id, { _id: ID_reaction, name, icon }, response.post_reaction._id);
        })
        .catch((error) => console.log('Lỗi call api addPost_Reaction', error));
    } catch (error) {
      console.log('Lỗi trong addPost_Reaction:', error);
    }
  };

  const callDeletePost_reaction = async (reactionId) => {
    try {
      const paramsAPI = { _id: reactionId };
      await dispatch(deletePost_reaction(paramsAPI))
        .unwrap()
        .then(() => {
          deletPostReaction(post._id, reactionId);
        })
        .catch((error) => console.log('Lỗi call api callDeletePost_reaction', error));
    } catch (error) {
      console.log('Lỗi trong callDeletePost_reaction:', error);
    }
  };

  const callAddPostShare = async () => {
    try {
      setIsLoading(true);
      const paramsAPI = {
        ID_user: me._id,
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
          setSuccessModalVisible(true);
          setTimeout(() => setSuccessModalVisible(false), 1500);
        })
        .catch((error) => {
          setIsLoading(false);
          console.log('Lỗi khi share bài viết:', error);
          setShareVisible(false);
          setFailedModalVisible(true);
          setTimeout(() => setFailedModalVisible(false), 1500);
        });
    } catch (error) {
      setIsLoading(false);
      console.log('Lỗi share bài viết:', error);
      setShareVisible(false);
      setFailedModalVisible(true);
      setTimeout(() => setFailedModalVisible(false), 1500);
    }
  };

  const timeAgo = getTimeAgo(post.createdAt);
  const timeAgoShare = getTimeAgo(post.ID_post_shared?.createdAt);
  const hasCaption = post?.caption?.trim() !== '';
  const hasMedia = post?.medias?.length > 0 || post?.ID_post_shared?.medias?.length > 0;
  const userReaction = post.post_reactions?.find((r) => r.ID_user._id === me?._id) || null;

  const reactionCount = (post.post_reactions || []).reduce((acc, reaction) => {
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

  return (
    <div className="post-container-profile">
      {post?.ID_user?._id === me?._id && (
        <div className="create-post">
          <img
            src={me?.avatar || 'https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg'}
            alt="Profile"
            className="avatar"
          />
          <input
            type="text"
            placeholder={`Bạn đang nghĩ gì, ${me?.first_name} ?`}
            className="post-input"
          />
        </div>
      )}

      {/* Header share */}
      {post.ID_post_shared && (
        <div>
          <div className="header-share">
            <div className="user-info">
              <a href="#" onClick={() => console.log('Navigate to Profile:', post.ID_user._id)}>
                <img src={post.ID_user?.avatar} className="avatar" alt="User Avatar" />
              </a>
              <div className="user-details">
                <a
                  href="#"
                  onClick={() => console.log('Navigate to Profile:', post.ID_user._id)}
                  className="name"
                >
                  {post.ID_user?.first_name} {post.ID_user?.last_name}
                </a>
                <div className="box-name">
                  <span className="time">{timeAgo}</span>
                  {getIcon(post.status)}
                </div>
              </div>
            </div>
            <button
              className="options-button"
              onClick={() => {
                const rect = reactionRef.current?.getBoundingClientRect();
                setMenuPosition({ top: rect?.top || 0, left: rect?.left || 0 });
                setModalVisible(true);
              }}
            >
              <FaEllipsisH size={22} />
            </button>
          </div>
          <div>
            {hasCaption && <p className="caption">{post.caption}</p>}
          </div>
        </div>
      )}

      {/* Header gốc */}
      <div className={post.ID_post_shared ? 'header-shared' : 'header-original'}>
        <div className='box-header'>
          <div className="header-content">
            {post.ID_post_shared ? (
              <div className="user-info">
                <a onClick={() => console.log('Navigate to Profile:', post.ID_post_shared.ID_user._id)}>
                  <img src={post.ID_post_shared.ID_user?.avatar} className="avatar" alt="User Avatar" />
                </a>
                <div className="user-details">
                  <a
                    onClick={() => console.log('Navigate to Profile:', post.ID_post_shared.ID_user._id)}
                    className="name"
                  >
                    {post.ID_post_shared.ID_user.first_name} {post.ID_post_shared.ID_user.last_name}
                    {post.ID_post_shared.tags?.length > 0 && (
                      <span>
                        <span style={{ color: 'gray' }}> cùng với </span>
                        <a
                          onClick={() => console.log('Navigate to Profile:', post.ID_post_shared.tags[0]?._id)}
                          className="name"
                        >
                          {post.ID_post_shared.tags[0]?.first_name} {post.ID_post_shared.tags[0]?.last_name}
                        </a>
                        {post.ID_post_shared.tags.length > 1 && (
                          <>
                            <span style={{ color: 'gray' }}> và </span>
                            <a onClick={() => console.log('Navigate to ListTag')} className="name">
                              {post.ID_post_shared.tags.length - 1} người khác
                            </a>
                          </>
                        )}
                      </span>
                    )}
                  </a>
                  <div className="box-name">
                    <span className="time">{timeAgoShare}</span>
                    {getIcon(post.ID_post_shared?.status)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="user-info">
                <a onClick={() => console.log('Navigate to Profile:', post.ID_user._id)}>
                  <img src={post.ID_user?.avatar} className="avatar" alt="User Avatar" />
                </a>
                <div className="user-details">
                  <a
                    onClick={() => console.log('Navigate to Profile:', post.ID_user._id)}
                    className="name"
                  >
                    {post.ID_user?.first_name} {post.ID_user?.last_name}
                    {post.tags?.length > 0 && (
                      <span>
                        <span style={{ color: 'gray' }}> cùng với </span>
                        <a
                          onClick={() => console.log('Navigate to Profile:', post.tags[0]?._id)}
                          className="name"
                        >
                          {post.tags[0]?.first_name} {post.tags[0]?.last_name}
                        </a>
                        {post.tags.length > 1 && (
                          <>
                            <span style={{ color: 'gray' }}> và </span>
                            <a onClick={() => console.log('Navigate to ListTag')} className="name">
                              {post.tags.length - 1} người khác
                            </a>
                          </>
                        )}
                      </span>
                    )}
                  </a>
                  <div className="box-name">
                    <span className="time">{timeAgo}</span>
                    {getIcon(post.status)}
                  </div>
                </div>
              </div>
            )}
            {!post.ID_post_shared && (
              <button
                className="options-button"
                onClick={() => {
                  const rect = reactionRef.current?.getBoundingClientRect();
                  setMenuPosition({ top: rect?.top || 0, left: rect?.left || 0 });
                  setModalVisible(true);
                }}
              >
                <FaEllipsisH size={22} />
              </button>
            )}
          </div>
          <p className="caption">
            {post.ID_post_shared ? post.ID_post_shared.caption : hasCaption && post.caption}
          </p>
        </div>
      </div>

      {/* Media */}
      {post.ID_post_shared ? hasMedia && renderMediaGrid(post.ID_post_shared.medias) : hasMedia && renderMediaGrid(post.medias)}

      {/* Footer */}
      {!post._destroy && (
        <div className="footer">
          {post.post_reactions?.length > 0 ? (
            <div className="footer-reactions">
              <a onClick={() => console.log('Open Bottom Sheet for Reactions')}>
                {topReactions.map((reaction, index) => (
                  <span key={index}>{reaction.ID_reaction.icon}</span>
                ))}
                <span>
                  {post.post_reactions.some((r) => r.ID_user._id === me?._id)
                    ? post.post_reactions.length === 1
                      ? `${me?.first_name} ${me?.last_name}`
                      : `Bạn và ${post.post_reactions.length - 1} người khác`
                    : `${post.post_reactions.length}`}
                </span>
              </a>
            </div>
          ) : (
            <div className="footer-spacer" />
          )}
          {post.comments?.length > 0 && (
            <span className="comment-count" onClick={() => console.log('Navigate to PostDetail:', post._id)}>
              {post.comments.length} bình luận
            </span>
          )}
        </div>
      )}

      {/* Interactions */}
      {!post._destroy && (
        <div className="interactions">
          <button
            ref={reactionRef}
            className={`action ${userReaction ? 'reacted' : ''}`}
            onMouseDown={(e) => setTimeout(() => handleLongPress(e), 200)}
            onClick={() =>
              userReaction
                ? callDeletePost_reaction(userReaction._id)
                : callAddPost_Reaction(reactions[0]?._id, reactions[0]?.name, reactions[0]?.icon)
            }
          >
            <span>{userReaction ? userReaction.ID_reaction.icon : <FaThumbsUp size={20} />}</span>
            <span className={userReaction ? 'reacted-text' : ''}>
              {userReaction ? userReaction.ID_reaction.name : reactions[0]?.name || 'Thích'}
            </span>
          </button>
          <button className="action" onClick={() => console.log('Navigate to PostDetail:', post._id)}>
            <FaComment size={20} />
            <span>Bình luận</span>
          </button>
          <button className="action" onClick={() => handleShare()}>
            <FaShare size={20} />
            <span>Chia sẻ</span>
          </button>
        </div>
      )}

      {/* Reactions Modal */}
      {reactionsVisible && (
        <div className="overlay" onClick={() => setReactionsVisible(false)}>
          <div className="reaction-bar" style={{ top: menuPosition.top, left: menuPosition.left }}>
            {reactions.map((reaction, index) => (
              <button
                key={index}
                className="reaction-button"
                onClick={() => {
                  callAddPost_Reaction(reaction._id, reaction.name, reaction.icon);
                  setReactionsVisible(false);
                }}
              >
                {reaction.icon}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareVisible && (
        <div className="overlay" onClick={() => setShareVisible(false)}>
          <div className="modal-container">
            <div className="share-header">
              <img src={me?.avatar} className="avatar" alt="User Avatar" />
              <div>
                <span className="name">{me?.first_name} {me?.last_name}</span>
                <div className="box-status">
                  <button className="btn-status" onClick={() => setModalVisible(true)}>
                    {selectedOption.name}
                  </button>
                </div>
              </div>
            </div>
            <textarea
              placeholder="Hãy nói gì đó về nội dung này"
              className="content-share"
              value={captionShare}
              onChange={(e) => setCaptionShare(e.target.value)}
            />
            <button className="share-button" onClick={() => callAddPostShare()}>
              Chia sẻ ngay
            </button>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {modalVisible && (
        <div className="overlay" onClick={() => setModalVisible(false)}>
          <div className="modal-content">
            {me._id !== post.ID_user?._id ? (
              <button
                className="option-button"
                onClick={() => {
                  setModalVisible(false);
                  console.log('Navigate to Report:', post._id);
                }}
              >
                <i className="fas fa-exclamation-circle" /> Báo cáo
              </button>
            ) : (
              <>
                <button
                  className="option-button"
                  onClick={() => {
                    onDelete();
                    setModalVisible(false);
                  }}
                >
                  <i className={post._destroy ? 'fas fa-undo' : 'fas fa-trash'} />
                  {post._destroy ? 'Phục hồi' : 'Xóa bài viết'}
                </button>
                {post._destroy && (
                  <button
                    className="option-button"
                    onClick={() => {
                      onDeleteVinhVien();
                      setModalVisible(false);
                    }}
                  >
                    <i className="fas fa-trash" /> Xóa vĩnh viễn
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Status Selection Modal */}
      {modalVisible && shareVisible && (
        <div className="overlay" onClick={() => setModalVisible(false)}>
          <div className="modal-content">
            {status.map((option, index) => (
              <button
                key={index}
                className="option-button"
                onClick={() => handleSelectOption(option)}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image/Video Modal */}
      {isImageModalVisible && (
        <div className="overlay" onClick={() => setImageModalVisible(false)}>
          {isVideo(selectedImage) ? (
            <video src={selectedImage} className="full-media" controls autoPlay />
          ) : (
            <img src={selectedImage} className="full-media" alt="Full Media" />
          )}
        </div>
      )}

      {/* Success Modal */}
      {successModalVisible && (
        <div className="overlay">
          <div className="success-modal">Chia sẻ bài viết thành công!</div>
        </div>
      )}

      {/* Failed Modal */}
      {failedModalVisible && (
        <div className="overlay">
          <div className="failed-modal">Chia sẻ bài viết thất bại. Vui lòng thử lại!</div>
        </div>
      )}
    </div>
  );
};

export default PostProfile;