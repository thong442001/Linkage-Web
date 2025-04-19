import React, { useState, useEffect } from "react";
import styles from "../../styles/components/dialogs/CreateGroupModal.module.css";
import { useSocket } from "../../context/socketContext";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    getAllFriendOfID_user,
    getGroupID,
    addMembers
} from '../../rtk/API';
import FriendAddItem from "../items/FriendAddItem";

const AddFriendGroupModal = ({ onClose,ID_group }) => {
    const { socket } = useSocket();
    const dispatch = useDispatch();
    const navigation = useNavigate();
    const me = useSelector(state => state.app.user);
    const token = useSelector(state => state.app.token);

    const [group, setGroup] = useState(null);
    const [membersGroup, setMembersGroup] = useState([]);
    const [friends, setFriends] = useState(null);
    const [selectedUsers, setSelectedUsers] = useState([]);

    const toggleSelectUser = (id) => {
        setSelectedUsers((prev) =>
            prev.includes(id)
                ? prev.filter((userId) => userId !== id)
                : [...prev, id]
        );
    };

    useEffect(() => {
        // Call API khi lần đầu vào trang
        callGetAllFriendOfID_user();
        callGetGroupID();
    }, []); 

    //call api getAllFriendOfID_user (lấy danh sách bạn bè)
    const callGetAllFriendOfID_user = async () => {
        try {
            await dispatch(getAllFriendOfID_user({ me: me._id, token: token }))
                .unwrap()
                .then((response) => {
                    //console.log(response.groups)
                    setFriends(response.relationships);
                })
                .catch((error) => {
                    console.log('Error1 getAllFriendOfID_user:', error);
                });

        } catch (error) {
            console.log(error)
        }
    }

    //call api getGroupID (lấy danh sách thành viên đã trong nhóm) 
    const callGetGroupID = async () => {
        try {
            await dispatch(getGroupID({ ID_group: ID_group, token: token }))
                .unwrap()
                .then((response) => {
                    //console.log(response.groups)
                    setGroup(response.group);
                    setMembersGroup(response.group.members);
                })
                .catch((error) => {
                    console.log('Error1 getGroupID:', error);
                });

        } catch (error) {
            console.log(error)
        }
    }

    //call api addtMembers
    const callAddMembers = async (ID_group, new_members) => {
        try {
            const paramsAPI = {
                ID_group: ID_group,
                new_members: new_members,
            }
            await dispatch(addMembers(paramsAPI))
                .unwrap()
                .then((response) => {
                    //console.log(response?.message)
                    // Emit sự kiện "add_members" để cập nhật danh sách nhóm
                    socket.emit("add_members", { group: group, members: new_members });
                    // chuyển trang khi add thành công
                    onClose(); // Đóng modal sau khi lưu thành công
                })
                .catch((error) => {
                    console.log('Error1 callAddMembers:', error);
                });

        } catch (error) {
            console.log(error)
        }
    }

    // Xử lý add ng
    const handleAddMembers = () => {
        if (selectedUsers.length > 0) {
            callAddMembers(ID_group, selectedUsers)
        } else {
            return;
        }
    };

    const toMembersGroup = () => {
        // để load lại trang chat khi thay đổi 
        navigation.replace("SettingChat", { ID_group: ID_group });
    };
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        {/* Tiêu đề */}
        <div className={styles.modalHeader}>
          <span>Thêm người</span>
          <button className={styles.closeButton} onClick={onClose}>
            Hủy
          </button>
        </div>

        {/* Ô nhập tên nhóm */}
        <div className={styles.inputContainer}>
          <input
            type="text"
            placeholder="Tìm kiếm"
            // value={nameGroup}
            // onChange={(e) => setNameGroup(e.target.value)}
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
                membersGroup={membersGroup}
              />
            ))
          ) : (
            <p>Đang tải danh sách bạn bè...</p>
          )}
        </div>

        {/* Nút Tạo */}
        <button
          className={styles.createButton}
          onClick={handleAddMembers}
        >
          Thêm
        </button>
      </div>
    </div>
  );
};

export default AddFriendGroupModal;
