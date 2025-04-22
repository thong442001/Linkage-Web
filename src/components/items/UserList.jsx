// UserList.jsx
import React, {
  useState,
  useEffect,
  useMemo
} from 'react';
import './../../styles/components/items/UserListS.css'; // Tạo file CSS mới cho component này
import { useSocket } from "../../context/socketContext";
import { getAllFriendOfID_user, joinGroupPrivate } from '../../rtk/API';
import { useDispatch, useSelector } from 'react-redux';
const UserList = ({ openChatModal }) => {

  const dispatch = useDispatch();
  const me = useSelector(state => state.app.user);
  const token = useSelector(state => state.app.token);
  const { socket, onlineUsers } = useSocket();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {

    callGetAllFriendOfID_user(me._id);

    // socket.on('new_group', ({ group }) => {
    //   setGroups(prevGroups => {
    //     if (!prevGroups) return [group];
    //     if (!prevGroups.some(g => g._id === group._id)) {
    //       return [group, ...prevGroups];
    //     }
    //     return prevGroups;
    //   });
    // });

    // socket.on('new_message', ({ ID_group, message }) => {
    //   console.log('Dữ liệu message từ socket:', message);
    //   setGroups(prevGroups => {
    //     return prevGroups
    //       .map(group => {
    //         if (group._id === ID_group) {
    //           return {
    //             ...group,
    //             messageLatest: {
    //               ID_message: message._id,
    //               sender: message.sender,
    //               content: message.content,
    //               type: message.type,
    //               createdAt: message.createdAt,
    //               _destroy: message._destroy,

    //             },
    //           };
    //         }
    //         return group;
    //       })
    //       .sort((a, b) => {
    //         const timeA = a.messageLatest
    //           ? new Date(a.messageLatest.createdAt).getTime()
    //           : new Date(a.createdAt).getTime();
    //         const timeB = b.messageLatest
    //           ? new Date(b.messageLatest.createdAt).getTime()
    //           : new Date(b.createdAt).getTime();
    //         return timeB - timeA;
    //       });
    //   });
    // });

    // socket.on('group_deleted', ({ ID_group }) => {
    //   setGroups(prevGroups => (prevGroups ? prevGroups.filter(group => group._id !== ID_group) : []));
    // });

    // socket.on('kicked_from_group', ({ ID_group }) => {
    //   setGroups(prevGroups => prevGroups.filter(group => group._id !== ID_group));
    // });

    // socket.on('lang_nghe_home_chat_edit_avt_name_group', (data) => {
    //   //console.log(data)
    //   setGroups(prevGroups => {
    //     return prevGroups
    //       .map(group => {
    //         if (group._id === data._id) {
    //           return {
    //             ...group,
    //             avatar: data.avatar,
    //             name: data.name,
    //           };
    //         }
    //         return group;
    //       })
    //   });
    // });

    // return () => {
    //   socket.off('new_group');
    //   socket.off('new_message');
    //   socket.off('group_deleted');
    //   socket.off('kicked_from_group');
    //   socket.off('lang_nghe_home_chat_edit_avt_name_group');
    // };
  }, [socket]);

  const callGetAllFriendOfID_user = async ID_user => {
    try {
      await dispatch(getAllFriendOfID_user({ me: ID_user, token }))
        .unwrap()
        .then(response => setFriends(response.relationships));
    } catch (error) {
      console.log('Error1 getAllFriendOfID_user:', error);
    }
  };

  // Tính toán danh sách bạn bè đã sắp xếp với useMemo
  const sortedFriends = useMemo(() => {
    if (!onlineUsers || onlineUsers.length === 0 || friends.length === 0) return friends;

    return [...friends].sort((a, b) => {
      const friendA_ID = a.ID_userA._id === me._id ? a.ID_userB._id : a.ID_userA._id;
      const friendB_ID = b.ID_userA._id === me._id ? b.ID_userB._id : b.ID_userA._id;
      const isOnlineA = onlineUsers.includes(friendA_ID);
      const isOnlineB = onlineUsers.includes(friendB_ID);
      return isOnlineB - isOnlineA;
    });
  }, [onlineUsers, friends, me._id]);

  const handleMessageClick = async (user) => {
    if (!user?._id || !me?._id) {
      setErrorMessage("Không thể mở cuộc trò chuyện: Thiếu thông tin người dùng!");
      return;
    }

    try {
      setLoading(true);
      const response = await getID_groupPrivate(me._id, user._id);
      if (response.ID_group) {
        const group = {
          _id: response.ID_group,
          isPrivate: true,
          members: [
            {
              _id: me._id,
              first_name: me.first_name,
              last_name: me.last_name,
              avatar: me.avatar,
            },
            {
              _id: user._id,
              first_name: user.first_name,
              last_name: user.last_name,
              avatar: user.avatar,
            },
          ],
          // Thêm các trường khác nếu cần
        };
        openChatModal(group);
      } else {
        setErrorMessage("Không thể mở cuộc trò chuyện!");
      }
    } catch (error) {
      setErrorMessage("Lỗi khi mở cuộc trò chuyện!");
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy hoặc tạo nhóm chat riêng tư
  const getID_groupPrivate = async (user1, user2) => {
    try {
      const paramsAPI = {
        user1: user1,
        user2: user2,
      };
      const response = await dispatch(joinGroupPrivate(paramsAPI)).unwrap();
      return response; // Trả về response chứa ID_group và thông tin nhóm
    } catch (error) {
      console.error("Error in getID_groupPrivate:", error);
      throw error;
    }
  };

  return (
    <div className="user-list-container">
      {sortedFriends.map((item, index) => {
        const friend = item.ID_userA._id === me._id ? item.ID_userB : item.ID_userA;
        const isOnline = onlineUsers.includes(friend._id);
        return (
          <div
            key={index}
            className="user-list-item"
            onClick={() => handleMessageClick(friend)}
          >
            <div className="user-avatar-wrapper">
              <img src={friend.avatar} alt="User Avatar" className="user-avatar" />
              <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
            </div>
            <span className="user-name">{friend.first_name} {friend.last_name}</span>
          </div>
        )
      })}
    </div>
  );
};

export default UserList;