import React, { useState, useEffect } from "react";
import styles from "../../styles/components/dialogs/CreateGroupModal.module.css";
import { useSocket } from "../../context/socketContext";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAllFriendOfID_user, addGroup } from "../../rtk/API";
import FriendAddItem from "../items/FriendAddItem";

const CreateGroupModal = ({ onClose, onCreateGroup }) => {
  const { socket } = useSocket();
  const navigation = useNavigate();

  const dispatch = useDispatch();
  const me = useSelector((state) => state.app.user);
  const token = useSelector((state) => state.app.token);
  const [nameGroup, setNameGroup] = useState(null);
  const [friends, setFriends] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([me._id]); // me phải trong nhóm
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [failedModalVisible, setFailedModalVisible] = useState(false);
  const [isCreating, setIsCreating] = useState(false); // Thêm state để theo dõi trạng thái tạo nhóm

  const toggleSelectUser = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    // Call API khi lần đầu vào trang
    callGetAllFriendOfID_user();
  }, []);

  //call api getAllFriendOfID_user
  const callGetAllFriendOfID_user = async () => {
    try {
      await dispatch(getAllFriendOfID_user({ me: me._id, token: token }))
        .unwrap()
        .then((response) => {
          console.log("canphan", response.groups);
          setFriends(response.relationships);
        })
        .catch((error) => {
          console.log("Error1 getAllFriendOfID_user:", error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  //call api addGroup
  const callAddGroup = async (name, members) => {
    try {
      const paramsAPI = {
        name: name,
        members: members,
      };
      await dispatch(addGroup(paramsAPI))
        .unwrap()
        .then((response) => {
          setSuccessModalVisible(true);
          setTimeout(() => setSuccessModalVisible(false), 2000);
          console.log("ID_group: " + response.group._id);
          // Emit sự kiện "new_group" để cập nhật danh sách nhóm
          socket.emit("new_group", { group: response.group, members: members });
          setIsCreating(false); // Cho phép nhấn lại nếu thất bại
          onClose()
        })
        .catch((error) => {
          setFailedModalVisible(true);
          setTimeout(() => setFailedModalVisible(false), 2000);
          console.log("Error1 addGroup:", error);
          setIsCreating(false); // Cho phép nhấn lại nếu thất bại
        });
    } catch (error) {
      setFailedModalVisible(true);
      setTimeout(() => setFailedModalVisible(false), 2000);
      console.log(error);
    }
  };
  // Xử lý tạo group
  const taogGroup = () => {
    if (selectedUsers.length > 0) {
      setIsCreating(true); // Vô hiệu hóa nút ngay khi nhấn
      callAddGroup(nameGroup, selectedUsers);
    } else {
      return;
    }
  };
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        {/* Tiêu đề */}
        <div className={styles.modalHeader}>
        <button className={styles.closeButton} onClick={onClose}>
            Hủy
          </button>
          <button
          onClick={taogGroup}
          disabled={selectedUsers.length < 3 || isCreating}
          className={styles.createButton}
          >Tạo</button>
        </div>

        {/* Ô nhập tên nhóm */}
        <div className={styles.inputContainer}>
          <input
            type="text"
            placeholder="Tên nhóm (không bắt buộc)"
            value={nameGroup}
            onChange={(e) => setNameGroup(e.target.value)}
            className={styles.groupNameInput}
          />
        </div>

        {/* Danh sách bạn bè */}
        <div className={styles.friendsList}>
          <p className={styles.sectionTitle}>Gợi ý</p>
          {friends && friends.length > 0 ? (
            friends.map((friend) => (
              <FriendAddItem
                key={friend._id}
                item={friend}
                onToggle={toggleSelectUser}
                selectedUsers={selectedUsers}
                membersGroup={[]}
              />
            ))
          ) : (
            <p>Đang tải danh sách bạn bè...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
