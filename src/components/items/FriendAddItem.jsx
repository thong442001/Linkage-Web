import React,{useState,useEffect} from 'react';
import styles from '../../styles/components/dialogs/CreateGroupModal.module.css';
import { useDispatch, useSelector } from "react-redux";


const FriendAddItem = ({ item,onToggle, selectedUsers, membersGroup }) => {
    const me = useSelector(state => state.app.user);
    const [ID_friend, setID_friend] = useState(null);
    const [name, setName] = useState(null);
    const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    if (item.ID_userA._id === me._id) {
      setID_friend(item.ID_userB._id);
      setName(`${item.ID_userB.first_name} ${item.ID_userB.last_name}`);
      setAvatar(item.ID_userB.avatar);
    } else {
      setID_friend(item.ID_userA._id);
      setName(`${item.ID_userA.first_name} ${item.ID_userA.last_name}`);
      setAvatar(item.ID_userA.avatar);
    }
  }, [item, me]);

  const isJoined = membersGroup.some(member => member._id === ID_friend);
  const isSelected = isJoined ? true : selectedUsers.includes(ID_friend);
  return (
    <div className={styles.friendItem}>
      <div className={styles.friendInfo}>
          <img
            src={avatar}
            alt={name}
            className={styles.avatar}
          />
        <span className={styles.friendName}>
          {name}
        </span>
      </div>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle(ID_friend)}
        className={styles.checkbox}
        disabled={isJoined} // Vô hiệu hóa nếu đã là thành viên
      />
    </div>
  );
};

export default FriendAddItem;