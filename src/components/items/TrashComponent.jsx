// import React, { memo, useEffect, useState, useRef } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { FaEllipsisH, FaTrash, FaUndo, FaExclamationCircle, FaComment, FaShare, FaPlay, FaUsers, FaGlobe, FaLock, FaArrowLeft, FaThumbsUp } from 'react-icons/fa';
// // import { ToastContainer, toast } from 'react-toastify';
// // import 'react-toastify/dist/ReactToastify.css';
// import { addPost_Reaction, deletePost_reaction, addPost } from '../../rtk/API';
// import styles from '../../styles/screens/strash/Trash.module.css';
// const PostItem = memo(({
//   post,
//   ID_user,
//   onDelete = () => {},
//   onDeleteVinhVien = () => {},
//   updatePostReaction = () => {},
//   deletPostReaction = () => {},
//   currentTime,
// }) => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const me = useSelector((state) => state.app.user);
//   const reactions = useSelector((state) => state.app.reactions);
//   const [timeAgo, setTimeAgo] = useState(post.createdAt);
//   const [timeAgoShare, setTimeAgoShare] = useState(post?.ID_post_shared?.createdAt);
//   const [reactionsVisible, setReactionsVisible] = useState(false);
//   const [shareVisible, setShareVisible] = useState(false);
//   const [isImageModalVisible, setImageModalVisible] = useState(false);
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [menuVisible, setMenuVisible] = useState(false);
//   const [reactionMenuPosition, setReactionMenuPosition] = useState({ top: 0, left: 0 });
//   const [selectedTab, setSelectedTab] = useState('all');
//   const [shareCaption, setShareCaption] = useState('');
//   const [shareStatus, setShareStatus] = useState('Công khai');
//   const reactionRef = useRef(null);

//   // Update time ago
//   useEffect(() => {
//     const updateDiff = () => {
//       const now = Date.now();
//       const createdTime = new Date(post.createdAt).getTime();
//       let createdTimeShare = null;
//       if (post.ID_post_shared?.createdAt) {
//         createdTimeShare = new Date(post.ID_post_shared.createdAt).getTime();
//       }

//       if (isNaN(createdTime)) {
//         setTimeAgo('Không xác định');
//         setTimeAgoShare('Không xác định');
//         return;
//       }

//       const diffMs = now - createdTime;
//       if (diffMs < 0) {
//         setTimeAgo('Vừa xong');
//       } else {
//         const seconds = Math.floor(diffMs / 1000);
//         const minutes = Math.floor(seconds / 60);
//         const hours = Math.floor(minutes / 60);
//         const days = Math.floor(hours / 24);
//         if (days > 0) {
//           setTimeAgo(`${days} ngày trước`);
//         } else if (hours > 0) {
//           setTimeAgo(`${hours} giờ trước`);
//         } else if (minutes > 0) {
//           setTimeAgo(`${minutes} phút trước`);
//         } else {
//           setTimeAgo(`${seconds} giây trước`);
//         }
//       }

//       if (createdTimeShare !== null) {
//         const diffMsShare = now - createdTimeShare;
//         if (diffMsShare < 0) {
//           setTimeAgoShare('Vừa xong');
//         } else {
//           const seconds = Math.floor(diffMsShare / 1000);
//           const minutes = Math.floor(seconds / 60);
//           const hours = Math.floor(minutes / 60);
//           const days = Math.floor(hours / 24);
//           if (days > 0) {
//             setTimeAgoShare(`${days} ngày trước`);
//           } else if (hours > 0) {
//             setTimeAgoShare(`${hours} giờ trước`);
//           } else if (minutes > 0) {
//             setTimeAgoShare(`${minutes} phút trước`);
//           } else {
//             setTimeAgoShare(`${seconds} giây trước`);
//           }
//         }
//       }
//     };

//     updateDiff();
//   }, [currentTime, post.createdAt, post?.ID_post_shared?.createdAt]);

//   // API calls
//   const callAddPost_Reaction = async (ID_reaction, name, icon) => {
//     try {
//       const paramsAPI = {
//         ID_post: post._id,
//         ID_user: ID_user,
//         ID_reaction: ID_reaction,
//       };
//       await dispatch(addPost_Reaction(paramsAPI))
//         .unwrap()
//         .then((response) => {
//           const newReaction = {
//             _id: ID_reaction,
//             name: name,
//             icon: icon,
//           };
//           updatePostReaction(post._id, newReaction, response.post_reaction._id);
//         })
//         .catch((error) => {
//           console.log('Lỗi call api addPost_Reaction', error);
//         });
//     } catch (error) {
//       console.log('Lỗi trong addPost_Reaction:', error);
//     }
//   };

//   const callDeletePost_reaction = async (ID_post, ID_post_reaction) => {
//     try {
//       const paramsAPI = { _id: ID_post_reaction };
//       await dispatch(deletePost_reaction(paramsAPI))
//         .unwrap()
//         .then(() => {
//           deletPostReaction(ID_post, ID_post_reaction);
//         })
//         .catch((error) => {
//           console.log('Lỗi call api callDeletePost_reaction', error);
//         });
//     } catch (error) {
//       console.log('Lỗi trong callDeletePost_reaction:', error);
//     }
//   };

//   const callAddPostShare = async (captionShare, status) => {
//     try {
//       const paramsAPI = {
//         ID_user: ID_user,
//         caption: captionShare,
//         medias: [],
//         status: status,
//         type: 'Share',
//         ID_post_shared: post.ID_post_shared ? post.ID_post_shared._id : post._id,
//         tags: [],
//       };
//       await dispatch(addPost(paramsAPI))
//         .unwrap()
//         .then(() => {
//           setShareVisible(false);
//         })
//         .catch((error) => {
//           console.log('Lỗi khi share bài viết:', error);
//           setShareVisible(false);
//         });
//     } catch (error) {
//       console.log('Lỗi share bài viết:', error);
//       setShareVisible(false);
//     }
//   };

//   // Copy to clipboard
//   const copyToClipboard = (text) => {
//     navigator.clipboard.writeText(text).then(() => {
//     }).catch((err) => {
//       console.error('Failed to copy:', err);
//     });
//   };

//   // Reaction tabs and filtered users
//   const uniqueReactions_tab = Array.from(
//     new Map(
//       post.post_reactions.map((reaction) => [
//         reaction.ID_reaction._id,
//         reaction.ID_reaction,
//       ])
//     ).values()
//   );

//   const tabs = [
//     { id: 'all', icon: 'Tất cả' },
//     ...uniqueReactions_tab.map((reaction) => ({
//       id: reaction._id,
//       icon: reaction.icon,
//     })),
//   ];

//   const filteredUsers = post.post_reactions
//     .filter(
//       (reaction) =>
//         selectedTab === 'all' || reaction.ID_reaction._id === selectedTab
//     )
//     .map((reaction) => ({
//       id: `${reaction.ID_user._id}-${reaction._id}`,
//       userId: reaction.ID_user._id,
//       name: `${reaction.ID_user.first_name} ${reaction.ID_user.last_name}`,
//       avatar: reaction.ID_user.avatar,
//       reactionId: reaction.ID_reaction._id,
//       reactionIcon: reaction.ID_reaction.icon,
//       quantity: reaction.quantity,
//     }));

//   const reactionCount = post.post_reactions.reduce((acc, reaction) => {
//     if (!reaction.ID_reaction) return acc;
//     const id = reaction.ID_reaction._id;
//     acc[id] = acc[id]
//       ? { ...acc[id], count: acc[id].count + 1 }
//       : { ...reaction, count: 1 };
//     return acc;
//   }, {});

//   const topReactions = Object.values(reactionCount)
//     .sort((a, b) => b.count - a.count)
//     .slice(0, 2);

//   const userReaction = post.post_reactions.find(
//     (reaction) => reaction.ID_user._id === ID_user
//   );

//   // Handle reaction click/hover
//   const handleReactionClick = (e) => {
//     if (reactionRef.current) {
//       const rect = reactionRef.current.getBoundingClientRect();
//       setReactionMenuPosition({
//         top: rect.top - 50,
//         left: rect.left,
//       });
//       setReactionsVisible(true);
//     }
//   };

//   // Media handling
//   const isVideo = (uri) => uri?.endsWith('.mp4') || uri?.endsWith('.mov');
//   const renderMediaGrid = (medias) => {
//     const mediaCount = medias.length;
//     if (mediaCount === 0) return null;
  
//     return (
//       <div className={`${styles.mediaGrid} ${styles[`mediaGrid-${mediaCount}`]}`}>
//         {medias.slice(0, 5).map((uri, index) => (
//           <div
//             key={index}
//             className={`${styles.mediaItem} ${styles[`mediaItem-${mediaCount}-${index}`]}`}
//             onClick={() => {
//               setSelectedImage(uri);
//               if (mediaCount > 5) {
//                 navigate(`/post/${post._id}?type=image`);
//               } else {
//                 setImageModalVisible(true);
//               }
//             }}
//           >
//             {isVideo(uri) ? (
//               <div className={styles.videoWrapper}>
//                 <video src={uri} className={styles.media} />
//                 <div className={styles.playButton}>
//                   <FaPlay size={40} color="white" />
//                 </div>
//               </div>
//             ) : (
//               <img src={uri} alt="Media" className={styles.media} />
//             )}
//             {index === 4 && mediaCount > 5 && (
//               <div className={styles.overlay}>
//                 <span className={styles.overlayText}>+{mediaCount - 5}</span>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     );
//   };

//   // Status icon
//   const getIcon = (status) => {
//     switch (status) {
//       case 'Bạn bè':
//         return <FaUsers size={12} color="gray" />;
//       case 'Công khai':
//         return <FaGlobe size={12} color="gray" />;
//       case 'Chỉ mình tôi':
//         return <FaLock size={12} color="gray" />;
//       default:
//         return <FaLock size={12} color="gray" />;
//     }
//   };

//   // Render reactions modal
//   const renderReactionsModal = () => (
//     <div className="reactions-modal">
//       <div className="header-reaction">
//         <button onClick={() => setSelectedTab('all')} className="back-button">
//           <FaArrowLeft size={20} />
//         </button>
//         <h3>Người đã bày tỏ cảm xúc</h3>
//       </div>
//       <div className="tab-container">
//         {tabs.map((tab) => (
//           <button
//             key={tab.id}
//             className={`tab ${selectedTab === tab.id ? 'selected' : ''}`}
//             onClick={() => setSelectedTab(tab.id)}
//           >
//             {tab.icon}
//           </button>
//         ))}
//       </div>
//       <div className="user-list">
//         {filteredUsers.map((user) => (
//           <div key={user.id} className="user-item">
//             <img src={user.avatar} alt={user.name} className="avatar" />
//             <div className="user-info">
//               <span className="name">{user.name}</span>
//               <div className="reaction-info">
//                 <span>{user.reactionIcon}</span>
//                 <span>{user.quantity}</span>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );

//   const hasCaption = post?.caption?.trim() !== '';
//   const hasMedia = post?.medias?.length > 0 || post?.ID_post_shared?.medias?.length > 0;
//   return (
//     <div className={styles.postContainer}>
//       {post.ID_post_shared && (
//         <div className={styles.shareHeader}>
//           <div className={styles.userInfo}>
//             <img
//               src={post?.ID_user?.avatar}
//               alt="Avatar"
//               className={styles.avatar}
//               onClick={() => navigate(`/profile/${post.ID_user._id}`)}
//             />
//             <div className={styles.userDetails}>
//               <span
//                 className={styles.name}
//                 onClick={() => navigate(`/profile/${post.ID_user._id}`)}
//               >
//                 {post?.ID_user?.first_name} {post?.ID_user?.last_name}
//               </span>
//               <div className={styles.meta}>
//                 <span className={styles.time}>{timeAgo}</span>
//                 {getIcon(post.status)}
//               </div>
//             </div>
//           </div>
//           <button
//             className={styles.menuButton}
//             onClick={() => setMenuVisible(!menuVisible)}
//           >
//             <FaEllipsisH size={22} />
//           </button>
//           {hasCaption && <p className={styles.caption}>{post.caption}</p>}
//           {menuVisible && (
//             <div className={styles.menuDropdown}>
//               {ID_user !== post.ID_user._id ? (
//                 <button
//                   onClick={() => {
//                     setMenuVisible(false);
//                     navigate(`/report/${post._id}`);
//                   }}
//                   className={styles.menuItem}
//                 >
//                   <FaExclamationCircle size={20} />
//                   <span>Báo cáo</span>
//                 </button>
//               ) : (
//                 <>
//                   <button
//                     onClick={() => {
//                       onDelete();
//                       setMenuVisible(false);
//                     }}
//                     className={styles.menuItem}
//                   >
//                     <FaUndo size={20} />
//                     <span>Phục hồi</span>
//                   </button>
//                   {post._destroy && (
//                     <button
//                       onClick={() => {
//                         onDeleteVinhVien();
//                         setMenuVisible(false);
//                       }}
//                       className={styles.menuItem}
//                     >
//                       <FaTrash size={20} />
//                       <span>Xóa vĩnh viễn</span>
//                     </button>
//                   )}
//                 </>
//               )}
//             </div>
//           )}

//         </div>
//       )}
//       <div className={post.ID_post_shared ? styles.headerShared : styles.headerNormal}>
//         <div className={styles.header}>
//           <div className={styles.userInfo}>
//             <img
//               src={
//                 post.ID_post_shared
//                   ? post.ID_post_shared.ID_user.avatar
//                   : post?.ID_user?.avatar
//               }
//               alt="Avatar"
//               className={styles.avatar}
//               onClick={() =>
//                 navigate(
//                   `/profile/${
//                     post.ID_post_shared
//                       ? post.ID_post_shared.ID_user._id
//                       : post.ID_user._id
//                   }`
//                 )
//               }
//             />
//             <div className={styles.userDetails}>
//               <span
//                 className={styles.name}
//                 onClick={() =>
//                   navigate(
//                     `/profile/${
//                       post.ID_post_shared
//                         ? post.ID_post_shared.ID_user._id
//                         : post.ID_user._id
//                     }`
//                   )
//                 }
//               >
//                 {post.ID_post_shared
//                   ? `${post.ID_post_shared.ID_user.first_name} ${post.ID_post_shared.ID_user.last_name}`
//                   : `${post.ID_user.first_name} ${post.ID_user.last_name}`}
//                 {(post.ID_post_shared ? post.ID_post_shared.tags : post.tags)
//                   .length > 0 && (
//                   <>
//                     <span className={styles.tagText}> cùng với </span>
//                     <span
//                       className={styles.name}
//                       onClick={() =>
//                         navigate(
//                           `/profile/${
//                             post.ID_post_shared
//                               ? post.ID_post_shared.tags[0]._id
//                               : post.tags[0]._id
//                           }`
//                         )
//                       }
//                     >
//                       {post.ID_post_shared
//                         ? `${post.ID_post_shared.tags[0]?.first_name} ${post.ID_post_shared.tags[0]?.last_name}`
//                         : `${post.tags[0]?.first_name} ${post.tags[0]?.last_name}`}
//                     </span>
//                     {(post.ID_post_shared
//                       ? post.ID_post_shared.tags
//                       : post.tags
//                     ).length > 1 && (
//                       <>
//                         <span className={styles.tagText}> và </span>
//                         <span
//                           className={styles.name}
//                           onClick={() =>
//                             navigate('/list-tags', {
//                               state: {
//                                 tags: post.ID_post_shared
//                                   ? post.ID_post_shared.tags
//                                   : post.tags,
//                               },
//                             })
//                           }
//                         >
//                           {(post.ID_post_shared
//                             ? post.ID_post_shared.tags
//                             : post.tags
//                           ).length - 1}{' '}
//                           người khác
//                         </span>
//                       </>
//                     )}
//                   </>
//                 )}
//               </span>
//               <div className={styles.meta}>
//                 <span className={styles.time}>
//                   {post.ID_post_shared ? timeAgoShare : timeAgo}
//                 </span>
//                 {getIcon(
//                   post.ID_post_shared ? post.ID_post_shared.status : post.status
//                 )}
//               </div>
//             </div>
//           </div>
//           {!post.ID_post_shared && (
//             <button
//               className={styles.menuButton}
//               onClick={() => setMenuVisible(!menuVisible)}
//             >
//               <FaEllipsisH size={22} />
//             </button>
//           )}
//           {menuVisible && !post.ID_post_shared && (
//             <div className={styles.menuDropdown}>
//               {ID_user !== post.ID_user._id ? (
//                 <button
//                   onClick={() => {
//                     setMenuVisible(false);
//                     navigate(`/report/${post._id}`);
//                   }}
//                   className={styles.menuItem}
//                 >
//                   <FaExclamationCircle size={20} />
//                   <span>Báo cáo</span>
//                 </button>
//               ) : (
//                 <>
//                   <button
//                     onClick={() => {
//                       onDelete();
//                       setMenuVisible(false);
//                     }}
//                     className={styles.menuItem}
//                   >
//                     <FaUndo size={20} />
//                     <span>{post._destroy ? 'Phục hồi' : 'Xóa bài viết'}</span>
//                   </button>
//                   {post._destroy && (
//                     <button
//                       onClick={() => {
//                         onDeleteVinhVien();
//                         setMenuVisible(false);
//                       }}
//                       className={styles.menuItem}
//                     >
//                       <FaTrash size={20} />
//                       <span>Xóa vĩnh viễn</span>
//                     </button>
//                   )}
//                 </>
//               )}
//             </div>
//           )}
//         </div>
//         {post?.ID_post_shared ? (
//           <p className={styles.caption}>{post.ID_post_shared.caption}</p>
//         ) : (
//           hasCaption && <p className={styles.caption}>{post.caption}</p>
//         )}
//       </div>
//       {post?.ID_post_shared
//         ? hasMedia && renderMediaGrid(post.ID_post_shared.medias)
//         : hasMedia && renderMediaGrid(post.medias)}
//       {!post._destroy && (
//         <div className={styles.footer}>
//           {post.post_reactions.length > 0 ? (
//             <div className={styles.footerReactions}>
//               <button
//                 onClick={() => setReactionsVisible(true)}
//                 className={styles.reactionsButton}
//               >
//                 {topReactions.map((reaction, index) => (
//                   <span key={index}>{reaction.ID_reaction.icon}</span>
//                 ))}
//                 <span>
//                   {post.post_reactions.some(
//                     (reaction) => reaction.ID_user._id === ID_user
//                   )
//                     ? post.post_reactions.length === 1
//                       ? `${me?.first_name} ${me?.last_name}`
//                       : `Bạn và ${post.post_reactions.length - 1} người khác`
//                     : `${post.post_reactions.length}`}
//                 </span>
//               </button>
//             </div>
//           ) : (
//             <div />
//           )}
//           {post?.comments.length > 0 && (
//             <span
//               className={styles.commentsCount}
//               onClick={() => navigate(`/post/${post._id}?type=comment`)}
//             >
//               {post?.comments.length} bình luận
//             </span>
//           )}
//         </div>
//       )}
//       {!post._destroy && (
//         <div className={styles.interactions}>
//           <div
//             className={`${styles.action} ${userReaction ? styles.reacted : ''}`}
//             ref={reactionRef}
//             onClick={handleReactionClick}
//           >
//             {userReaction ? (
//               <>
//                 <span>{userReaction.ID_reaction.icon}</span>
//                 <span>{userReaction.ID_reaction.name}</span>
//               </>
//             ) : (
//               <>
//                 <FaThumbsUp size={20} />
//                 <span>{reactions[0]?.name || 'Thích'}</span>
//               </>
//             )}
//           </div>
//           <button
//             className={styles.action}
//             onClick={() => navigate(`/post/${post._id}?type=comment`)}
//           >
//             <FaComment size={20} />
//             <span>Bình luận</span>
//           </button>
//           <button
//             className={styles.action}
//             onClick={() => setShareVisible(true)}
//           >
//             <FaShare size={20} />
//             <span>Chia sẻ</span>
//           </button>
//         </div>
//       )}
//       {reactionsVisible && (
//         <div
//           className={styles.reactionMenu}
//           style={{ top: reactionMenuPosition.top, left: reactionMenuPosition.left }}
//           onMouseLeave={() => setReactionsVisible(false)}
//         >
//           {reactions.map((reaction, index) => (
//             <button
//               key={index}
//               className={styles.reactionButton}
//               onClick={() => {
//                 callAddPost_Reaction(reaction._id, reaction.name, reaction.icon);
//                 setReactionsVisible(false);
//               }}
//             >
//               {reaction.icon}
//             </button>
//           ))}
//         </div>
//       )}
//       {isImageModalVisible && (
//         <div className={styles.modalOverlay} onClick={() => setImageModalVisible(false)}>
//           {isVideo(selectedImage) ? (
//             <video
//               src={selectedImage}
//               className={styles.fullMedia}
//               controls
//               autoPlay
//             />
//           ) : (
//             <img
//               src={selectedImage}
//               alt="Full media"
//               className={styles.fullMedia}
//             />
//           )}
//         </div>
//       )}
//       {shareVisible && (
//         <div className={styles.modalOverlay}>
//           <div className={styles.shareModal}>
//             <h3>Chia sẻ bài viết</h3>
//             <textarea
//               placeholder="Viết nội dung chia sẻ..."
//               className={styles.shareCaption}
//               value={shareCaption}
//               onChange={(e) => setShareCaption(e.target.value)}
//             />
//             <select
//               className={styles.shareStatus}
//               value={shareStatus}
//               onChange={(e) => setShareStatus(e.target.value)}
//             >
//               <option value="Công khai">Công khai</option>
//               <option value="Bạn bè">Bạn bè</option>
//               <option value="Chỉ mình tôi">Chỉ mình tôi</option>
//             </select>
//             <div className={styles.shareActions}>
//               <button
//                 onClick={() => setShareVisible(false)}
//                 className={styles.cancelButton}
//               >
//                 Hủy
//               </button>
//               <button
//                 onClick={() => callAddPostShare(shareCaption, shareStatus)}
//                 className={styles.shareButton}
//               >
//                 Chia sẻ
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// });

// export default PostItem;