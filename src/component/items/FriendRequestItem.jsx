// src/components/FrienddataItem.jsx
import React,{useEffect,useState} from "react";
import "../../styles/screens/friend/FirendS.css";


const FrienddataItem = ({ data, me ,currentTime,onXacNhan,onXoa}) => {
    const [timeAgo, setTimeAgo] = useState('');

    // Cập nhật timeAgo mỗi khi data.updatedAt thay đổi
    useEffect(() => {
      // Hàm tính toán thời gian
      const updateDiff = () => {
        const now = Date.now();
        const createdTime = new Date(data.updatedAt).getTime();
  
        if (isNaN(createdTime)) {
          setTimeAgo('Không xác định');
          return;
        }
  
        const diffMs = now - createdTime;
        if (diffMs < 0) {
          setTimeAgo('Vừa xong');
        } else {
          const seconds = Math.floor(diffMs / 1000);
          const minutes = Math.floor(seconds / 60);
          const hours = Math.floor(minutes / 60);
          const days = Math.floor(hours / 24);
  
          if (days > 0) {
            setTimeAgo(`${days} ngày trước`);
          } else if (hours > 0) {
            setTimeAgo(`${hours} giờ trước`);
          } else if (minutes > 0) {
            setTimeAgo(`${minutes} phút trước`);
          } else {
            setTimeAgo(`${seconds} giây trước`);
          }
        }
      };
      updateDiff();
    }, [currentTime]); // Phụ thuộc vào data.updatedAt

// lời mời kết bạn
  const isMeA = data.ID_userA._id === me;

  const avatar = isMeA
    ? data.ID_userB.avatar
    : data.ID_userA.avatar;
  const name = isMeA
    ? `${data.ID_userB.first_name} ${data.ID_userB.last_name}`
    : `${data.ID_userA.first_name} ${data.ID_userA.last_name}`;

  return (
    <div className="friend-data-item">
      <img
        src={avatar}
        alt={name}
        className="friend-avatar"
      />
      <div className="friend-info">
        <h4>{name}</h4>
        <p>{timeAgo}</p>
        <div className="friend-actions">
          <button className="confirm-btn" onClick={() => onXacNhan(data._id)}>Xác nhận</button>
          <button className="delete-btn" onClick={() => onXoa(data._id)}>Xóa</button>
        </div>
      </div>
    </div>
  );
};

export default FrienddataItem;
