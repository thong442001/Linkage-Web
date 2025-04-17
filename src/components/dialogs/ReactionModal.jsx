import React, { useState } from "react";
import styles from "../../styles/components/dialogs/ReactionModal.module.css";

const ReactionModal = ({ onClose, reactions }) => {
  const [activeTab, setActiveTab] = useState("all");

  const uniqueReactions = getUniqueReactions(reactions);
  const filteredReactions =
    activeTab === "all"
      ? reactions
      : reactions.filter((r) => r.ID_reaction.icon === activeTab);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Cảm xúc về tin nhắn</h2>
          <button onClick={onClose} className={styles.closeButton}>
            &times;
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <div
            onClick={() => setActiveTab("all")}
            className={`${styles.tab} ${activeTab === "all" ? styles.tabActive : ""}`}
          >
            Tất cả {reactions.length}
          </div>
          {uniqueReactions.map((emoji, idx) => (
            <div
              key={idx}
              onClick={() => setActiveTab(emoji.icon)}
              className={`${styles.tab} ${activeTab === emoji.icon ? styles.tabActive : ""}`}
            >
              <span>{emoji.icon}</span> <span>{emoji.count}</span>
            </div>
          ))}
        </div>

        {/* Reaction list */}
        <div className={styles.list}>
          {filteredReactions.map((r, index) => (
            <div key={index} className={styles.item}>
              <div className={styles.userInfo}>
                <img
                  src={r.ID_user.avatar}
                  alt={`${r.ID_user.first_name} ${r.ID_user.last_name}`}
                  className={styles.avatar}
                />
                <div>
                  <div className={styles.name}>
                    {r.ID_user.first_name} {r.ID_user.last_name}
                  </div>
                  <div className={styles.note}>Nhấp để gỡ</div>
                </div>
              </div>
              <div className={styles.emoji}>{r.ID_reaction.icon}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Sửa lại để cộng quantity đúng như dữ liệu của bạn
function getUniqueReactions(reactions) {
  const counts = {};
  reactions.forEach((r) => {
    const icon = r.ID_reaction.icon;
    counts[icon] = (counts[icon] || 0) + r.quantity;
  });
  return Object.entries(counts).map(([icon, count]) => ({ icon, count }));
}

export default ReactionModal;
