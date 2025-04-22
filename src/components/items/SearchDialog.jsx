import { useEffect, useRef, useState } from "react";
import "./../../styles/components/items/SearchDialog.css"; // File CSS riêng cho SearchDialog
import { Routes, Route, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {FaTrashAlt} from 'react-icons/fa';

const SearchDialog = ({ item, onClose ,saveSearch,history,deleteSearchItem }) => {
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
    <div className="search-dialog" ref={modalRef}>
      <div className="notification-list">
      {item.length === 0 && (
        <div className="search-history">
          <h3>Lịch sử tìm kiếm</h3>
          {history.map((item) => (
            <div key={item._id} className="notification-item1">
              <div
                key={item._id}
                className="notification-item"
                onClick={() => {
                  saveSearch(item);
                  navigate(`/profile/${item._id}`);
                  onClose(); // Gọi hàm đóng từ props
                }}
              >
                <img
                  src={item.avatar}
                  alt="Avatar"
                  className="notification-avatar"
                />
                <p>
                  {item.first_name} {item.last_name}
                </p>
              </div>
              <button  
              className="delete-button"
                onClick={() => {
                  deleteSearchItem(item._id);
                }}>
                            ×
              </button>
            </div>
          ))}
        </div>
      )}
        {item.length > 0 && (
          item.map((item) => (
            <div
              key={item._id}
              className="notification-item"
              onClick={() => {
                saveSearch(item);
                navigate(`/profile/${item._id}`);
                onClose(); // Gọi hàm đóng từ props
              }}
            >
              <img
                src={item.avatar}
                alt="Avatar"
                className="notification-avatar"
              />
              <p>
                {item.first_name} {item.last_name}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchDialog;
