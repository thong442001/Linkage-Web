import React from "react";
import styles from "../../styles/components/dialogs/GroupMembersModal.module.css";
import { useSelector } from "react-redux";

const GroupMemberItem = ({
  item,
  ID_admin,
  toProfile,
  handleXoa,
  handlePassKey,
}) => {
  const me = useSelector((state) => state.app.user);
  const shortenName = (name) => {
    if (!name) return "";
    if (name.length > 15) {
      return name.substring(0, 12) + "...";
    }
    return name;
  };

  // Nối first_name và last_name
  const fullName = `${item.first_name || ""} ${item.last_name || ""}`.trim();

  return (
    <div className={styles.memberItem}>
      <div className={styles.memberInfo}>
        <img src={item.avatar} alt="avatar" className={styles.avatar} />
        <div>
          <p className={styles.memberName}> {shortenName(fullName)}</p>
          {ID_admin === item._id && (
            <p className={styles.memberRole}>Quản trị viên</p>
          )}
        </div>
      </div>
      <div className={styles.actions}>
        {/* Trưởng nhóm mới có quyền kick vs add vs chuyền key */}
        {ID_admin === me._id && ID_admin !== item._id && (
          <button
            className={styles.grantBtn}
            onClick={() => handlePassKey(item._id)}
          >
            Giao quyền
          </button>
        )}
        {ID_admin == me._id && (
          <button
            className={styles.deleteBtn}
            onClick={() => handleXoa(item._id)}
          >
            Xóa
          </button>
        )}
      </div>
    </div>
  );
};

export default GroupMemberItem;
