// src/components/Trash/Trash.jsx
import React from "react";
import styles from "../../styles/screens/strash/Trash.module.css";

const Trash = () => {
  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <h2>Bỏ đi</h2>
        <input type="text" placeholder="Tìm kiếm trong nhật ký hoạt động" className={styles.searchInput} />
        <ul className={styles.menu}>
          <li>📘 Nhật ký hoạt động</li>
          <li>📁 Kho lưu trữ</li>
          <li>🕓 Lịch sử hoạt động</li>
        </ul>
      </div>

      <div className={styles.main}>
        <div className={styles.notice}>Mục trong thùng rác chỉ hiển thị với bạn.</div>
        
        <div className={styles.postGroup}>
          <div className={styles.date}>12 Tháng 4, 2025</div>
          <div className={styles.post}>
            <input type="checkbox" />
            <img src="https://i.imgur.com/4Z8Y2zG.png" alt="avatar" className={styles.avatar} />
            <div className={styles.postContent}>
              <div><strong>Canh Phan</strong> đã cập nhật trạng thái của anh ấy.</div>
              <div className={styles.desc}>adjfajscil</div>
              <div className={styles.time}>🗑️ Còn 29 ngày</div>
            </div>
            <div className={styles.postActions}>
              <button className={styles.viewButton}>Xem</button>
              <span className={styles.postTime}>17:46</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trash;
