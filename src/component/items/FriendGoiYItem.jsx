// src/components/FriendItem.jsx
import React from "react";

const FriendGoiYItem = ({ item,onThemBanBe }) => (
  <div className="friend-item">
    <img
      src={item.user.avatar}
      alt={item.user.avatar}
      className="friend-avatar"
    />
    <h4>{item.user.first_name} {item.user.last_name}</h4>
    <button className="confirm-btn" onClick={()=> onThemBanBe(item.user._id)}>Thêm bạn bè</button>
  </div>
);

export default FriendGoiYItem;
