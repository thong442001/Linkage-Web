import React from "react";
import styles from "../../styles/screens/friend/FriendS.module.css";

const FriendGoiYItem = ({ item, onThemBanBe }) => (
  <div className={styles.friendItem}>
    <img
      src={item.user.avatar}
      alt={`${item.user.first_name} ${item.user.last_name}`}
      className={styles.friendAvatar}
    />
    <h4 className={styles.friendItemTitle}>{item.user.first_name} {item.user.last_name}</h4>
    <button className={styles.confirmBtn} onClick={() => onThemBanBe(item.user._id)}>
      Thêm bạn bè
    </button>
  </div>
);

export default FriendGoiYItem;