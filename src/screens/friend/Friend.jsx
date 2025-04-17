import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllLoiMoiKetBan,
  chapNhanLoiMoiKetBan,
  huyLoiMoiKetBan,
  getGoiYBanBe,
  getRelationshipAvsB,
  guiLoiMoiKetBan,
  getAllFriendOfID_user,
} from "../../rtk/API";
import FriendRequestItem from "../../components/items/FriendRequestItem";
import FriendGoiYItem from "../../components/items/FriendGoiYItem";
import FriendItem from "../../components/items/FriendItem";
import styles from "../../styles/screens/friend/FriendS.module.css";
const Friend = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const me = useSelector((state) => state.app.user);
  const token = useSelector((state) => state.app.token);
  const [relationships, setRelationships] = useState([]);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [failedModalVisible, setFailedModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  //time now
  const [currentTime, setCurrentTime] = useState(Date.now());
  //gợi ý bạn bè
  const [listGoiY, setListGoiY] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);

  //call api getAllFriendOfID_user
  const callGetAllFriendOfID_user = async () => {
    try {
      await dispatch(getAllFriendOfID_user({ me: me._id, token: token }))
        .unwrap()
        .then((response) => {
          //console.log(response.groups)
          setFriends(response.relationships);
        })
        .catch((error) => {
          console.log("Error1 getAllFriendOfID_user:", error);
        });
    } catch (error) {
      console.log(error);
    }
  };
  // gọi api gợi ý bạn bè
  useEffect(() => {
    callGetAllFriendOfID_user();
    callGetAllFriendGoiYOfID_user();
  }, []);

  const callGetAllFriendGoiYOfID_user = async () => {
    try {
      setLoading(true);
      await dispatch(getGoiYBanBe({ me: me._id, token }))
        .unwrap()
        .then((response) => {
          setListGoiY(response.data);
        })
        .catch((error) => {
          console.log("Error1 getAllFriendOfID_user:", error);
        });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleThemBanBe = async (ID_user) => {
    // Optimistic update: Ẩn user khỏi danh sách ngay lập tức
    const userToRemove = listGoiY.find((item) => item.user._id === ID_user);
    setListGoiY((prev) => prev.filter((item) => item.user._id !== ID_user));

    try {
      // Gọi hai API tuần tự (vì guiLoiMoiKetBan cần ID_relationship)
      const relationshipResponse = await dispatch(
        getRelationshipAvsB({ ID_user, me: me._id })
      ).unwrap();
      const ID_relationship = relationshipResponse.relationship._id;
      await dispatch(guiLoiMoiKetBan({ ID_relationship, me: me._id })).unwrap();

      console.log("Gửi lời mời kết bạn thành công:", ID_user);
      // Hiển thị modal thành công
      setSuccessModalVisible(true);
      setTimeout(() => setSuccessModalVisible(false), 2000); // Ẩn sau 2 giây
    } catch (error) {
      // Nếu lỗi, thêm lại user vào danh sách
      console.log("❌ Lỗi khi gửi lời mời kết bạn:", error);
      setListGoiY((prev) =>
        [...prev, userToRemove].sort((a, b) =>
          a.user._id.localeCompare(b.user._id)
        )
      );
      // Hiển thị modal thất bại
      setFailedModalVisible(true);
      setTimeout(() => setFailedModalVisible(false), 2000); // Ẩn sau 2 giây
    }
  };

  useEffect(() => {
    callGetAllLoiMoiKetBan();
    setCurrentTime(Date.now());
  }, [location]);
  // gọi api lấy tất cả lời mời kết bạn
  const callGetAllLoiMoiKetBan = async () => {
    try {
      const response = await dispatch(
        getAllLoiMoiKetBan({ me: me._id, token })
      ).unwrap();
      setRelationships(response.relationships);
    } catch (error) {
      console.log("Error getAllLoiMoiKetBan:", error);
    }
  };
  //api gửi lời mời kết bạn
  const callChapNhanLoiMoiKetBan = async (ID_relationship) => {
    try {
      const paramsAPI = { ID_relationship };
      await dispatch(chapNhanLoiMoiKetBan(paramsAPI))
        .unwrap()
        .then((response) => {
          console.log(response?.message);
          callGetAllLoiMoiKetBan();
          setModalMessage("Đã chấp nhận lời mời kết bạn!");
          setSuccessModalVisible(true);
          setTimeout(() => setSuccessModalVisible(false), 2000);
        })
        .catch((error) => {
          console.log("Error2 callChapNhanLoiMoiKetBan:", error);
          setModalMessage("Chấp nhận lời mời thất bại!");
          setFailedModalVisible(true);
          setTimeout(() => setFailedModalVisible(false), 2000);
        });
    } catch (error) {
      console.log(error);
      setModalMessage("Có lỗi xảy ra. Vui lòng thử lại!");
      setFailedModalVisible(true);
      setTimeout(() => setFailedModalVisible(false), 2000);
    }
  };
  //api hủy lời mời kết bạn
  const callHuyLoiMoiKetBan = async (ID_relationship) => {
    try {
      const paramsAPI = { ID_relationship };
      await dispatch(huyLoiMoiKetBan(paramsAPI))
        .unwrap()
        .then((response) => {
          console.log(response?.message);
          callGetAllLoiMoiKetBan();
          setModalMessage("Đã xóa lời mời kết bạn!");
          setSuccessModalVisible(true);
          setTimeout(() => setSuccessModalVisible(false), 2000);
        })
        .catch((error) => {
          console.log("Error2 callHuyLoiMoiKetBan:", error);
          setModalMessage("Xóa lời mời thất bại!");
          setFailedModalVisible(true);
          setTimeout(() => setFailedModalVisible(false), 2000);
        });
    } catch (error) {
      console.log(error);
      setModalMessage("Có lỗi xảy ra. Vui lòng thử lại!");
      setFailedModalVisible(true);
      setTimeout(() => setFailedModalVisible(false), 2000);
    }
  };
  return (
    <div className={styles.friendsContainer}>
      <div className={styles.sidebarLeft}>
        <h2 className={styles.sidebarLeftTitle}>Bạn bè</h2>
        <div
          className={`${styles.menuItemFriend} ${activeTab === "home" ? styles.active : ""}`}
          onClick={() => setActiveTab("home")}
        >
          Trang chủ
        </div>
        <div
          className={`${styles.menuItemFriend} ${activeTab === "requests" ? styles.active : ""}`}
          onClick={() => setActiveTab("requests")}
        >
          Lời mời kết bạn
        </div>
        <div
          className={`${styles.menuItemFriend} ${activeTab === "suggestions" ? styles.active : ""}`}
          onClick={() => setActiveTab("suggestions")}
        >
          Gợi ý
        </div>
        <div
          className={`${styles.menuItemFriend} ${activeTab === "all" ? styles.active : ""}`}
          onClick={() => setActiveTab("all")}
        >
          Tất cả bạn bè
        </div>
      </div>

      <div className={styles.mainContentContainer}>
        {activeTab === "home" && (
          <div>
            <div className={styles.friendRequests}>
              <h3 className={styles.friendRequestsTitle}>Lời mời kết bạn</h3>
              <div className={styles.friendRequestsList}>
                {relationships.map((request) => (
                  <FriendRequestItem
                    key={request._id}
                    data={request}
                    me={me._id}
                    currentTime={currentTime}
                    onXacNhan={callChapNhanLoiMoiKetBan}
                    onXoa={callHuyLoiMoiKetBan}
                  />
                ))}
              </div>
            </div>

            <div className={styles.friendsList}>
              <h3 className={styles.friendsListTitle}>Những người bạn có thể biết</h3>
              <div className={styles.friendsListGrid}>
                {listGoiY.map((data) => (
                  <FriendGoiYItem
                    key={data._id}
                    item={data}
                    onThemBanBe={handleThemBanBe}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        {activeTab === "requests" && (
          <div className={styles.friendRequests}>
            <h3 className={styles.friendRequestsTitle}>Lời mời kết bạn</h3>
            <div className={styles.friendRequestsList}>
              {relationships.map((request) => (
                <FriendRequestItem
                  key={request._id}
                  data={request}
                  me={me._id}
                  currentTime={currentTime}
                  onXacNhan={callChapNhanLoiMoiKetBan}
                  onXoa={callHuyLoiMoiKetBan}
                />
              ))}
            </div>
          </div>
        )}
        {activeTab === "suggestions" && (
          <div className={styles.friendsList}>
            <h3 className={styles.friendsListTitle}>Những người bạn có thể biết</h3>
            <div className={styles.friendsListGrid}>
              {listGoiY.map((data) => (
                <FriendGoiYItem
                  key={data._id}
                  item={data}
                  onThemBanBe={handleThemBanBe}
                />
              ))}
            </div>
          </div>
        )}
        {activeTab === "all" && (
          <div className={styles.friendsList}>
            <h3 className={styles.friendsListTitle}>Bạn bè của tôi</h3>
            <div className={styles.friendsListGrid}>
              {friends.map((data) => (
                <FriendItem
                  key={data._id}
                  item={data}
                  _id={me._id}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Friend;
