import { useEffect, useRef, useState } from "react";
import "./../../styles/components/items/SearchDialog.css"; // File CSS riêng cho SearchDialog
import { Routes, Route, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

const SearchDialog = ({ item, onClose ,saveSearch }) => {
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
        {item.length > 0 ? (
          item.map((item) => (
            <div
              key={item._id}
              className="notification-item"
              onClick={() => {
                saveSearch(item);
                navigate(`/profile/${item._id}`);
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
