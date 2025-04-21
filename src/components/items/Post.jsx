import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaThumbsUp, FaComment, FaShare, FaEllipsisH } from 'react-icons/fa';
import { AiOutlineGlobal, AiOutlineUsergroupAdd, AiOutlineLock } from 'react-icons/ai';
import { addPost_Reaction, deletePost_reaction, addPost } from '../../rtk/API';
import styles from './../../styles/components/items/PostS.module.css';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import ReportDialog from '../../components/dialogs/ReportDialog';
import ListTag from './../../screens/home/ListTag';
import PostDetailModal from '../dialogs/PostDetailModal';

const Post = ({
  post,
  me,
  reactions,
  reasons,
  currentTime,
  onDelete,
  onDeleteVinhVien,
  updatePostReaction,
  deletePostReaction
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [reactionsVisible, setReactionsVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [failedModalVisible, setFailedModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageModalVisible, setImageModalVisible] = useState(false);
  const [isPostDetailModalVisible, setPostDetailModalVisible] = useState(false);
  const [isSharedSection, setIsSharedSection] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [captionShare, setCaptionShare] = useState("");
  const [selectedOption, setSelectedOption] = useState({
    status: 1,
    name: "Công khai",
  });
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [listTagModalVisible, setListTagModalVisible] = useState(false);
  const [listTagData, setListTagData] = useState([]);
  const reactionRef = useRef(null);
  const [reactionListModalVisible, setReactionListModalVisible] = useState(false);
  const [selectedReactionTab, setSelectedReactionTab] = useState('all');

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [mediaList, setMediaList] = useState([]); // Danh sách media
const [currentMediaIndex, setCurrentMediaIndex] = useState(0); // Chỉ số của media đang xem


// Cập nhật danh sách media khi post thay đổi
useEffect(() => {
  const medias = post.ID_post_shared ? post.ID_post_shared.medias : post.medias;
  setMediaList(medias || []);
}, [post]);

  const status = [
    { status: 1, name: "Công khai" },
    { status: 2, name: "Bạn bè" },
    { status: 3, name: "Chỉ mình tôi" },
  ];

  const getTimeAgo = (createdAt) => {
    if (!createdAt) return "Không xác định";
    const diffMs = currentTime - new Date(createdAt).getTime();
    if (diffMs < 0) return "Vừa xong";
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    if (minutes > 0) return `${minutes} phút trước`;
    return `${seconds} giây trước`;
  };

  const getIcon = (status) => {
    switch (status) {
      case "Công khai":
        return <AiOutlineGlobal size={12} color="gray" />;
      case "Bạn bè":
        return <AiOutlineUsergroupAdd size={12} color="gray" />;
      case "Chỉ mình tôi":
        return <AiOutlineLock size={12} color="gray" />;
      default:
        return null;
    }
  };

  const getMediaStyle = (count, index) => {
    if (count === 1) return styles.singleMedia;
    else if (count === 2) return styles.doubleMedia;
    else if (count === 3)
      return index === 0 ? styles.tripleMediaFirst : styles.tripleMediaSecond;
    else if (count === 4) return styles.quadMedia;
    else {
      if (index < 2) return styles.fivePlusMediaFirstRow;
      else if (index === 2) return styles.fivePlusMediaSecondRowLeft;
      else if (index === 3) return styles.fivePlusMediaSecondRowMiddle;
      else return styles.fivePlusMediaSecondRowRight;
    }
  };

  const isVideo = (uri) => {
    return uri.endsWith(".mp4") || uri.endsWith(".mov") || uri.endsWith(".avi");
  };

  const renderMediaGrid = (medias) => {
    const mediaCount = medias.length;
    if (mediaCount === 0) return null;
  
    return (
      <div className={styles.mediaContainer}>
        {medias.slice(0, 5).map((uri, index) => (
          <div
            key={index}
            className={`${styles.mediaItem} ${getMediaStyle(mediaCount, index)}`}
            onClick={() => {
              setCurrentMediaIndex(index); // Lưu chỉ số của media được nhấn
              setImageModalVisible(true);
            }}
          >
            {isVideo(uri) ? (
              <div className={styles.videoWrapper}>
                <video src={uri} className={styles.video} />
                <div className={styles.playButton}></div>
              </div>
            ) : (
              <img src={uri} alt="Post Media" className={styles.image} />
            )}
            {index === 4 && mediaCount > 5 && (
              <div className={styles.overlayContainer}>
                <span className={styles.overlayText}>+{mediaCount - 5}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const postContainerClass = location.pathname.includes('/profile') ? styles.postContainerProfile : styles.postContainer;

  const handleShare = () => {
    setSelectedOption({ status: 1, name: "Công khai" });
    setShareVisible(true);
  };

  const handleSelectOption = (option) => {
    setSelectedOption(option);
    setStatusModalVisible(false);
  };

  const callAddPost_Reaction = async (ID_reaction, name, icon) => {
    try {
      const paramsAPI = { ID_post: post._id, ID_user: me._id, ID_reaction };
      await dispatch(addPost_Reaction(paramsAPI))
        .unwrap()
        .then((response) => {
          updatePostReaction(
            post._id,
            { _id: ID_reaction, name, icon },
            response.post_reaction._id
          );
        })
        .catch((error) => console.log("Lỗi call api addPost_Reaction", error));
    } catch (error) {
      console.log("Lỗi trong addPost_Reaction:", error);
    }
  };

  const callDeletePost_reaction = async (ID_post, ID_post_reaction) => {
    try {
      const paramsAPI = { _id: ID_post_reaction };
      await dispatch(deletePost_reaction(paramsAPI))
        .unwrap()
        .then(response => {
          deletePostReaction(ID_post, ID_post_reaction);
        })
        .catch(error => {
          console.log('Lỗi call api callDeletePost_reaction', error);
        });
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
        type: "Share",
        ID_post_shared: post.ID_post_shared
          ? post.ID_post_shared._id
          : post._id,
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
          console.log("Lỗi khi share bài viết:", error);
          setShareVisible(false);
          setFailedModalVisible(true);
          setTimeout(() => setFailedModalVisible(false), 1500);
        });
    } catch (error) {
      setIsLoading(false);
      console.log("Lỗi share bài viết:", error);
      setShareVisible(false);
      setFailedModalVisible(true);
      setTimeout(() => setFailedModalVisible(false), 1500);
    }
  };

  const timeAgo = getTimeAgo(post.createdAt);
  const timeAgoShare = getTimeAgo(post.ID_post_shared?.createdAt);
  const hasCaption = post?.caption?.trim() !== "";
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

  const reactionTabs = [
    { id: 'all', name: 'Tất cả', count: post.post_reactions?.length || 0 },
    ...Object.values(reactionCount).map(reaction => ({
      id: reaction.ID_reaction._id,
      icon: reaction.ID_reaction.icon,
      count: reaction.count,
    })),
  ];

  const filteredReactions = selectedReactionTab === 'all'
    ? post.post_reactions
    : post.post_reactions?.filter(
      reaction => reaction.ID_reaction._id === selectedReactionTab
    );

  return (
    <div className={postContainerClass}>
      {post.ID_post_shared && (
        <div>
          <div className={styles.headerShare}>
            <div className={styles.userInfo}>
              <a
                onClick={() => {
                  navigate(`/profile/${post.ID_user._id}`);
                }}
              >
                <img src={post.ID_user?.avatar} className={styles.avatar} alt="User Avatar" />
              </a>
              <div className={styles.userDetails}>
                <a
                  onClick={() => {
                    navigate(`/profile/${post.ID_user._id}`);
                  }}
                  className={styles.name}
                >
                  {post.ID_user?.first_name} {post.ID_user?.last_name}
                </a>
                <div className={styles.boxName}>
                  <span className={styles.time}>{timeAgo}</span>
                  <div className={styles.boxStatusDetail}>
                    {getIcon(post.status)}
                  </div>
                </div>
              </div>
            </div>
            <button
              className={styles.optionsButton}
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
            {hasCaption && (
              <p
                className={styles.caption}
                onClick={() => {
                  setIsSharedSection(true);
                  setPostDetailModalVisible(true);
                }}
              >
                {post.caption}
              </p>
            )}
          </div>
        </div>
      )}

      <div
        className={post.ID_post_shared ? styles.headerShared : styles.headerOriginal}
      >
        <div className={styles.boxHeader}>
          <div className={styles.headerContent}>
            {post.ID_post_shared ? (
              <div className={styles.userInfo}>
                <a onClick={() => navigate(`/profile/${post.ID_post_shared.ID_user._id}`)}>
                  <img src={post.ID_post_shared.ID_user?.avatar} className={styles.avatar} alt="User Avatar" />
                </a>
                <div className={styles.userDetails}>
                  <div>
                    <a
                      onClick={() => navigate(`/profile/${post.ID_post_shared.ID_user._id}`)}
                      className={styles.name}
                    >
                      {post.ID_post_shared.ID_user.first_name} {post.ID_post_shared.ID_user.last_name}
                    </a>
                    {post.ID_post_shared.tags?.length > 0 && (
                      <span>
                        <span style={{ color: "gray" }}> cùng với </span>
                        <a
                          onClick={() => navigate(`/profile/${post.ID_post_shared.tags[0]?._id}`)}
                          className={styles.name}
                        >
                          {post.ID_post_shared.tags[0]?.first_name}{" "}
                          {post.ID_post_shared.tags[0]?.last_name}
                        </a>
                        {post.ID_post_shared.tags.length > 1 && (
                          <>
                            <span style={{ color: 'gray' }}> và </span>
                            <a
                              onClick={() => {
                                setListTagData(post.ID_post_shared.tags);
                                setListTagModalVisible(true);
                              }}
                              className={styles.name}
                            >
                              {post.ID_post_shared.tags.length - 1} người khác
                            </a>
                          </>
                        )}
                      </span>
                    )}
                  </div>
                  <div className={styles.boxName}>
                    <span className={styles.time}>{timeAgoShare}</span>
                    <div className={styles.boxStatusDetail}>
                      {getIcon(post.ID_post_shared?.status)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.userInfo}>
                <a
                  onClick={() => navigate(`/profile/${post.ID_user._id}`)}
                >
                  <img
                    src={post.ID_user?.avatar}
                    className={styles.avatar}
                    alt="User Avatar"
                  />
                </a>
                <div className={styles.userDetails}>
                  <div>
                    <a
                      onClick={() => navigate(`/profile/${post.ID_user._id}`)}
                      className={styles.name}
                    >
                      {post.ID_user?.first_name} {post.ID_user?.last_name}
                    </a>
                    {post.tags?.length > 0 && (
                      <span>
                        <span style={{ color: "gray" }}> cùng với </span>
                        <a
                          onClick={() => navigate(`/profile/${post.tags[0]?._id}`)}
                          className={styles.name}
                        >
                          {post.tags[0]?.first_name} {post.tags[0]?.last_name}
                        </a>
                        {post.tags.length > 1 && (
                          <>
                            <span style={{ color: 'gray' }}> và </span>
                            <a
                              onClick={() => {
                                setListTagData(post.tags);
                                setListTagModalVisible(true);
                              }}
                              className={styles.name}
                            >
                              {post.tags.length - 1} người khác
                            </a>
                          </>
                        )}
                      </span>
                    )}
                  </div>
                  <div className={styles.boxName}>
                    <span className={styles.time}>{timeAgo}</span>
                    {getIcon(post.status)}
                  </div>
                </div>
              </div>
            )}
            {!post.ID_post_shared && (
              <button
                className={styles.optionsButton}
                onClick={() => {
                  const rect = reactionRef.current?.getBoundingClientRect();
                  setMenuPosition({
                    top: rect?.top || 0,
                    left: rect?.left || 0,
                  });
                  setModalVisible(true);
                }}
              >
                <FaEllipsisH size={22} />
              </button>
            )}
          </div>
          <p
            className={styles.caption}
            onClick={() => {
              setIsSharedSection(false);
              setPostDetailModalVisible(true);
            }}
          >
            {post.ID_post_shared
              ? post.ID_post_shared.caption
              : hasCaption && post.caption}
          </p>
        </div>
      </div>

      {post.ID_post_shared ? hasMedia && renderMediaGrid(post.ID_post_shared.medias) : hasMedia && renderMediaGrid(post.medias)}

      {!post._destroy && (
        <div className={styles.footer}>
          {post.post_reactions?.length > 0 ? (
            <div className={styles.footerReactions}>
              <a
                onClick={() => setReactionListModalVisible(true)}
              >
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
            <div className={styles.footerSpacer} />
          )}
          {post.comments?.length > 0 && (
            <span
              className={styles.commentCount}
              onClick={() => {
                setIsSharedSection(post.ID_post_shared ? true : false);
                setPostDetailModalVisible(true);
              }}
            >
              {post.comments.length} bình luận
            </span>
          )}
        </div>
      )}

      {!post._destroy && (
        <div className={styles.interactions}>
          <div className={styles.reactionContainer}>
            <button
              ref={reactionRef}
              className={`${styles.action} ${userReaction ? styles.reacted : ""}`}
              onMouseEnter={() => setReactionsVisible(true)}
              onMouseLeave={() => {
                setTimeout(() => {
                  if (!document.querySelector(`.${styles.reactionBar}:hover`) && !document.querySelector(`.${styles.reactionContainer}:hover`)) {
                    setReactionsVisible(false);
                  }
                }, 200);
              }}
              onClick={() => {
                console.log("Reaction button clicked, userReaction:", userReaction);
                userReaction
                  ? callDeletePost_reaction(post._id, userReaction._id)
                  : callAddPost_Reaction(
                    reactions[0]?._id,
                    reactions[0]?.name,
                    reactions[0]?.icon
                  );
              }}
            >
              <div className={styles.reactionIconBox}>
                <span>
                  {userReaction ? userReaction.ID_reaction.icon : <FaThumbsUp size={15} />}
                </span>
                <span className={userReaction ? styles.reactedText : ""}>
                  {userReaction ? userReaction.ID_reaction.name : reactions[0]?.name || "Thích"}
                </span>
              </div>
            </button>

            {reactionsVisible && (
              <div
                className={styles.reactionBar}
                onMouseEnter={() => setReactionsVisible(true)}
                onMouseLeave={() => setReactionsVisible(false)}
              >
                {reactions.map((reaction, index) => (
                  <button
                    key={index}
                    className={styles.reactionButton}
                    onClick={() => {
                      callAddPost_Reaction(
                        reaction._id,
                        reaction.name,
                        reaction.icon
                      );
                      setReactionsVisible(false);
                    }}
                  >
                    {reaction.icon}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            className={styles.action}
            onClick={() => {
              setIsSharedSection(post.ID_post_shared ? true : false);
              setPostDetailModalVisible(true);
            }}
          >
            <FaComment size={17} />
            <span>Bình luận</span>
          </button>
          <button className={styles.action} onClick={() => handleShare()}>
            <FaShare size={17} />
            <span>Chia sẻ</span>
          </button>
        </div>
      )}

      {shareVisible && (
        <div className={styles.overlay} onClick={() => setShareVisible(false)}>
          <div className={styles.modalContainer}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.shareHeader}>
              <img src={me?.avatar} className={styles.avatar} alt="User Avatar" />
              <div>
                <span className={styles.name}>
                  {me?.first_name} {me?.last_name}
                </span>
                <div className={styles.boxStatus}>
                  <button
                    className={styles.btnStatus}
                    onClick={() => setStatusModalVisible(true)}
                  >
                    {selectedOption.name}
                  </button>
                </div>
              </div>
            </div>
            <textarea
              placeholder="Hãy nói gì đó về nội dung này"
              className={styles.contentShare}
              value={captionShare}
              onChange={(e) => setCaptionShare(e.target.value)}
            />
            <button className={styles.shareButton} onClick={() => callAddPostShare()}>
              Chia sẻ ngay
            </button>
          </div>
        </div>
      )}

      {modalVisible && (
        <div className={styles.overlay} onClick={() => setModalVisible(false)}>
          <div className={styles.modalContent}>
            {me._id !== post.ID_user?._id ? (
              <button
                className={styles.optionButton}
                onClick={() => {
                  setModalVisible(false);
                  handleOpen();
                }}
              >
                <i className="fas fa-exclamation-circle" /> Báo cáo
              </button>
            ) : (
              <>
                <button
                  className={styles.optionButton}
                  onClick={() => {
                    onDelete();
                    setModalVisible(false);
                  }}
                >
                  <i
                    className={post._destroy ? "fas fa-undo" : "fas fa-trash"}
                  />
                  {post._destroy ? "Phục hồi" : "Xóa bài viết"}
                </button>
                {post._destroy && (
                  <button
                    className={styles.optionButton}
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

      {statusModalVisible && (
        <div className={styles.overlay} onClick={() => setStatusModalVisible(false)}>
          <div className={styles.modalContent}>
            {status.map((option, index) => (
              <button
                key={index}
                className={styles.optionButton}
                onClick={() => handleSelectOption(option)}
              >
                {getIcon(option.name)} {option.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {listTagModalVisible && (
        <div className={styles.overlay} onClick={() => setListTagModalVisible(false)}>
          <div className={styles.modalContent} style={{ width: '400px', maxHeight: '80vh', overflowY: 'auto' }}>
            <ListTag ListTag={listTagData} />
          </div>
        </div>
      )}

{isImageModalVisible && (
  <div className="mediaOverlay" onClick={() => setImageModalVisible(false)}>
    <div className="fullMediaContainer" onClick={(e) => e.stopPropagation()}>
      {/* Nút đóng modal */}
      <button
        className="closeButton"
        onClick={() => setImageModalVisible(false)}
      >
        ✕
      </button>
  
      {/* Container cho các nút điều hướng */}
      <div className="navButtonsContainer">
        {/* Nút Previous */}
        {mediaList.length > 1 && (
          <button
            className="navButton"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentMediaIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
            }}
          >
            ❮
          </button>
        )}

        {/* Hiển thị media hiện tại */}
        <div className="mediaWrapper">
          {isVideo(mediaList[currentMediaIndex]) ? (
            <video src={mediaList[currentMediaIndex]} className="fullMedia" controls autoPlay />
          ) : (
            <img src={mediaList[currentMediaIndex]} className="fullMedia" alt="Full Media" />
          )}
        </div>

        {/* Nút Next */}
        {mediaList.length > 1 && (
          <button
            className="navButton"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentMediaIndex((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1));
            }}
          >
            ❯
          </button>
        )}
      </div>
    </div>
  </div>
)}

      {successModalVisible && (
        <div className={styles.overlay}>
          <div className={styles.successModal}>Chia sẻ bài viết thành công!</div>
        </div>
      )}

      {failedModalVisible && (
        <div className={styles.overlay}>
          <div className={styles.failedModal}>
            Chia sẻ bài viết thất bại. Vui lòng thử lại!
          </div>
        </div>
      )}

      {reactionListModalVisible && (
        <div
          className={styles.overlay}
          onClick={() => setReactionListModalVisible(false)}
        >
          <div
            className={styles.modalContent1}
            style={{ width: "400px", maxHeight: "80vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Cảm xúc về bài viết</h3>
            <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0', marginBottom: '10px' }}>
              {reactionTabs.map((tab) => (
                <button
                  key={tab.id}
                  style={{
                    padding: '8px 16px',
                    background: 'none',
                    border: 'none',
                    borderBottom: selectedReactionTab === tab.id ? '2px solid #1877f2' : 'none',
                    color: selectedReactionTab === tab.id ? '#1877f2' : '#65676b',
                    fontWeight: selectedReactionTab === tab.id ? 'bold' : 'normal',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  onClick={() => setSelectedReactionTab(tab.id)}
                >
                  {tab.icon && <span style={{ marginRight: '5px' }}>{tab.icon}</span>}
                  {tab.name || ''}
                  <span style={{ marginLeft: '5px' }}>{tab.count}</span>
                </button>
              ))}
            </div>
            {filteredReactions?.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {filteredReactions.map((reaction, index) => (
                  <li
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "10px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                    onClick={() => navigate(`/profile/${reaction.ID_user._id}`)}
                  >
                    <img
                      src={reaction.ID_user.avatar}
                      alt="User Avatar"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        marginRight: "10px",
                      }}
                    />
                    <div>
                      <span style={{ fontWeight: "bold" }}>
                        {reaction.ID_user.first_name} {reaction.ID_user.last_name}
                      </span>
                      <div>{reaction.ID_reaction.icon} {reaction.ID_reaction.name}</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Chưa có biểu cảm nào.</p>
            )}
          </div>
        </div>
      )}

      <ReportDialog
        open={open}
        onClose={handleClose}
        reasons={reasons}
        ID_me={me._id}
        ID_post={post._id}
        ID_user={null}
      />

      {isPostDetailModalVisible && (
        <PostDetailModal
          post={post}
          me={me}
          reactions={reactions}
          currentTime={currentTime}
          onClose={() => setPostDetailModalVisible(false)}
          isSharedSection={isSharedSection}
          reasons={reasons}
        />
      )}
    </div>
  );
};

export default Post;