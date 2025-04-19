import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getGroupID, deleteMember, passKey } from "../../rtk/API";
import { useSocket } from "../../context/socketContext";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/components/dialogs/GroupMembersModal.module.css";
import GroupMemberItem from "../items/GroupMemberItem";

const members = [
  {
    id: 1,
    name: "Shark Cảnh",
    avatar: "https://via.placeholder.com/40",
    role: "admin",
  },
  {
    id: 2,
    name: "Độ Nguyễn",
    avatar: "https://via.placeholder.com/40",
    role: "member",
  },
  {
    id: 3,
    name: "Võ Tấn Tài",
    avatar: "https://via.placeholder.com/40",
    role: "member",
  },
];

const GroupMembersModal = ({ onClose, ID_group }) => {
  const { socket } = useSocket();
  const dispatch = useDispatch();
  const navigation = useNavigate();
  const me = useSelector((state) => state.app.user);
  const token = useSelector((state) => state.app.token);

  const [membersGroup, setMembersGroup] = useState(null);
  useEffect(() => {
    // Call API khi lần đầu vào trang
    callGetGroupID();
  }, []);

  //call api getGroupID
  const callGetGroupID = async () => {
    try {
      await dispatch(getGroupID({ ID_group: ID_group, token: token }))
        .unwrap()
        .then((response) => {
          console.log(response.group.members);
          setMembersGroup(response.group.members);
        })
        .catch((error) => {
          console.log("Error1 getGroupID:", error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  //call api deleteMember
  const callDeleteMember = async (ID_user) => {
    try {
      const paramsAPI = {
        ID_group: ID_group,
        ID_user: ID_user,
      };
      await dispatch(deleteMember(paramsAPI))
        .unwrap()
        .then((response) => {
          console.log(ID_user);
          // Emit sự kiện "kick_user" để cập nhật danh sách nhóm
          socket.emit("kick_user", { ID_group: ID_group, ID_user: ID_user });
          // load lại
          callGetGroupID();
        })
        .catch((error) => {
          console.log("Error1 deleteMember:", error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  //call api passKey
  const callPassKey = async (oldAdmin, newAdmin) => {
    try {
      const paramsAPI = {
        ID_group: ID_group,
        oldAdmin: oldAdmin,
        newAdmin: newAdmin,
      };
      await dispatch(passKey(paramsAPI))
        .unwrap()
        .then((response) => {
          //console.log(response.message)
          // load lại
          callGetGroupID();
        })
        .catch((error) => {
          console.log("Error1 passKey:", error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const toSettingChat = () => {
    navigation.navigate("SettingChat", { ID_group: ID_group });
  };

  const toAddFriendGroup = () => {
    navigation.navigate("AddFriendGroup", { ID_group: ID_group });
  };

  const toProfile = (ID_user) => {
    // // để load lại trang chat khi thay đổi
    // navigation.navigate("TabHome", {
    //   screen: "Profile",
    //   params: { _id: ID_user },
    // });
  };

  const handleXoa = (ID_user) => {
    callDeleteMember(ID_user);
  };

  const handlePassKey = (newAdmin) => {
    callPassKey(me._id, newAdmin);
  };

  const shortenName = (name) => {
    if (!name) return "";
    if (name.length > 15) {
      return name.substring(0, 12) + "...";
    }
    return name;
  };
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Thành viên</h2>

        <div className={styles.memberList}>
          {!membersGroup ? (
            <p>Đang tải thành viên...</p>
          ) : membersGroup.length === 0 ? (
            <p>Không có thành viên nào.</p>
          ) : (
            membersGroup.map((item) => (
              <GroupMemberItem
                key={item._id}
                item={item}
                ID_admin={membersGroup[0]?._id}
                toProfile={toProfile}
                handleXoa={handleXoa}
                handlePassKey={handlePassKey}
              />
            ))
          )}
        </div>

        <div className={styles.footer}>
          <button onClick={onClose} className={styles.closeBtn}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupMembersModal;
