import React from "react";
import styles from "../../styles/screens/friend/FriendS.module.css";
import { useNavigate } from 'react-router-dom';

const FriendGoiYItem = ({ item, onThemBanBe }) => {
  const navigate = useNavigate();

  return (

    <div className={styles.friendItem}>
      <button
        style={{ border: "none", background: "none", padding: 0, cursor: "pointer" }}
        onClick={() => navigate(`/profile/${item.user._id}`)}
      >
        <img
          src={item.user.avatar}
          alt={`${item.user.first_name} ${item.user.last_name}`}
          className={styles.friendAvatar}
        />
      </button>
      <h4 className={styles.friendItemTitle}>{item.user.first_name} {item.user.last_name}</h4>
      <button className={styles.confirmBtn} onClick={() => onThemBanBe(item.user._id)}>
        Thêm bạn bè
      </button>
    </div>
  );
}

export default FriendGoiYItem;