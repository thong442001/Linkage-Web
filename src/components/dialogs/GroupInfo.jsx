import React, { useState, useEffect } from "react";
import styles from "../../styles/components/dialogs/GroupInfo.module.css";
import { X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getGroupID, deleteMember, deleteGroup } from "../../rtk/API";
import { useSocket } from "../../context/socketContext";
import { useNavigate } from "react-router-dom";
import GroupEditInfoModal from "./GroupEditInfoModal";
import AddFriendGroupModal from "./AddFriendGroupModal";
import GroupMembersModal from "./GroupMembersModal";
import { QRCodeCanvas } from "qrcode.react"; // Đã thay đổi từ QRCode sang QRCodeCanvas

import {
  FaQrcode
  } from 'react-icons/fa';

const GroupInfo = ({ onClose, ID_group }) => {
  const { socket } = useSocket();
  // console.log('Setting: ', ID_group);
  const dispatch = useDispatch();
  const me = useSelector((state) => state.app.user);
  const token = useSelector((state) => state.app.token);
  const navigation = useNavigate();

  const [group, setGroup] = useState(null);
  const [qrVisible, setQrVisible] = useState(false); // 🔥 State để hiển thị modal QR
  const [onModalEditInfo, setonModalEditInfo] = useState(false); // 🔥 State để hiển thị modal QR
  const [onModalAddmemders, setonModalAddmemders] = useState(false); // 🔥 State để hiển thị modal QR
  const [onModalMembers, setonModalMembers] = useState(false); 
  const [onModalQR, setonModalQR] = useState(false); 

  useEffect(() => {
    // Call API khi lần đầu vào trang
    callGetGroupID();
  }, [navigation]);

  //call api getGroupID
  const callGetGroupID = async () => {
    try {
      await dispatch(getGroupID({ ID_group: ID_group, token: token }))
        .unwrap()
        .then((response) => {
          //console.log(response.groups)
          setGroup(response.group);
        })
        .catch((error) => {
          console.log("Error1 getGroupID:", error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  //call api deleteMember
  const callDeleteMember = async () => {
    try {
      const paramsAPI = {
        ID_group: ID_group,
        ID_user: me._id,
      };
      await dispatch(deleteMember(paramsAPI))
        .unwrap()
        .then((response) => {
          // bakc HomeChat
          onClose();
        })
        .catch((error) => {
          console.log("Error1 deleteMember:", error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  //call api deleteGroup
  const callDeleteGroup = async () => {
    try {
      const paramsAPI = {
        ID_group: ID_group,
      };
      await dispatch(deleteGroup(paramsAPI))
        .unwrap()
        .then((response) => {
          // Emit sự kiện "delete_group" để cập nhật danh sách nhóm
          socket.emit("delete_group", { ID_group: ID_group });
          // bakc HomeChat
          onClose();
        })
        .catch((error) => {
          console.log("Error1 deleteMember:", error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const toMembersGroup = () => {
    onClose();
    // để load lại trang chat khi thay đổi
    navigation.navigate("MembersGroup", { ID_group: ID_group });
  };

  const toAddFriendGroup = () => {
    onClose();
    navigation.navigate("AddFriendGroup", { ID_group: ID_group });
  };

  const toAvtNameGroup = () => {
    setonModalEditInfo(true);
  };

  const handleRoiNhom = () => {
    callDeleteMember();
  };

  const handleGiaiTan = () => {
    callDeleteGroup();
   
  };
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {group !== null && (
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        )}
        {group !== null && (
          <div className={styles.content}>
            <img className={styles.avatar} src={group.avatar} />
            {group.name == null ? (
              <h2 className={styles.title}>Nhóm chưa có tên</h2>
            ) : (
              <h2 className={styles.title}>{group.name}</h2>
            )}
            {group.members[0]._id == me._id && (
              <button onClick={toAvtNameGroup} className={styles.editButton}>Đổi tên hoặc ảnh</button>
            )}
            {group.members[0]._id == me._id && (
              <div className={styles.addSection}>
                <div className={styles.addIcon} onClick={() =>setonModalAddmemders(true)}>+</div>
                <span className={styles.addLabel}>Thêm</span>
                <div className={styles.qrFake} onClick={() => setonModalQR(true)}><FaQrcode/></div>
              </div>
            )}
           
            <div className={styles.actionSection}>
              <button className={styles.viewMembers} onClick={() => {
                setonModalMembers(true)
               }}>
                Xem thành viên trong nhóm chat
              </button>
              <button className={styles.leaveGroup} onClick={handleRoiNhom}>Rời khỏi nhóm chat</button>
                {
                    group.members[0]._id == me._id
                    && (
                        <button className={styles.disbandGroup} onClick={handleGiaiTan}>
                            Giải tán nhóm chat
                        </button>
                    )
                }
            </div>
          </div>
        )}
      </div>
      {
        onModalEditInfo && (
            <GroupEditInfoModal onClose={() => setonModalEditInfo(false)} ID_group = {ID_group}/>
        )
      }
      {
        onModalAddmemders && (
            <AddFriendGroupModal onClose={() => setonModalAddmemders(false)} ID_group = {ID_group}/>
        )
      }
      {
        onModalMembers && (
            <GroupMembersModal onClose={() => setonModalMembers(false)} ID_group = {ID_group}/>
        )
      }
      {onModalQR && (
        <div className={styles.modalContainer}>
          <div className={styles.modalContent}>
            <h1 style={{ color: "#1e90ff", margin: 0 }}>Linkage</h1>
            <h3 className={styles.modalTitle}>Quét mã QR để đăng nhập</h3>
            <QRCodeCanvas  value={`linkage://addgroup/${ID_group}`} size={180} />
            <button
              onClick={() => setonModalQR(false)}
              className={styles.closeButtonQR}
            >
              <span className={styles.closeButtonText}>Đóng</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupInfo;
