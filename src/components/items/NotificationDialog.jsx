import React, { useEffect, useState, useRef } from 'react';
import './../../styles/components/items/NotificationDialog.css'; // File CSS riêng cho NotificationDialog
import { Routes, Route, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
const NotificationDialog = ({ notifications, onClose }) => {
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const dispatch = useDispatch();

  // 👉 Bắt sự kiện click ra ngoài để đóng dialog
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose(); // Gọi hàm đóng từ props
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="notification-dialog" ref={modalRef}>
      <div className="notification-header">
        <h3>Thông Báo</h3>
      </div>
      <div className="notification-list">
        {notifications.length > 0 ? (
          notifications.map((item) => (
            <div key={item._id} className="notification-item">
              <div className="notification-content">
                <img src={item.avatar} alt="Avatar" className="notification-avatar" />
                <div>
                  <p>{item.content}</p>
                  <span className="time">{item.time}</span>
                </div>
              </div>
              {/* {item.showActions && (
                <div className="notification-actions">
                  <button className="confirm-btn">Xác Nhận</button>
                  <button className="delete-btn">Xóa</button>
                </div>
              )} */}
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