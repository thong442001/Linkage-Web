// UserList.jsx
import React from 'react';
import './../../styles/components/items/UserListS.css'; // Tạo file CSS mới cho component này

const UserList = ({ users }) => {
  return (
    <div className="user-list-container">
      {users.map((user, index) => (
        <div key={index} className="user-list-item">
          <div className="user-avatar-wrapper">
            <img src={user.avatar} alt="User Avatar" className="user-avatar" />
            <span className={`status-dot ${user.isOnline ? 'online' : 'offline'}`}></span>
          </div>
          <span className="user-name">{user.first_name} {user.last_name}</span>
        </div>
      ))}
    </div>
  );
};

export default UserList;