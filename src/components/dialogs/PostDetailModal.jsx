import React, { useState, useEffect, useRef } from 'react';
import { FaThumbsUp, FaComment, FaShare, FaEllipsisH } from 'react-icons/fa';
import { AiOutlineGlobal, AiOutlineUsergroupAdd, AiOutlineLock } from 'react-icons/ai';
import { MdOutlinePhoto } from 'react-icons/md';
import { IoPlayCircle } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Menu, MenuItem } from '@mui/material';
import styles from '../../styles/components/items/PostDetailS.module.css';
import {
  getChiTietPost,
  addPost_Reaction,
  deletePost_reaction,
  addPost,
  addComment,
  editComment,
  deleteComment,
  changeDestroyPost,
  getAllGroupOfUser,
} from '../../rtk/API';
import ReportDialog from '../../components/dialogs/ReportDialog';
// hahaha
const PostDetailModal = ({ post: initialPost, me, reactions, currentTime, onClose, isSharedSection, reasons }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.app.token);
  const [post, setPost] = useState(initialPost);
  const [comments, setComments] = useState([]);
  const [countComments, setCountComments] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isImageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [reactionsVisible, setReactionsVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const [isPermission, setIsPermission] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [failedMessage, setFailedMessage] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [showReplies, setShowReplies] = useState({});
  const [reactionListModalVisible, setReactionListModalVisible] = useState(false);
  const [selectedReactionTab, setSelectedReactionTab] = useState('all');
  const reactionRef = useRef(null);
  const commentInputRef = useRef(null);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploadingMedia, setUploadingMedia] = useState(null);
  const [mediaList, setMediaList] = useState([]); // Danh sách media
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0); // Chỉ số của media đang xem
  const [editingComment, setEditingComment] = useState(null);
  const [commentMenu, setCommentMenu] = useState({ anchorEl: null, commentId: null });
  

  const MAX_REPLY_LEVEL = 2; // Giới hạn tối đa cấp reply

  const getReplyLevel = (comment, commentsList, level = 0) => {
    if (!comment.ID_comment_reply) return level;
    const parentComment = commentsList.find(
      (c) => c._id === comment.ID_comment_reply._id
    );
    if (!parentComment) return level;
    return getReplyLevel(parentComment, commentsList, level + 1);
  };



  const removeTempComment = (commentsList, tempId) => {
    return commentsList
      .map((comment) => {
        // Nếu comment hiện tại là temp comment, loại bỏ nó
        if (comment._id === tempId) {
          return null;
        }
        // Nếu comment có replys, tiếp tục xóa đệ quy trong replys
        if (Array.isArray(comment.replys) && comment.replys.length > 0) {
          return {
            ...comment,
            replys: removeTempComment(comment.replys, tempId).filter(Boolean),
          };
        }
        return comment;
      })
      .filter(Boolean); // Loại bỏ các comment null (temp comment đã bị xóa)
  };

  // Cập nhật danh sách media khi post thay đổi
  useEffect(() => {
    const medias = post.ID_post_shared ? post.ID_post_shared.medias : post.medias;
    setMediaList(medias || []);
  }, [post]);


  const handleMouseEnter = () => {
    setReactionsVisible(true);
  };

  const handleMouseLeave = () => {
    setTimeout(() => {
      if (
        !document.querySelector(`.${styles.reactionBar}:hover`) &&
        !document.querySelector(`.${styles.reactionContainer}:hover`)
      ) {
        setReactionsVisible(false);
      }
    }, 200);
  };

  // Logic tính toán reaction count và top reactions
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

  const uploadFile = async (file) => {
    if (!file || !file.type || !file.name) {
      console.error("File không hợp lệ:", file);
      return null;
    }
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "ml_default");
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/ddasyg5z3/upload",
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return response.data.secure_url;
    } catch (error) {
      console.error("Lỗi tải file lên Cloudinary:", error.message);
      setFailedMessage(
        `Lỗi tải file: ${error.response?.data?.error?.message || "Lỗi không xác định"
        }`
      );
      setTimeout(() => setFailedMessage(''), 1500);
      return null;
    }
  };

  const handleMediaSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setFailedMessage('Không có file được chọn!');
      setTimeout(() => setFailedMessage(''), 3000);
      return;
    }
  
    // Tạo URL tạm thời từ file để hiển thị placeholder
    const tempImageUrl = URL.createObjectURL(file);
  
    setUploadingMedia(file);
  
    // Gọi callAddComment với cả URL tạm thời và file
    const type = file.type.startsWith('video/') ? 'video' : 'image';
    await callAddComment(type, file, tempImageUrl);
  
    setUploadingMedia(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleReplies = (commentId) => {
    setShowReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const callGetChiTietPost = async (ID_post) => {
    try {
      setIsLoading(true);
      await dispatch(getChiTietPost({ ID_post, ID_user: me._id, token }))
        .unwrap()
        .then((response) => {
          if (response.post) {
            setPost(response.post);
            setComments(response.post.comments || []);
            setCountComments(response.post.countComments || 0);
            setIsPermission(true);
          } else {
            // Bài viết không tồn tại, coi như bị xóa
            setPost(null);
            setIsPermission(false);
          }
        })
        .catch((error) => {
          console.log('API không trả về bài viết: ' + error.message);
          setPost(null);
          if (error.message?.includes("unauthorized") || error.status === 403) {
            setIsPermission(false); // Không có quyền truy cập
          } else {
            // Các lỗi khác (bao gồm "not found"), coi như bài viết bị xóa
            setIsPermission(false);
          }
        });
    } catch (error) {
      console.log('Lỗi khi lấy chi tiết bài viết:', error);
      setPost(null);
      setIsPermission(false);
    } finally {
      setIsLoading(false);
    }
  };

  const callChangeDestroyPost = async (ID_post) => {
    try {
      await dispatch(changeDestroyPost({ _id: ID_post }))
        .unwrap()
        .then(() => {
          setSuccessMessage('Đã xóa bài viết thành công!');
          setTimeout(() => {
            setSuccessMessage('');
            onClose();
          }, 1500);
        })
        .catch((error) => {
          console.log('Lỗi khi xóa bài viết:', error);
          setFailedMessage('Xóa bài viết thất bại. Vui lòng thử lại!');
          setTimeout(() => setFailedMessage(''), 1500);
        });
    } catch (error) {
      console.log('Lỗi trong callChangeDestroyPost:', error);
      setFailedMessage('Xóa bài viết thất bại. Vui lòng thử lại!');
      setTimeout(() => setFailedMessage(''), 1500);
    }
  };

  const addReplyToComment = (commentsList, newReply, isPending = false) => {
    return commentsList.map((comment) => {
      if (comment._id === newReply.ID_comment_reply?._id) {
        return {
          ...comment,
          replys: [...(comment.replys ?? []), { ...newReply, isPending }],
        };
      }
      if (Array.isArray(comment.replys) && comment.replys.length > 0) {
        return {
          ...comment,
          replys: addReplyToComment(comment.replys, newReply, isPending),
        };
      }
      return comment;
    });
  };

  const callAddComment = async (type, content, tempImageUrl = null) => {
    // Nếu là bình luận văn bản và không có nội dung, thoát
    if (!content && type === 'text') return;
  
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const tempComment = {
      _id: tempId,
      ID_user: {
        _id: me._id,
        first_name: me.first_name,
        last_name: me.last_name,
        avatar: me.avatar,
      },
      content: type === 'text' ? content : tempImageUrl, // Sử dụng URL tạm thời cho hình ảnh/video
      type,
      createdAt: new Date().toISOString(),
      replys: [],
      ID_comment_reply: replyingTo ? { _id: replyingTo._id } : null,
      isPending: true,
      tempImageUrl: type !== 'text' ? tempImageUrl : null, // Lưu URL tạm thời để quản lý
    };
  
    // Thêm temp comment vào danh sách
    setComments((prevComments) => {
      if (replyingTo) {
        return addReplyToComment(prevComments, tempComment, true);
      }
      return [...prevComments, tempComment];
    });
    setCountComments((prev) => prev + 1);
    setNewComment('');
    setReplyingTo(null);
  
    try {
      let finalContent = content;
      // Nếu là hình ảnh hoặc video, tải lên Cloudinary
      if (type !== 'text') {
        finalContent = await uploadFile(content); // content là file
        if (!finalContent) {
          throw new Error('Tải file lên thất bại');
        }
      }
  
      const paramsAPI = {
        ID_user: me._id,
        ID_post: post._id,
        content: finalContent, // Sử dụng URL thật từ Cloudinary
        type,
        ID_comment_reply: replyingTo?._id || null,
      };
      const response = await dispatch(addComment(paramsAPI)).unwrap();
  
      // Xóa temp comment trước khi thêm comment thật
      setComments((prevComments) => {
        // Xóa temp comment ở tất cả các cấp độ
        const updatedComments = removeTempComment(prevComments, tempId);
  
        // Thêm comment thật vào danh sách
        const newComment = { ...response.comment, tempImageUrl: null };
        if (response.comment.ID_comment_reply) {
          return addReplyToComment(updatedComments, newComment);
        }
        return [...updatedComments, newComment];
      });
  
      // Thu hồi URL tạm thời để tránh rò rỉ bộ nhớ
      if (tempImageUrl) {
        URL.revokeObjectURL(tempImageUrl);
      }
  
      // Nếu là reply, mở rộng hiển thị replies
      if (response.comment.ID_comment_reply) {
        setShowReplies((prev) => ({
          ...prev,
          [response.comment.ID_comment_reply._id]: true,
        }));
      }
    } catch (error) {
      console.log('Lỗi khi callAddComment:', error);
      // Xóa temp comment nếu API thất bại
      setComments((prevComments) => removeTempComment(prevComments, tempId));
      setCountComments((prev) => prev - 1);
      setFailedMessage('Gửi bình luận thất bại. Vui lòng thử lại!');
      setTimeout(() => setFailedMessage(''), 3000);
  
      // Thu hồi URL tạm thời nếu có lỗi
      if (tempImageUrl) {
        URL.revokeObjectURL(tempImageUrl);
      }
    }
  };

  const callAddPost_Reaction = async (ID_reaction, name, icon) => {
    try {
      const paramsAPI = {
        ID_post: post._id,
        ID_user: me._id,
        ID_reaction: ID_reaction,
      };
      await dispatch(addPost_Reaction(paramsAPI))
        .unwrap()
        .then((response) => {
          const newReaction = { _id: ID_reaction, name, icon };
          updatePostReaction(newReaction, response.post_reaction._id);
        })
        .catch((error) => {
          console.log('Lỗi call api addPost_Reaction', error);
        });
    } catch (error) {
      console.log('Lỗi trong addPost_Reaction:', error);
    }
  };

  const updatePostReaction = (newReaction, ID_post_reaction) => {
    const userReaction = post.post_reactions?.find((reaction) => reaction.ID_user._id === me._id);
    if (userReaction) {
      const updatedReactions = post.post_reactions.map((reaction) =>
        reaction.ID_user._id === me._id
          ? {
            _id: ID_post_reaction,
            ID_user: {
              _id: me._id,
              first_name: me.first_name,
              last_name: me.last_name,
              avatar: me.avatar,
            },
            ID_reaction: newReaction,
          }
          : reaction
      );
      setPost({ ...post, post_reactions: updatedReactions });
    } else {
      setPost({
        ...post,
        post_reactions: [
          ...(post.post_reactions || []),
          {
            _id: ID_post_reaction,
            ID_user: {
              _id: me._id,
              first_name: me.first_name,
              last_name: me.last_name,
              avatar: me.avatar,
            },
            ID_reaction: newReaction,
          },
        ],
      });
    }
  };

  const callDeletePost_reaction = async (ID_post_reaction) => {
    try {
      const paramsAPI = { _id: ID_post_reaction };
      await dispatch(deletePost_reaction(paramsAPI))
        .unwrap()
        .then(() => {
          const updatedReactions = post.post_reactions.filter(
            (reaction) => reaction._id !== ID_post_reaction
          );
          setPost({ ...post, post_reactions: updatedReactions });
        })
        .catch((error) => {
          console.log('Lỗi call api callDeletePost_reaction', error);
        });
    } catch (error) {
      console.log('Lỗi trong callDeletePost_reaction:', error);
    }
  };

  const SharedPost = ({ post, me, setShareVisible }) => {
    const [captionShare, setCaptionShare] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [isLoadingGroups, setIsLoadingGroups] = useState(false);
    const [selectedOption, setSelectedOption] = useState({ status: 1, name: 'Công khai' });
    const [groups, setGroups] = useState([]);
    const deeplinkPost = `https://linkage.id.vn/deeplink?url=linkage://post-chi-tiet?ID_post=${post._id.toString()}`;

    const status = [
      { status: 1, name: 'Công khai' },
      { status: 2, name: 'Bạn bè' },
      { status: 3, name: 'Chỉ mình tôi' },
    ];

    const handleSelectOption = (option) => {
      setSelectedOption(option);
      setModalVisible(false);
    };

    const callGetAllGroupOfUser = async (ID_user) => {
      try {
        setIsLoadingGroups(true);
        const response = await dispatch(getAllGroupOfUser({ ID_user, token })).unwrap();
        setGroups(response.groups);
      } catch (error) {
        console.log('Error:', error);
      } finally {
        setIsLoadingGroups(false);
      }
    };

    const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text);
      setSuccessMessage('Đã sao chép liên kết!');
      setTimeout(() => setSuccessMessage(''), 1500);
    };

    const callAddPostShare = async (captionShare, status) => {
      if (!me || !me._id) {
        setFailedMessage('Vui lòng đăng nhập để chia sẻ bài viết!');
        setTimeout(() => setFailedMessage(''), 1500);
        return;
      }
      try {
        setIsSharing(true);
        setIsButtonLoading(true);
        const paramsAPI = {
          ID_user: me._id,
          caption: captionShare.trim(),
          medias: [],
          status: status,
          type: 'Share',
          ID_post_shared: post.ID_post_shared ? post.ID_post_shared._id : post._id,
          tags: [],
        };
        await dispatch(addPost(paramsAPI))
          .unwrap()
          .then(() => {
            setShareVisible(false);
            setSuccessMessage('Đã chia sẻ bài viết thành công!');
            setTimeout(() => setSuccessMessage(''), 1500);
          })
          .catch((error) => {
            console.log('Lỗi khi share bài viết:', error);
            setFailedMessage('Chia sẻ bài viết thất bại. Vui lòng thử lại!');
            setTimeout(() => setFailedMessage(''), 1500);
          });
      } catch (error) {
        console.log('Lỗi share bài viết:', error);
        setFailedMessage('Chia sẻ bài viết thất bại. Vui lòng thử lại!');
        setTimeout(() => setFailedMessage(''), 1500);
      } finally {
        setIsSharing(false);
        setIsButtonLoading(false);
      }
    };

    useEffect(() => {
      callGetAllGroupOfUser(me._id);
    }, []);

    return (
      <div className={styles.sharedPost} onClick={(e) => e.stopPropagation()}>
        <div className={styles.sharedPostHeader}>
          <h4>Chia sẻ bài viết</h4>
        </div>
        <div className={styles.sharedPostBody}>
          <div className={styles.userInfo}>
            <img src={me?.avatar} className={styles.avatar} alt="User Avatar" />
            <div>
              <span className={styles.name}>
                {me?.first_name} {me?.last_name}
              </span>
              <div className={styles.boxStatus}>
                <button
                  className={styles.btnStatus}
                  onClick={() => setModalVisible(true)}
                >
                  {selectedOption.name}
                </button>
              </div>
            </div>
          </div>
          <textarea
            placeholder="Hãy nói gì đó về nội dung này"
            value={captionShare}
            onChange={(e) => setCaptionShare(e.target.value)}
            className={styles.captionInput}
            maxLength={500}
          />
          <button
            onClick={() => callAddPostShare(captionShare, selectedOption.name)}
            className={styles.shareButton}
            disabled={isButtonLoading}
          >
            {isButtonLoading ? 'Đang chia sẻ...' : 'Chia sẻ ngay'}
          </button>
          <div className={styles.shareOptions}>
            <h5>Chia sẻ lên</h5>
            <button
              onClick={() => copyToClipboard(deeplinkPost)}
              className={styles.copyLinkButton}
            >
              Sao chép liên kết
            </button>
          </div>
        </div>
        {modalVisible && (
          <div
            className={styles.overlay}
            onClick={(e) => {
              e.stopPropagation();
              setModalVisible(false);
            }}
          >
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              {status.map((option, index) => (
                <button
                  key={index}
                  className={styles.optionButton}
                  onClick={() => handleSelectOption(option)}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (post?._id) {
      callGetChiTietPost(post._id);
    }
  }, [post?._id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getTimeAgo = (createdAt) => {
    if (!createdAt) return "Không xác định";
    const diffMs = currentTime - new Date(createdAt).getTime();
    if (diffMs < 0) return "Vừa xong";
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    if (months > 0) return `${months} tháng trước`;
    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    if (minutes > 0) return `${minutes} phút trước`;
    return `${seconds} giây trước`;
  };

  const getIcon = (status) => {
    switch (status) {
      case "Công khai":
        return <AiOutlineGlobal size={12} color="#b0b3b8" />;
      case "Bạn bè":
        return <AiOutlineUsergroupAdd size={12} color="#b0b3b8" />;
      case "Chỉ mình tôi":
        return <AiOutlineLock size={12} color="#b0b3b8" />;
      default:
        return null;
    }
  };

  const isVideo = (uri) => {
    return uri.endsWith(".mp4") || uri.endsWith(".mov") || uri.endsWith(".avi");
  };

  const getMediaStyle = (count, index) => {
    if (count === 1) return "single-media";
    else if (count === 2) return "double-media";
    else if (count === 3)
      return index === 0 ? "triple-media-first" : "triple-media-second";
    else if (count === 4) return "quad-media";
    else {
      if (index < 2) return "five-plus-media-first-row";
      else if (index === 2) return "five-plus-media-second-row-left";
      else if (index === 3) return "five-plus-media-second-row-middle";
      else return "five-plus-media-second-row-right";
    }
  };

  const renderMediaGrid = (medias) => {
    const mediaCount = medias?.length || 0;
    if (mediaCount === 0) return null;
  
    return (
      <div className="media-container">
        {medias.slice(0, 5).map((uri, index) => (
          <div
            key={index}
            className={`media-item ${getMediaStyle(mediaCount, index)}`}
            onClick={() => {
              setCurrentMediaIndex(index);
              setImageModalVisible(true);
            }}
          >
            {isVideo(uri) ? (
              <div className="video-wrapper">
                <video src={uri} className="video" />
                <div className="play-button">
                  <IoPlayCircle size={40} color="white" />
                </div>
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

  // Modified handleAddComment to handle both adding and editing comments
  const handleAddComment = (e) => {
    if (e.key === 'Enter' && newComment.trim()) {
      if (editingComment) {
        callEditComment(editingComment._id, newComment);
      } else {
        callAddComment('text', newComment);
      }
    }
  };

  const callEditComment = async (ID_comment, newContent) => {
    try {
      const updateComment = (commentsList, commentId, newContent) => {
        return commentsList.map((comment) => {
          if (comment._id === commentId) {
            return { ...comment, content: newContent, isPending: true };
          }
          if (Array.isArray(comment.replys) && comment.replys.length > 0) {
            return {
              ...comment,
              replys: updateComment(comment.replys, commentId, newContent),
            };
          }
          return comment;
        });
      };

      setComments((prevComments) => updateComment(prevComments, ID_comment, newContent));

      const response = await dispatch(editComment({ ID_comment, newContent })).unwrap();

      if (response.status) {
        setComments((prevComments) =>
          updateComment(prevComments, ID_comment, newContent).map((comment) =>
            comment._id === ID_comment ? { ...comment, isPending: false } : comment
          )
        );
        setSuccessMessage('Đã chỉnh sửa bình luận thành công!');
        setTimeout(() => setSuccessMessage(''), 1500);
      } else {
        throw new Error('Chỉnh sửa bình luận thất bại');
      }
    } catch (error) {
      console.log('Lỗi khi chỉnh sửa bình luận:', error);
      setFailedMessage('Chỉnh sửa bình luận thất bại. Vui lòng thử lại!');
      setTimeout(() => setFailedMessage(''), 1500);
      callGetChiTietPost(post._id);
    } finally {
      setEditingComment(null);
      setNewComment('');
    }
  };


  const handleReply = (comment) => {
    const level = getReplyLevel(comment, comments);
    if (level >= MAX_REPLY_LEVEL) {
      setFailedMessage(`Không thể trả lời thêm. Giới hạn tối đa là ${MAX_REPLY_LEVEL} cấp reply.`);
      setTimeout(() => setFailedMessage(''), 1500);
      return;
    }
    setReplyingTo(comment);
    setNewComment(`@${comment.ID_user.first_name} ${comment.ID_user.last_name} `);
    commentInputRef.current?.focus();
  };
  const handleOptionsClick = (e) => {
    if (menuVisible) {
      setMenuVisible(false);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPosition({
        top: rect.top - 80,
        left: rect.left - 100,
      });
      setMenuVisible(true);
    }
  };

  const userReaction = post?.post_reactions?.find((reaction) => reaction.ID_user._id === me._id);

  const timeAgo = getTimeAgo(post?.createdAt);
  const timeAgoShare = post?.ID_post_shared ? getTimeAgo(post.ID_post_shared.createdAt) : null;

  const handleEditComment = (comment) => {
    setEditingComment(comment);
    setNewComment(comment.content);
    setReplyingTo(null); // Clear replying state
    commentInputRef.current?.focus();
  };

  const handleDeleteComment = async (ID_comment) => {
    try {
      const removeComment = (commentsList, commentId) => {
        return commentsList
          .map((comment) => {
            if (comment._id === commentId) {
              return null;
            }
            if (Array.isArray(comment.replys) && comment.replys.length > 0) {
              return {
                ...comment,
                replys: removeComment(comment.replys, commentId).filter(Boolean),
              };
            }
            return comment;
          })
          .filter(Boolean);
      };

      setComments((prevComments) => removeComment(prevComments, ID_comment));
      setCountComments((prev) => prev - 1);

      const response = await dispatch(deleteComment({ ID_comment })).unwrap();

      if (response.status) {
        setSuccessMessage('Đã xóa bình luận thành công');
        setTimeout(() => setSuccessMessage(''), 1500);
      } else {
        setComments((prevComments) => [...prevComments]);
        setCountComments((prev) => prev + 1);
        throw new Error('Xóa bình luận thất bại');
      }
    } catch (error) {
      console.log('Lỗi khi xóa bình luận:', error);
      setFailedMessage('Xóa bình luận thất bại. Vui lòng thử lại!');
      setTimeout(() => setFailedMessage(''), 1500);
      callGetChiTietPost(post._id);
    }
  };

  

  const renderComment = (comment, level = 0) => (
    <>
      <div
        key={comment._id}
        className={`${styles.comment} ${comment.isPending ? styles.pendingComment : ''}`}
        style={{ marginLeft: level * 1.25 + 'rem' }}
      >
        <img
          onClick={() => navigate(`/profile/${comment.ID_user._id}`)}
          src={comment.ID_user?.avatar}
          className={styles.commentAvatar}
          alt="Ảnh đại diện"
        />
        <div className={styles.commentWrapper}>
          <div className={styles.commentContent}>
            <div className={styles.commentBubble}>
              <span className={styles.commentUser}>
                {comment.ID_user?.first_name} {comment.ID_user?.last_name}
              </span>
              {comment.type === 'text' ? (
                <p>{comment.content}</p>
              ) : comment.type === 'image' ? (
                <img
                  src={comment.isPending && comment.tempImageUrl ? comment.tempImageUrl : comment.content}
                  alt="Ảnh bình luận"
                  className={styles.commentMedia}
                  onClick={() => {
                    if (!comment.isPending) {
                      setMediaList([comment.content]);
                      setCurrentMediaIndex(0);
                      setImageModalVisible(true);
                    }
                  }}
                  style={comment.isPending ? { opacity: 0.7 } : {}}
                />
              ) : comment.type === 'video' ? (
                <div className={styles.videoWrapper}>
                  <video
                    src={comment.isPending && comment.tempImageUrl ? comment.tempImageUrl : comment.content}
                    className={styles.commentMedia}
                    style={comment.isPending ? { opacity: 0.7 } : {}}
                  />
                  <div
                    className={styles.playButton}
                    onClick={() => {
                      if (!comment.isPending) {
                        setMediaList([comment.content]);
                        setCurrentMediaIndex(0);
                        setImageModalVisible(true);
                      }
                    }}
                  >
                    <IoPlayCircle size={40} color="white" />
                  </div>
                </div>
              ) : null}
              {comment.isPending && <span className={styles.pendingIndicator}>Đang gửi...</span>}
            </div>
          </div>
          {!comment.isPending && (
            <div className={styles.commentActions}>
              <span>Thích</span>
              <span onClick={() => handleReply(comment)}>Trả lời</span>
              <span className={styles.commentTime}>{getTimeAgo(comment.createdAt)}</span>
              {comment.replys?.length > 0 && (
                <span
                  className={styles.toggleReplies}
                  onClick={() => toggleReplies(comment._id)}
                >
                  {showReplies[comment._id] ? 'Ẩn trả lời' : `Hiện ${comment.replys.length} trả lời`}
                </span>
              )}
            </div>
          )}
        </div>
        {/* Ẩn dấu ba chấm khi bình luận đang ở trạng thái "Đang gửi" */}
        {comment.ID_user._id === me._id && !comment.isPending && (
          <button
            className={styles.optionsButton}
            onClick={(e) => {
              setCommentMenu({ anchorEl: e.currentTarget, commentId: comment._id });
            }}
            style={{ opacity: Boolean(commentMenu.anchorEl) && 1 }}
          >
            <FaEllipsisH size={16} />
          </button>
        )}
      </div>
      {comment.replys?.length > 0 && showReplies[comment._id] && (
        <div className={styles.replies}>
          {comment.replys.filter((reply) => !reply._destroy).map((reply) => renderComment(reply, level + 1))}
        </div>
      )}
      {commentMenu.commentId === comment._id && (
        <Menu
          anchorEl={commentMenu.anchorEl}
          open={Boolean(commentMenu.anchorEl)}
          onClose={() => setCommentMenu({ anchorEl: null, commentId: null })}
          PaperProps={{
            style: {
              width: '150px',
            },
          }}
        >
          <MenuItem
            onClick={() => {
              const selectedComment = comments.find((c) => c._id === commentMenu.commentId) ||
                comments.flatMap((c) => c.replys || []).find((r) => r._id === commentMenu.commentId);
              handleEditComment(selectedComment);
              setCommentMenu({ anchorEl: null, commentId: null });
            }}
          >
            Chỉnh sửa
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleDeleteComment(commentMenu.commentId);
              setCommentMenu({ anchorEl: null, commentId: null });
            }}
          >
            Xóa
          </MenuItem>
        </Menu>
      )}
    </>
  );

  // Phần input trong return của PostDetailModal
  <div className={styles.inputContainer}>
    {(replyingTo || editingComment) && (
      <div className={styles.inputStatus}>
        <span className={styles.inputStatusText}>
          {editingComment
            ? 'Đang chỉnh sửa bình luận'
            : `Đang trả lời ${replyingTo.ID_user.first_name} ${replyingTo.ID_user.last_name}`}
        </span>
        <button
          className={styles.cancelStatusButton}
          onClick={() => {
            setReplyingTo(null);
            setEditingComment(null);
            setNewComment('');
          }}
        >
          Hủy
        </button>
      </div>
    )}
    <div className={styles.inputContainer2}>
      <img src={me?.avatar} className={styles.avatar} alt="Ảnh đại diện" />
      <div className={styles.inputWrapper}>
        <input
          ref={commentInputRef}
          type="text"
          placeholder={
            editingComment
              ? 'Chỉnh sửa bình luận của bạn...'
              : replyingTo
                ? `Trả lời ${replyingTo.ID_user.first_name} ${replyingTo.ID_user.last_name}`
                : 'Viết bình luận...'
          }
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyPress={handleAddComment}
          disabled={uploadingMedia}
        />
      </div>
      <div className={styles.inputIcons}>
        <MdOutlinePhoto
          size={20}
          onClick={() => fileInputRef.current?.click()}
          style={{ cursor: 'pointer' }}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          style={{ display: 'none' }}
          onChange={handleMediaSelect}
        />
      </div>
    </div>
  </div>

  if (isLoading) {
    return <div className={styles.loading}>Đang tải...</div>;
  }

  if (!isPermission) {
    return <div className={styles.error}>Bạn không có quyền truy cập vào bài viết!</div>;
  }

  if (!post || (post._destroy && me._id !== post.ID_user._id)) {
    return <div className={styles.error}>Bài viết đã bị xóa.</div>;
  }

// Hàm kiểm tra xem có nên hiển thị nút Chia sẻ hay không
const canShowShareButton = () => {
  // Nếu bài viết là bài chia sẻ, kiểm tra trạng thái của bài viết gốc
  if (post.type === "Share" && post.ID_post_shared) {
    return post.ID_post_shared.status !== "Chỉ mình tôi";
  }
  // Nếu là bài viết thông thường, kiểm tra trạng thái của bài viết
  return post.status !== "Chỉ mình tôi";
};

  //View tổng 
  return (
    <div className={styles.postDetailModalOverlay} onClick={onClose}>
      <div className={styles.postDetailModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>
            Bài viết của {post.ID_user?.first_name} {post.ID_user?.last_name}
          </h3>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Phần giao diện hành động chia sẻ: Hiển thị thông tin về hành động chia sẻ (ví dụ: ai đã chia sẻ bài viết) */}
        <div className={styles.modalBody}>
      {post.ID_post_shared && (
        <div className={styles.sharedPostSection}>
          <div className={styles.postHeader}>
            <div className={styles.userInfo}>
              <img
                src={post.ID_user?.avatar}
                className={styles.avatar}
                alt="User Avatar"
              />
              <div className={styles.userDetails}>
                <span className={styles.name}>
                  {post.ID_user?.first_name} {post.ID_user?.last_name}
                </span>
                <div className={styles.boxName}>
                  <span className={styles.time}>{timeAgo}</span>
                  {getIcon(post.status)}
                </div>
              </div>
            </div>
            {isSharedSection && (
              <button
                className={styles.optionsButton}
                onClick={handleOptionsClick}
              >
                <FaEllipsisH size={16} />
              </button>
            )}
          </div>
          <p className={styles.caption}>{post.caption}</p>
        </div>
      )}

          {/* Phần giao diện bài viết được chia sẻ: Hiển thị nội dung của bài viết gốc hoặc bài viết chính */}
          <div className={`${styles.postContent} ${styles.originalPost}`}>
    {post.type === "Share" && (post.ID_post_shared?._destroy || !post.ID_post_shared) ? (
      // Hiển thị thông báo khi bài viết gốc bị xóa
      <div className={styles.userInfo}>
        <p className={styles.caption}>Nội dung bài viết đã bị xóa</p>
      </div>
    ) : (
      // Hiển thị nội dung bài viết gốc nếu chưa bị xóa
      <>
        <div className={styles.postHeader}>
          <div className={styles.userInfo}>
            <img
              src={
                post.ID_post_shared
                  ? post.ID_post_shared.ID_user?.avatar
                  : post.ID_user?.avatar
              }
              className={styles.avatar}
              alt="User Avatar"
            />
            <div className={styles.userDetails}>
              <span className={styles.name}>
                {post.ID_post_shared
                  ? `${post.ID_post_shared.ID_user.first_name} ${post.ID_post_shared.ID_user.last_name}`
                  : `${post.ID_user?.first_name} ${post.ID_user?.last_name}`}
                {post.ID_post_shared?.tags?.length > 0 && (
                  <span>
                    <span style={{ color: "#b0b3b8" }}> cùng với </span>
                    <span className={styles.name}>
                      {post.ID_post_shared.tags[0]?.first_name}{' '}
                      {post.ID_post_shared.tags[0]?.last_name}
                    </span>
                    {post.ID_post_shared.tags.length > 1 && (
                      <>
                        <span style={{ color: "#b0b3b8" }}> và </span>
                        <span className={styles.name}>
                          {post.ID_post_shared.tags.length - 1} người khác
                        </span>
                      </>
                    )}
                  </span>
                )}
              </span>
              <div className={styles.boxName}>
                <span className={styles.time}>{timeAgoShare || timeAgo}</span>
                {getIcon(post.ID_post_shared?.status || post.status)}
              </div>
            </div>
          </div>
          {!isSharedSection && (
            <button
              className={styles.optionsButton}
              onClick={handleOptionsClick}
            >
              <FaEllipsisH size={16} />
            </button>
          )}
        </div>
        <p className={styles.caption}>
          {post.ID_post_shared ? post.ID_post_shared.caption : post.caption}
        </p>
        {renderMediaGrid(
          post.ID_post_shared ? post.ID_post_shared.medias : post.medias
        )}
      </>
    )}

      {/* Footer và interactions cho bài viết không phải chia sẻ */}
      {post.type !== "Share" && (
              <>
                <div className={styles.footer}>
                  {post.post_reactions?.length > 0 ? (
                    <div className={styles.footerReactions}>
                      <a
                        onClick={() => setReactionListModalVisible(true)}
                        style={{ cursor: 'pointer', textDecoration: 'none', color: '#65676b' }}
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
                  {comments.length > 0 && (
                    <span className={styles.commentCount}>
                      {countComments} bình luận
                    </span>
                  )}
                </div>

                <div className={styles.interactions}>
                  <div className={styles.reactionContainer}>
                    <button
                      ref={reactionRef}
                      className={`${styles.action} ${userReaction ? styles.reacted : ''}`}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      onClick={() =>
                        userReaction
                          ? callDeletePost_reaction(userReaction._id)
                          : callAddPost_Reaction(reactions[0]._id, reactions[0].name, reactions[0].icon)
                      }
                    >
                      <div className={styles.reactionIconBox}>
                        {userReaction ? userReaction.ID_reaction.icon : <FaThumbsUp size={16} />}
                        <span>{userReaction ? userReaction.ID_reaction.name : 'Thích'}</span>
                      </div>
                    </button>
                    {reactionsVisible && (
                      <div
                        className={styles.reactionBar}
                        onMouseEnter={() => setReactionsVisible(true)}
                        onMouseLeave={() => setReactionsVisible(false)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {reactions.map((reaction, index) => (
                          <button
                            key={index}
                            className={styles.reactionButton}
                            onClick={() => {
                              callAddPost_Reaction(reaction._id, reaction.name, reaction.icon);
                              setReactionsVisible(false);
                            }}
                          >
                            {reaction.icon}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button className={styles.action}>
                    <FaComment size={16} /> Bình luận
                  </button>
                  {/* Chỉ hiển thị nút Chia sẻ nếu trạng thái không phải "Chỉ mình tôi" */}
                  {canShowShareButton() && (
                    <button
                      className={styles.action}
                      onClick={() => setShareVisible(true)}
                      disabled={post.type === "Share" && (post.ID_post_shared?._destroy || !post.ID_post_shared)}
                    >
                      <FaShare size={16} /> Chia sẻ
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer và interactions cho bài chia sẻ */}
          {post.type === "Share" && (
            <>
              <div className={styles.footer}>
                {post.post_reactions?.length > 0 ? (
                  <div className={styles.footerReactions}>
                    <a
                      onClick={() => setReactionListModalVisible(true)}
                      style={{ cursor: 'pointer', textDecoration: 'none', color: '#65676b' }}
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
                {comments.length > 0 && (
                  <span className={styles.commentCount}>
                    {countComments} bình luận
                  </span>
                )}
              </div>

              <div className={styles.interactions}>
                <div className={styles.reactionContainer}>
                  <button
                    ref={reactionRef}
                    className={`${styles.action} ${userReaction ? styles.reacted : ''}`}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onClick={() =>
                      userReaction
                        ? callDeletePost_reaction(userReaction._id)
                        : callAddPost_Reaction(reactions[0]._id, reactions[0].name, reactions[0].icon)
                    }
                  >
                    <div className={styles.reactionIconBox}>
                      {userReaction ? userReaction.ID_reaction.icon : <FaThumbsUp size={16} />}
                      <span>{userReaction ? userReaction.ID_reaction.name : 'Thích'}</span>
                    </div>
                  </button>
                  {reactionsVisible && (
                    <div
                      className={styles.reactionBar}
                      onMouseEnter={() => setReactionsVisible(true)}
                      onMouseLeave={() => setReactionsVisible(false)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {reactions.map((reaction, index) => (
                        <button
                          key={index}
                          className={styles.reactionButton}
                          onClick={() => {
                            callAddPost_Reaction(reaction._id, reaction.name, reaction.icon);
                            setReactionsVisible(false);
                          }}
                        >
                          {reaction.icon}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button className={styles.action}>
                  <FaComment size={16} /> Bình luận
                </button>
                {/* Chỉ hiển thị nút Chia sẻ nếu trạng thái không phải "Chỉ mình tôi" */}
                {canShowShareButton() && (
                  <button
                    className={styles.action}
                    onClick={() => setShareVisible(true)}
                    disabled={post.type === "Share" && (post.ID_post_shared?._destroy || !post.ID_post_shared)}
                  >
                    <FaShare size={16} /> Chia sẻ
                  </button>
                )}
              </div>
            </>
          )}
          
          {/* Phần bình luận */}
          <div className={styles.commentsSection}>
            <h4>Bình luận</h4>
            <div className={styles.commentsList}>
              {comments.length > 0 ? (
                comments
                  .filter((comment) => !comment._destroy) // Lọc các comment chưa bị xóa
                  .map((comment) => renderComment(comment)) // Render từng comment
              ) : (
                <p>Chưa có bình luận nào.</p>
              )}
            </div>

            <div className={styles.commentInput}>
              {replyingTo && (
                <div className={styles.replyPreview}>
                  <span className={styles.replyTitle}>Đang phản hồi</span>
                  <span className={styles.replyName}>
                    {replyingTo.ID_user.first_name} {replyingTo.ID_user.last_name}
                  </span>
                  <button
                    className={styles.cancelReply}
                    onClick={() => {
                      setReplyingTo(null);
                      setNewComment('');
                    }}
                  >
                    Hủy
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={styles.inputContainer}>
          <div className={styles.inputContainer2}>
            <img src={me?.avatar} className={styles.avatar} alt="User Avatar" />
            <div className={styles.inputWrapper}>
              <input
                ref={commentInputRef}
                type="text"
                placeholder={
                  editingComment
                    ? 'Chỉnh sửa bình luận...'
                    : replyingTo
                      ? `Trả lời ${replyingTo.ID_user.first_name} ${replyingTo.ID_user.last_name}`
                      : 'Viết bình luận...'
                }
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={handleAddComment}
                disabled={uploadingMedia}
              />
            </div>
            <div className={styles.inputIcons}>
              <MdOutlinePhoto
                size={20}
                onClick={() => fileInputRef.current?.click()}
                style={{ cursor: 'pointer' }}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                style={{ display: 'none' }}
                onChange={handleMediaSelect}
              />
            </div>
          </div>
          {(replyingTo || editingComment) && (
            <div className={styles.replyPreview}>
              <span className={styles.replyTitle}>
                {editingComment
                  ? 'Đang chỉnh sửa bình luận'
                  : `Đang phản hồi ${replyingTo.ID_user.first_name} ${replyingTo.ID_user.last_name}`}
              </span>
              <button
                className={styles.cancelReply}
                onClick={() => {
                  setReplyingTo(null);
                  setEditingComment(null);
                  setNewComment('');
                }}
              >
                Hủy
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Menu tùy chọn */}
      {menuVisible && (
        <div
          className={styles.optionsMenu}
          style={{ top: menuPosition.top, left: menuPosition.left }}
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
        >
          {me._id !== post.ID_user._id ? (
            <button
              onClick={() => {
                setMenuVisible(false);
              }}
            >
              Báo cáo
            </button>
          ) : (
            <button
              onClick={() => {
                callChangeDestroyPost(post._id);
                setMenuVisible(false);
              }}
            >
              Xóa bài viết
            </button>
          )}
        </div>
      )}

      {/* Modal xem hình ảnh/video */}
      {isImageModalVisible && (
        <div className={styles.mediaOverlay} onClick={() => setImageModalVisible(false)}>
          <div className={styles.fullMediaContainer} onClick={(e) => e.stopPropagation()}>
            {/* Nút đóng modal */}
            <button
              className={styles.closeButton}
              onClick={() => setImageModalVisible(false)}
            >
              ✕
            </button>

            {/* Container cho các nút điều hướng */}
            <div className={styles.navButtonsContainer}>
              {/* Nút Previous */}
              {mediaList.length > 1 && (
                <button
                  className={styles.navButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentMediaIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
                  }}
                >
                  ❮
                </button>
              )}

              {/* Hiển thị media hiện tại */}
              <div className={styles.mediaWrapper}>
                {isVideo(mediaList[currentMediaIndex]) ? (
                  <video src={mediaList[currentMediaIndex]} className={styles.fullMedia} controls autoPlay />
                ) : (
                  <img src={mediaList[currentMediaIndex]} className={styles.fullMedia} alt="Full Media" />
                )}
              </div>

              {/* Nút Next */}
              {mediaList.length > 1 && (
                <button
                  className={styles.navButton}
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

      {/* Phần giao diện chia sẻ: Modal hiển thị khi người dùng nhấn nút chia sẻ */}
      {shareVisible && (
        <div
          className={styles.shareOverlay}
          onClick={(e) => {
            e.stopPropagation();
            setShareVisible(false);
          }}
        >
          <SharedPost post={post} me={me} setShareVisible={setShareVisible} />
        </div>
      )}

      {/* Thông báo thành công */}
      {successMessage && (
        <div className={styles.successModalOverlay} onClick={() => setSuccessMessage('')}>
          <div className={styles.successModal} onClick={(e) => e.stopPropagation()}>
            {successMessage}
          </div>
        </div>
      )}

      {/* Thông báo thất bại */}
      {failedMessage && (
        <div className={styles.failedModalOverlay} onClick={() => setFailedMessage('')}>
          <div className={styles.failedModal} onClick={(e) => e.stopPropagation()}>
            {failedMessage}
          </div>
        </div>
      )}


      {/* Modal danh sách biểu cảm */}
      {reactionListModalVisible && (
        <div
          className={styles.overlay}
          onClick={(e) => {
            e.stopPropagation();
            setReactionListModalVisible(false);
          }}
        >
          <div
            className={styles.modalContent1}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Cảm xúc về bài viết</h3>
            <div className={styles.reactionTabs}>
              {reactionTabs.map((tab) => (
                <button
                  key={tab.id}
                  className={selectedReactionTab === tab.id ? styles.activeTab : styles.tab}
                  onClick={() => setSelectedReactionTab(tab.id)}
                >
                  {tab.icon && <span>{tab.icon}</span>}
                  {tab.name || ''}
                  <span>{tab.count}</span>
                </button>
              ))}
            </div>
            {filteredReactions?.length > 0 ? (
              <ul className={styles.reactionList}>
                {filteredReactions.map((reaction, index) => (
                  <li
                    key={index}
                    className={styles.reactionItem}
                    onClick={() => navigate(`/profile/${reaction.ID_user._id}`)}
                  >
                    <img
                      src={reaction.ID_user.avatar}
                      alt="User Avatar"
                      className={styles.reactionAvatar}
                    />
                    <div>
                      <span className={styles.reactionUserName}>
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
    </div>
  );
};

export default PostDetailModal;