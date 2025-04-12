// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import '../../styles/screens/friend/FirendS.css'; // File CSS cho trang Friends
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   getAllLoiMoiKetBan,
// } from '../../rtk/API';

// const Friend = () => {
//   const navigate = useNavigate();
  
//   useEffect(() => {
//     // Call API khi lần đầu vào trang
//     callGetAllLoiMoiKetBan();

//     // Thêm listener để gọi lại API khi quay lại trang
//     const focusListener = navigation.addListener('focus', () => {
//       callGetAllLoiMoiKetBan();
//     });

//     // Cleanup listener khi component bị unmount
//     return () => {
//       focusListener();
//     };
//   }, [navigate]);

//   //getAllLoiMoiKetBan
//   const callGetAllLoiMoiKetBan = async () => {
//     try {
//       await dispatch(getAllLoiMoiKetBan({ me: me._id, token: token }))
//         .unwrap()
//         .then(response => {
//           //console.log(response);
//           setRelationships(response.relationships);
//           console.log(response.relationships);
//         })
//         .catch(error => {
//           console.log('Error2 getAllLoiMoiKetBan:', error);
//         });
//     } catch (error) {
//       console.log(error);
//     }
//   };
//   // Dữ liệu cứng cho danh sách lời mời kết bạn
//   const friendRequests = [
//     { id: 1, name: 'Tình Quốc Thái', mutualFriends: 2, avatar: 'https://images2.thanhnien.vn/528068263637045248/2025/3/28/viruss-17431943994281777502076.jpg' },
//     { id: 2, name: 'Nhật Trường', mutualFriends: 9, avatar: 'https://images2.thanhnien.vn/528068263637045248/2025/3/28/viruss-17431943994281777502076.jpg' },
//     { id: 3, name: 'Hồng Phúc', mutualFriends: 0, avatar: 'https://images2.thanhnien.vn/528068263637045248/2025/3/28/viruss-17431943994281777502076.jpg' },
//     { id: 4, name: 'Văn Phúc', mutualFriends: 0, avatar: 'https://images2.thanhnien.vn/528068263637045248/2025/3/28/viruss-17431943994281777502076.jpg' },
//     { id: 5, name: 'Tèo Hello', mutualFriends: 2, avatar: 'https://images2.thanhnien.vn/528068263637045248/2025/3/28/viruss-17431943994281777502076.jpg' },
//   ];

//   // Dữ liệu cứng cho danh sách bạn bè
//   const friendsList = [
//     { id: 6, name: 'Trần Hào Diễm', avatar: 'https://images2.thanhnien.vn/528068263637045248/2025/3/28/viruss-17431943994281777502076.jpg' },
//     { id: 7, name: 'Lê Nam', avatar: 'https://images2.thanhnien.vn/528068263637045248/2025/3/28/viruss-17431943994281777502076.jpg' },
//     { id: 8, name: 'Vũ Minh Châu', avatar: 'https://images2.thanhnien.vn/528068263637045248/2025/3/28/viruss-17431943994281777502076.jpg' },
//     { id: 9, name: 'Trần Tuấn Cảnh', avatar: 'https://images2.thanhnien.vn/528068263637045248/2025/3/28/viruss-17431943994281777502076.jpg' },
//     { id: 10, name: 'Minh Quân', avatar: 'https://images2.thanhnien.vn/528068263637045248/2025/3/28/viruss-17431943994281777502076.jpg' },
//   ];

//   return (
//     <div className="friends-container">
//       {/* Sidebar trái */}
//       <div className="sidebar-left">
//         <h2>Bạn bè</h2>
//         <div className="menu-item active">Trang chủ</div>
//         <div className="menu-item">Lời mời kết bạn</div>
//         <div className="menu-item">Gợi ý</div>
//         <div className="menu-item">Tất cả bạn bè</div>
//         <div className="menu-item">Sinh nhật</div>
//         <div className="menu-item">Danh sách tùy chỉnh</div>
//       </div>

//       {/* Nội dung chính */}
//       <div className="main-content">
//         {/* Phần lời mời kết bạn */}
//         <div className="friend-requests">
//           <h3>Lời mời kết bạn</h3>
//           <div className="friend-requests-list">
//             {friendRequests.map((request) => (
//               <div key={request.id} className="friend-request-item">
//                 <img src={request.avatar} alt={request.name} className="friend-avatar" />
//                 <div className="friend-info">
//                   <h4>{request.name}</h4>
//                   <p>{request.mutualFriends} bạn chung</p>
//                   <div className="friend-actions">
//                     <button className="confirm-btn">Xác nhận</button>
//                     <button className="delete-btn">Xóa</button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Phần danh sách bạn bè */}
//         <div className="friends-list">
//           <h3>Xem tất cả</h3>
//           <div className="friends-list-grid">
//             {friendsList.map((friend) => (
//               <div key={friend.id} className="friend-item">
//                 <img src={friend.avatar} alt={friend.name} className="friend-avatar" />
//                 <h4>{friend.name}</h4>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Friend;