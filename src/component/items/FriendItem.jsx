// src/components/FriendItem.jsx
import React,{useEffect,useState} from "react";
import "../../styles/screens/friend/FirendS.css";


const FriendItem = ({ item,_id }) => {
  const [ID_friend, setID_friend] = useState(null);
  const [name, setName] = useState(null);
  const [avatar, setAvatar] = useState(null);
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
  }, [item, _id])
  
    return (
      <div className="friend-item">
      <img
        src={avatar}
        alt={name}
        className="friend-avatar"
      />
      <h4>{name}</h4>
    </div>
    );

  };

export default FriendItem;
