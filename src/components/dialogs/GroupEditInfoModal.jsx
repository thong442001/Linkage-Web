import { useState, useEffect } from "react";
import styles from "../../styles/components/dialogs/GroupEditInfoModal.module.css";
import { useDispatch, useSelector } from "react-redux";
import { getGroupID, editAvtNameGroup } from "../../rtk/API";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSocket } from '../../context/socketContext';
export default function GroupEditInfoModal({ onClose, ID_group }) {
  const dispatch = useDispatch();
  const me = useSelector((state) => state.app.user);
  const token = useSelector((state) => state.app.token);
  const navigation = useNavigate();
  const { socket } = useSocket();
  const [AvtGroup, setAvtGroup] = useState(null);
  const [nameGroup, setNameGroup] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // input name

  useEffect(() => {
    // Call API khi lần đầu vào trang
    callGetGroupID();

    socket.emit("joinGroup", ID_group);

    socket.on("lang_nghe_chat_edit_avt_name_group", (data) => {
      console.log("lang_nghe_chat_edit_avt_name_group")
    });

    return () => {
      socket.off("lang_nghe_chat_edit_avt_name_group");
    };
  }, [ID_group]);

  //call api getGroupID
  const callGetGroupID = async () => {
    try {
      await dispatch(getGroupID({ ID_group: ID_group, token: token }))
        .unwrap()
        .then((response) => {
          //console.log("adfhasjd", response.group.name);
          setAvtGroup(response.group.avatar);
          // console.log("AvtGroup:", response.group.AvtGroup)
          if (response.group.name == null) {
            setNameGroup("Nhóm chưa có tên");
          } else {
            setNameGroup(response.group.name);
          }
        })
        .catch((error) => {
          console.log("Error1 getGroupID:", error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  //call api editAvtNameGroup
  const callEditAvtNameGroup = async () => {
    // try {
    //   if (AvtGroup == null || nameGroup == null) {
    //     return;
    //   }
    //   console.log(AvtGroup)
    //   const paramsAPI = {
    //     ID_group: ID_group,
    //     AvtGroup: AvtGroup,
    //     name: nameGroup == "Nhóm chưa có tên" ? null : nameGroup,
    //   };
    //   await dispatch(editAvtNameGroup(paramsAPI))
    //     .unwrap()
    //     .then((response) => {
    //       //console.log(response)
    //       onRefresh();
    //       onClose(); // Đóng modal sau khi lưu thành công
    //     })
    //     .catch((error) => {
    //       console.log("Error1 editAvtNameGroup:", error);
    //     });
    // } catch (error) {
    //   console.log(error);
    // }
    if (!socket) return;
    const payload = {
      ID_group: ID_group,
      avatar: AvtGroup,
      name: nameGroup == "Nhóm chưa có tên" ? null : nameGroup,
    };
    socket.emit('edit_avt_name-group', payload);
    //onRefresh2();
    onClose();
  };

  //up lên cloudiary
  const uploadFile = async (file) => {
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "ml_default");

      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/ddasyg5z3/upload",
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const fileUrl = response.data.secure_url;
      console.log("🌍 Link Cloudinary:", fileUrl);
      setAvtGroup(fileUrl);
    } catch (error) {
      console.log(
        "Lỗi upload file:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const goBack = () => {
    // để load lại trang chat khi thay đổi
    navigation.navigate("SettingChat", { ID_group: ID_group });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("📂 File đã chọn:", file.name);
      uploadFile(file);
      e.target.value = null; // Reset input để có thể chọn lại cùng file
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <button onClick={onClose} className={styles.cancelBtn}>
            Hủy
          </button>
          <h2 className={styles.title}>Thông tin nhóm</h2>
          <button
            onClick={callEditAvtNameGroup}
            className={styles.saveBtn}
          >
            Lưu
          </button>
        </div>

        {/* AvtGroup */}
        <div className={styles.body}>
          {AvtGroup != null && (
            <div className={styles.AvtGroupWrapper}>
              <img src={AvtGroup} alt="AvtGroup" className={styles.avatar} />
            </div>
          )}
          {AvtGroup != null && (
            <div className={styles.nameGroup}>
              <input
                value={nameGroup}
                // onFocus={() => {
                //   if (!isEditing) {
                //     setNameGroup("");
                //     setIsEditing(true);
                //   }
                // }}
                onChange={(e) => setNameGroup(e.target.value)}
              />
            </div>
          )}

          {/* Upload button */}
          <label className={styles.uploadLabel}>
            <div className={styles.uploadIcon}>
              <img
                src="https://icons.iconarchive.com/icons/iconsmind/outline/512/Photo-icon.png"
                alt="Upload"
                className={styles.iconImage}
              />
            </div>
            <span className={styles.uploadText}>Tải ảnh lên</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className={styles.hiddenInput}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
