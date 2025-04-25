import React, { useEffect, useState } from "react";
import styles from "../../styles/screens/friend/FriendS.module.css";
import { useNavigate } from 'react-router-dom';
const FriendItem = ({ item, _id }) => {
  const [ID_friend, setID_friend] = useState(null);
  const [name, setName] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (item.ID_userA._id === _id) {
      setID_friend(item.ID_userB._id);
      setName(`${item.ID_userB.first_name} ${item.ID_userB.last_name}`);
      setAvatar(item.ID_userB.avatar);
    } else {
      setID_friend(item.ID_userA._id);
      setName(`${item.ID_userA.first_name} ${item.ID_userA.last_name}`);
      setAvatar(item.ID_userA.avatar);
    }
  }, [item, _id]);

  return (
    <div className={styles.friendItem}>
      <button
        style={{ border: "none", background: "none", padding: 0, cursor: "pointer" }}
        onClick={() => navigate(`/profile/${ID_friend}`)}
      >
        <img
          src={avatar}
          alt={name}
          className={styles.friendAvatar}
        />
        <h4 className={styles.friendItemTitle}>{name}</h4>
      </button>

    </div>
  );
};

export default FriendItem;