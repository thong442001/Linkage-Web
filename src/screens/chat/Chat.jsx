import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllGroupOfUser, getMessagesGroup } from "../../rtk/API";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../context/socketContext";
import Groupcomponent from "../../components/items/Groupcomponent";
import styles from "../../styles/screens/chat/ChatS.module.css";
import {
  FaPenAlt,
} from 'react-icons/fa';
import MessageItem from "../../components/items/MessageItem";
const Chat = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, token } = useSelector((state) => state.app);
  const { socket, onlineUsers } = useSocket();
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageModalVisible, setImageModalVisible] = useState(false);

  //chat
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  // const message.sender._id === user._id = messages.sender._id === user._id; // Kiểm tra tin nhắn có phải của user hiện tại không
  //console.log(messages);
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const typingUsersInfo = selectedGroup?.members?.filter(member => typingUsers.includes(member._id));
  const hasSentLocation = useRef(false); // Biến ref để theo dõi trạng thái gửi

  
  const normalizeText = (text) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");

  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredGroups(groups || []);
    } else {
      const lowerSearch = normalizeText(searchText);
      const filtered = (groups || []).filter((group) => {
        if (group.isPrivate) {
          const otherUser = group.members.find(
            (member) => member._id !== user._id
          );
          if (otherUser) {
            const fullName = `${otherUser.first_name} ${otherUser.last_name}`;
            return normalizeText(fullName).includes(lowerSearch);
          }
          return false;
        }
        const groupName = group.name || "";
        if (normalizeText(groupName).includes(lowerSearch)) return true;
        const memberNames = group.members
          .filter((member) => member._id !== user._id)
          .map((member) => `${member.first_name} ${member.last_name}`);
        return memberNames.some((name) =>
          normalizeText(name).includes(lowerSearch)
        );
      });
      setFilteredGroups(filtered);
    }
  }, [searchText, groups]);

  useEffect(() => {
    callGetAllGroupOfUser(user._id);
  }, [user]);

  const callGetAllGroupOfUser = async (ID_user) => {
    try {
      await dispatch(getAllGroupOfUser({ ID_user, token }))
        .unwrap()
        .then((response) => {
          setGroups(response.groups || []);
          handleSelectGroup(response.groups[0] || null);
          //setSelectedGroup(response.groups[0] || null);
          //console.log('🚀 ~ file: Chat.jsx:20 ~ callGetAllGroupOfUser ~ response:', response.groups);
        });
    } catch (error) {
      console.log("Error:", error);
    }
  };

  useEffect(() => {
    if (!socket) return;
    socket.on("new_group", ({ group }) => {
      setGroups((prevGroups) => {
        if (!prevGroups) return [group];
        if (!prevGroups.some((g) => g._id === group._id)) {
          return [group, ...prevGroups];
        }
        return prevGroups;
      });
    });

    socket.on("new_message", ({ ID_group, message }) => {
      setGroups((prevGroups) => {
        // console.log('🚀 ~ file: Chat.jsx:40 ~ socket.on ~ prevGroups:', prevGroups);
        //console.log("type:" + message.type)
        return prevGroups
          .map((group) => {
            if (group._id === ID_group) {
              return {
                ...group,
                messageLatest: {
                  ID_message: message._id,
                  sender: message.sender,
                  content: message.content,
                  type: message.type,
                  createdAt: message.createdAt,
                  _destroy: message._destroy,
                },
              };
            }
            return group;
          })
          .sort((a, b) => {
            const timeA = a.messageLatest
              ? new Date(a.messageLatest.createdAt).getTime()
              : new Date(a.createdAt).getTime();
            const timeB = b.messageLatest
              ? new Date(b.messageLatest.createdAt).getTime()
              : new Date(b.createdAt).getTime();
            return timeB - timeA;
          });
      });
    });

    socket.on("group_deleted", ({ ID_group }) => {
      setGroups((prevGroups) =>
        prevGroups ? prevGroups.filter((group) => group._id !== ID_group) : []
      );
    });

    socket.on("kicked_from_group", ({ ID_group }) => {
      setGroups((prevGroups) =>
        prevGroups.filter((group) => group._id !== ID_group)
      );
    });

    return () => {
      socket.off("new_group");
      socket.off("new_message");
      socket.off("group_deleted");
      socket.off("kicked_from_group");
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !selectedGroup) return;

    //chat
    // Lắng nghe tin nhắn từ server
    socket.on("receive_message", (data) => {
      //setIsMessNew(true);
      setMessages((prevMessages) => {
        // Thay thế tin nhắn tạm thời nếu đã tồn tại
        const tempIndex = prevMessages.findIndex(
          (msg) => msg.isLoading && msg.type === data.type
        );
        if (tempIndex !== -1) {
          const newMessages = [...prevMessages];
          newMessages[tempIndex] = {
            _id: data._id,
            ID_group: data.ID_group,
            sender: {
              _id: data.sender,
              first_name: data.first_name,
              last_name: data.last_name,
              avatar: data.avatar,
            },
            content: data.content,
            type: data.type,
            ID_message_reply: data.ID_message_reply
              ? {
                _id: data.ID_message_reply._id,
                content:
                  data.ID_message_reply.content || "Tin nhắn không tồn tại",
              }
              : null,
            message_reactionList: [],
            updatedAt: data.updatedAt,
            createdAt: data.createdAt,
            _destroy: data._destroy,
          };
          return newMessages;
        }
        return [
          {
            _id: data._id,
            ID_group: data.ID_group,
            sender: {
              _id: data.sender,
              first_name: data.first_name,
              last_name: data.last_name,
              avatar: data.avatar,
            },
            content: data.content,
            type: data.type,
            ID_message_reply: data.ID_message_reply
              ? {
                _id: data.ID_message_reply._id,
                content:
                  data.ID_message_reply.content || "Tin nhắn không tồn tại",
              }
              : null,
            message_reactionList: [],
            updatedAt: data.updatedAt,
            createdAt: data.createdAt,
            _destroy: data._destroy,
          },
          ...prevMessages,
        ];
      });
    });

    // Lắng nghe tin nhắn từ server bị thu hồi
    socket.on("message_revoked", (data) => {
      //console.log("🔥 Đã nhận được message_revoked:");
      setMessages((prevMessages) => {
        const updatedMessages = prevMessages?.map((msg) =>
          msg._id === data.ID_message ? { ...msg, _destroy: true } : msg
        );
        //console.log("📌 Danh sách tin nhắn sau khi thu hồi:", updatedMessages);
        return updatedMessages;
      });
    });

    // Lắng nghe tin nhắn từ server biểu cảm
    socket.on("receive_message_reation", (data) => {
      //console.log("🔥 Đã nhận được receive_message_reation:" + data);
      setMessages((prevMessages) => {
        return prevMessages?.map((msg) => {
          if (msg._id === data.ID_message) {
            // Copy danh sách cũ
            let updatedReactions = [...msg.message_reactionList];
            //msg.message_reactionList.map()
            // Kiểm tra xem đã có message_reaction có tồn tại chưa
            const reactionIndex = updatedReactions.findIndex(
              (reaction) => reaction._id === data._id
            );
            if (reactionIndex !== -1) {
              // Nếu reaction đã tồn tại, tăng quantity
              updatedReactions[reactionIndex] = {
                ...updatedReactions[reactionIndex],
                quantity: updatedReactions[reactionIndex].quantity + 1,
              };
            } else {
              // Nếu reaction chưa có, thêm mới vào danh sách
              updatedReactions.push({
                _id: data._id,
                ID_message: data.ID_message,
                ID_user: {
                  _id: data.ID_user._id,
                  first_name: data.ID_user.first_name,
                  last_name: data.ID_user.last_name,
                  //displayName: data.ID_user.displayName,
                  avatar: data.ID_user.avatar,
                },
                ID_reaction: {
                  _id: data.ID_reaction._id,
                  name: data.ID_reaction.name,
                  icon: data.ID_reaction.icon,
                },
                quantity: data.quantity,
                updatedAt: data.updatedAt,
                createdAt: data.createdAt,
                _destroy: data._destroy,
              });
              console.log(data.ID_reaction.icon);
            }

            return {
              ...msg,
              message_reactionList: updatedReactions,
            };
          }
          return msg; // Nếu không phải message cần cập nhật, giữ nguyên
        });
      });
    });

    socket.on("group_deleted", ({ ID_group }) => {
      //console.log(`🗑️ Nhóm ${ID_group} đã bị xóa`);
      //goBack();
    });

    socket.on("kicked_from_group", ({ ID_group }) => {
      //console.log(`🚪 Bạn đã bị kick khỏi nhóm ${ID_group}`);
      //goBack();
    });

    // socket.on("user_typing", ({ ID_group, ID_user }) => {
    //   //console.log("User: " + ID_user + " đang soạn tin nhắn...");
    //   if (ID_user == me._id) return;
    //   setTypingUsers((prev) => [...new Set([...prev, ID_user])]); // Thêm user vào danh sách

    // });

    // socket.on("user_stop_typing", ({ ID_group, ID_user }) => {
    //   //console.log("User: " + ID_user + " đang soạn tin nhắn...");
    //   setTypingUsers((prev) => prev.filter((id) => id !== ID_user)); // Xóa user khỏi danh sách
    // });

    return () => {
      socket.off("receive_message_reation");
      socket.off("message_revoked");
      socket.off("receive_message");
      socket.off("group_deleted");
      socket.off("kicked_from_group");
      // đang soạn
      socket.off("user_typing");
      socket.off("user_stop_typing");
    };
  }, [selectedGroup]);

  //call api getMessagesGroupID
  const getMessagesOld = async (ID_group) => {
    try {
      await dispatch(getMessagesGroup({ ID_group: ID_group, token: token }))
        .unwrap()
        .then((response) => {
          //console.log(response.messages)
          setMessages(response.messages);
        })
        .catch((error) => {
          console.log("Error2:", error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSelectGroup = (group) => {
    if (!socket) return;
    socket.emit("joinGroup", group._id);
    getMessagesOld(group._id);
    console.log("📌 Chọn nhóm:", group._id);
    setMessage('');
    setReply(null);
    setSelectedGroup(group);
  };
  // Hiển thị ảnh lớn
  const openImageModal = (imageUrl) => {
    console.log("🚀 ~ file: Chat.jsx:1 ~ openImageModal ~ imageUrl:", imageUrl);
    setSelectedImage(imageUrl);
    setImageModalVisible(true);
  };

  // Đóng modal ảnh
  const closeImageModal = () => {
    setImageModalVisible(false);
    setSelectedImage(null);
  };

  const getFileExtension = (url) => {
    try {
      const pathname = new URL(url).pathname; // Lấy phần đường dẫn từ URL
      const parts = pathname.split('.');
      return parts.length > 1 ? parts.pop().toLowerCase() : null;
    } catch (error) {
      console.error("URL không hợp lệ:", error);
      return null;
    }
  };

  // đang soan tin
  // const handleTyping = (text) => {
  //   setMessage(text);

  //   if (!isTyping) {
  //     //console.log("typing: " + text)
  //     socket.emit("typing", { ID_group: params?.ID_group, ID_user: me._id }); // Gửi sự kiện lên server
  //     setIsTyping(true);
  //   }

  //   // Dừng typing sau 1.5s nếu không nhập tiếp
  //   clearTimeout(typingTimeoutRef.current);
  //   typingTimeoutRef.current = setTimeout(() => {
  //     //console.log("stop_typing: " + text)
  //     socket.emit("stop_typing", { ID_group: params?.ID_group, ID_user: me._id }); // Gửi sự kiện stop typing
  //     setIsTyping(false);
  //   }, 1500);
  // };

  // gửi tin nhắn
  const sendMessage = (type, content) => {
    if (socket == null || (message == null && type === 'text') || selectedGroup == null) {
      console.log("socket null or message null");
      return;
    }
    const payload = {
      ID_group: selectedGroup._id,
      sender: user._id,
      content: content,
      type: type,
      ID_message_reply: reply
        ? {
          _id: reply._id,
          content: reply.content || "Tin nhắn không tồn tại", // Đảm bảo không bị undefined
        }
        : null,
    };
    socket.emit('send_message', payload);
    setMessage('');
    setReply(null); // Xóa tin nhắn trả lời sau khi gửi
  };

  return (
    <div className={styles.app}>
      {/* Phần danh sách đoạn chat bên trái */}
      <div className={styles.chatList}>
        <h2>Đoạn chat</h2>
        <input
          type="text"
          placeholder="Tìm kiếm trên đoạn chat"
          className={styles.searchBar}
        />
        {groups.map((item) => (
          <Groupcomponent
            key={item._id}
            item={item}
            ID_me={user._id}
            onSelect={() => handleSelectGroup(item)}
            isSelected={selectedGroup && selectedGroup._id === item._id}
          />
        ))}
      </div>

      {/* Phần nội dung đoạn chat bên phải */}
      <div className={styles.chatContent}>
        {selectedGroup ? (
          <>
            <div className={styles.chatHeader}>
              <img
                src={
                  selectedGroup.isPrivate
                    ? selectedGroup.members.find((m) => m._id !== user._id)
                      ?.avatar ||
                    "https://images2.thanhnien.vn/528068263637045248/2025/3/28/viruss-17431943994281777502076.jpg"
                    : selectedGroup.avatar ||
                    "https://images2.thanhnien.vn/528068263637045248/2025/3/28/viruss-17431943994281777502076.jpg"
                }
                alt="Profile"
                className={styles.avatar}
              />
              <div className={styles.chatHeaderInfo}>
                <h3>
                  {selectedGroup.isPrivate
                    ? `${selectedGroup.members.find((m) => m._id !== user._id)
                      ?.first_name
                    } ${selectedGroup.members.find((m) => m._id !== user._id)
                      ?.last_name
                    }`
                    : selectedGroup.name
                      ? selectedGroup.name
                      : selectedGroup.members
                        .filter((m) => m._id !== user._id)
                        .map((m) => `${m.first_name} ${m.last_name}`)
                        .join(", ")}
                </h3>
                <p>Được mã hóa đầu cuối</p>
              </div>
              <div className={styles.chatHeaderActions}>
              
                <button><FaPenAlt /></button>
              </div>
            </div>

            <div className={styles.chatMessages}>
              {messages.length > 0 ? (
                messages
                  .slice() // Tạo bản sao của mảng
                  .reverse() // Đảo ngược mảng sao chép
                  .map((message) => (
                    <MessageItem
                      key={message._id}
                      message={message}
                      user={user}
                      openImageModal={openImageModal}
                      ID_me={user._id}
                      setReply={setReply}
                      isTyping={isTyping}
                      typingUsersInfo={typingUsersInfo}
                      hasSentLocation={hasSentLocation.current} // Truyền giá trị ref vào prop
                    />
                  ))
              ) : (
                <p>Chưa có tin nhắn nào</p>
              )}
            </div>

            <div className={styles.chatInput}>
              <input
                //type="text"
                placeholder="Type a message"
                placeholderTextColor={'grey'}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              //onChangeText={handleTyping}
              />
              <button
                onClick={() => sendMessage('text', message)}
              >
                Gửi
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.chatHeader}>
              <img
                src="https://images2.thanhnien.vn/528068263637045248/2025/3/28/viruss-17431943994281777502076.jpg"
                alt="Profile"
                className={styles.avatar}
              />
              <div className={styles.chatHeaderInfo}>
                <h3>Chọn một nhóm để xem tin nhắn</h3>
                <p>Được mã hóa đầu cuối</p>
              </div>
            </div>

            <div className={styles.chatMessages}>
              <p>Vui lòng chọn một nhóm để xem tin nhắn.</p>
            </div>

            <div className={styles.chatInput}>
              <input type="text" placeholder="Nhắn tin..." disabled />
              <button disabled>👍</button>
            </div>
          </>
        )}
      </div>
      {/* Modal xem ảnh lớn */}
      {isImageModalVisible && (
        <div className={styles.post_modal_container}>
          <div className={styles.modal_background} onClick={closeImageModal}></div>
          {getFileExtension(selectedImage) === "mp4" ? (
            <video
              src={selectedImage}
              alt="Full Image"
              className={styles.full_image}
              controls
            />
          ) : (
            <img src={selectedImage} alt="Full Image" className={styles.full_image} />
          )}
          {/* <img src={selectedImage} alt="Full Image" className={styles.full_image} /> */}
          {/* <video src={selectedImage} alt="Full Image" className={styles.full_image} controls /> */}
          {/* <img src={selectedImage} alt="Full Image" className={styles.full_image} /> */}
          <button className={styles.close_button_full_image} onClick={closeImageModal}>
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default Chat;
