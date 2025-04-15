import React from 'react';
import './../../styles/components/items/SearchDialog.css'; // File CSS riêng cho SearchDialog
import { Routes, Route, useNavigate } from 'react-router-dom';

const SearchDialog = ({ item, onClose }) => {
        const navigate = useNavigate();
    
  return (
    <div className="search-dialog">
      <div className="notification-list">
        {item.length > 0 ? (
          item.map((item) => (
            
            <div key={item._id} className="notification-item" onClick={() =>{
                navigate(`/profile/${item._id}`);
            }}>
                <img src={item.avatar} alt="Avatar" className="notification-avatar" />
                <p>{item.first_name} {item.last_name}</p>
            </div>
          ))
        ) : (
          <div className="notification-item">
            <p>Không có thông báo nào.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchDialog;