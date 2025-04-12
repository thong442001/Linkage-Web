import React, { useEffect, useState } from "react";
import styles from "../../styles/screens/friend/FriendS.module.css";

const FriendRequestItem = ({ data, me, currentTime, onXacNhan, onXoa }) => {
  const [timeAgo, setTimeAgo] = useState("");

  useEffect(() => {
    const updateDiff = () => {
      const now = Date.now();
      const createdTime = new Date(data.updatedAt).getTime();

      if (isNaN(createdTime)) {
        setTimeAgo("Không xác định");
        return;
      }

      const diffMs = now - createdTime;
      if (diffMs < 0) {
        setTimeAgo("Vừa xong");
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
  }, [currentTime]);

  const isMeA = data.ID_userA._id === me;

  const avatar = isMeA ? data.ID_userB.avatar : data.ID_userA.avatar;
  const name = isMeA
    ? `${data.ID_userB.first_name} ${data.ID_userB.last_name}`
    : `${data.ID_userA.first_name} ${data.ID_userA.last_name}`;

  return (
    <div className={styles.friendRequestItem}>
      <img src={avatar} alt={name} className={styles.friendAvatar} />
      <div className={styles.friendInfo}>
        <h4 className={styles.friendInfoTitle}>{name}</h4>
        <p className={styles.friendInfoText}>{timeAgo}</p>
        <div className={styles.friendActions}>
          <button className={styles.confirmBtn} onClick={() => onXacNhan(data._id)}>
            Xác nhận
          </button>
          <button className={styles.deleteBtn} onClick={() => onXoa(data._id)}>
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default FriendRequestItem;