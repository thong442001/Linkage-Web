import React from 'react';
import './../../styles/components/items/NotificationDialog.css'; // File CSS riêng cho NotificationDialog

const NotificationDialog = ({ notifications, onClose }) => {
  return (
    <div className="notification-dialog">
      <div className="notification-header">
        <h3>Thông Báo</h3>
        <div className="tabs">
          <span className="tab active">Tất Cả</span>
        </div>
      </div>
      <div className="notification-list">
        {notifications.length > 0 ? (
          notifications.map((item) => (
            <div key={item._id} className="notification-item">
              <div className="notification-content">
                <img src={item.avatar} alt="Avatar" className="notification-avatar" />
                <p>{item.content}</p>
                <span className="time">{item.time}</span>
              </div>
              {item.showActions && (
                <div className="notification-actions">
                  <button className="confirm-btn">Xác Nhận</button>
                  <button className="delete-btn">Xóa</button>
                </div>
              )}
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

export default NotificationDialog;