import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllGroupOfUser, getMessagesGroup } from "../../rtk/API";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../context/socketContext";
import Groupcomponent from "../../components/items/Groupcomponent";
import styles from "../../styles/screens/chat/ChatS.module.css";
import axios from 'axios';
import {
  FaPenAlt,
  FaImage,
  FaPenSquare,
  FaAlignJustify
} from 'react-icons/fa';
import MessageItem from "../../components/items/MessageItem";
import CreateGroupModal from "../../components/dialogs/CreateGroupModal";
import GroupInfo from "../../components/dialogs/GroupInfo";

const Chat = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const { user, token } = useSelector((state) => state.app);
  const { socket, onlineUsers } = useSocket();
  const [groups, setGroups] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageModalVisible, setImageModalVisible] = useState(false);
  //chat
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const typingUsersInfo = selectedGroup?.members?.filter(member => typingUsers.includes(member._id));
  const hasSentLocation = useRef(false);
  const [sendingFiles, setSendingFiles] = useState({});
  const fileInputRef = useRef(null);
  const [isModalCreate, setIsModalCreate] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCreateGroup = (newGroup) => {
    console.log('Nhóm mới:', newGroup);
  };

  const uploadFile = async (file) => {
    const tempId = Date.now().toString();
    setSendingFiles((prev) => ({ ...prev, [tempId]: true }));

    setMessages((prev) => [
      {
        _id: tempId,
        ID_group: groups.ID_group,
        sender: {
          _id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          avatar: user.avatar,
        },
        content: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'image' : 'video',
        isLoading: true,
        createdAt: new Date().toISOString(),
        message_reactionList: [],
        _destroy: false,
      },
      ...prev,
    ]);

    try {
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', 'ml_default');

      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/ddasyg5z3/upload',
        data,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      const fileUrl = response.data.secure_url;
      console.log('🌍 Link Cloudinary:', fileUrl);

      sendMessage(file.type.startsWith('image/') ? 'image' : 'video', fileUrl);

      setSendingFiles((prev) => {
        const newState = { ...prev };
        delete newState[tempId];
        return newState;
      });
    } catch (error) {
      console.log(
        'Lỗi upload file:',
        error.response ? error.response.data : error.message
      );
      setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
    }
  };

  const onOpenGallery = () => {
    fileInputRef.current.click();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('📂 File đã chọn:', file.name);
      uploadFile(file);
      event.target.value = null;
    }
  };

  const normalizeText = (text) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");

  const filteredGroups = React.useMemo(() => {
    if (!searchText.trim()) {
      return groups || [];
    }
    const lowerSearch = normalizeText(searchText);
    return (groups || []).filter((group) => {
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
  }, [searchText, groups]);

  useEffect(() => {
    callGetAllGroupOfUser(user._id);
  }, [user]);

  const onRefresh1 = useCallback(() => {
    setRefreshing(true);
    callGetAllGroupOfUser(user._id).finally(() => {
      setRefreshing(false);
    });
  }, [refreshing]);

  const callGetAllGroupOfUser = async (ID_user) => {
    try {
      await dispatch(getAllGroupOfUser({ ID_user, token }))
        .unwrap()
        .then((response) => {
          setGroups(response.groups || []);
          handleSelectGroup(response.groups[0] || null);
        });
    } catch (error) {
      console.log("Error:", error);
    }
  };

  useEffect(() => {
    if (!socket) {
      console.log("Socket is not available");
      return;
    }
    // console.log("Setting up socket listeners for groups...");
    // console.log("Socket connected:", socket.connected);

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

    socket.on('lang_nghe_home_chat_edit_avt_name_group', (data) => {
      if (!data || !data._id || (!data.name && !data.avatar)) {
        console.log("Dữ liệu không hợp lệ:", data);
        return;
      }
      //console.log("Received lang_nghe_home_chat_edit_avt_name_group:", data);
      setGroups((prevGroups) => {
        const updatedGroups = prevGroups.map((group) => {
          if (group._id === data._id) {
            return {
              ...group,
              avatar: data.avatar,
              name: data.name,
            };
          }
          return group;
        });
        //console.log("Updated groups:", updatedGroups);
        return [...updatedGroups];
      });
      setSelectedGroup((prevSelectedGroup) => {
        if (prevSelectedGroup && prevSelectedGroup._id === data._id) {
          return {
            ...prevSelectedGroup,
            avatar: data.avatar,
            name: data.name,
          };
        }
        return prevSelectedGroup;
      });
    });

    return () => {
      console.log("Cleaning up socket listeners for groups...");
      socket.off("new_group");
      socket.off("new_message");
      socket.off("group_deleted");
      socket.off("kicked_from_group");
      socket.off('lang_nghe_home_chat_edit_avt_name_group');
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !selectedGroup) return;

    socket.on("receive_message", (data) => {
      setMessages((prevMessages) => {
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

    socket.on("message_revoked", (data) => {
      setMessages((prevMessages) => {
        const updatedMessages = prevMessages?.map((msg) =>
          msg._id === data.ID_message ? { ...msg, _destroy: true } : msg
        );
        return updatedMessages;
      });
    });

    socket.on("receive_message_reation", (data) => {
      setMessages((prevMessages) => {
        return prevMessages?.map((msg) => {
          if (msg._id === data.ID_message) {
            let updatedReactions = [...msg.message_reactionList];
            const reactionIndex = updatedReactions.findIndex(
              (reaction) => reaction._id === data._id
            );
            if (reactionIndex !== -1) {
              updatedReactions[reactionIndex] = {
                ...updatedReactions[reactionIndex],
                quantity: updatedReactions[reactionIndex].quantity + 1,
              };
            } else {
              updatedReactions.push({
                _id: data._id,
                ID_message: data.ID_message,
                ID_user: {
                  _id: data.ID_user._id,
                  first_name: data.ID_user.first_name,
                  last_name: data.ID_user.last_name,
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
            }

            return {
              ...msg,
              message_reactionList: updatedReactions,
            };
          }
          return msg;
        });
      });
    });

    socket.on("group_deleted", ({ ID_group }) => {
      // Handle group deletion
    });

    socket.on("kicked_from_group", ({ ID_group }) => {
      // Handle being kicked from group
    });

    return () => {
      socket.off("receive_message_reation");
      socket.off("message_revoked");
      socket.off("receive_message");
      socket.off("group_deleted");
      socket.off("kicked_from_group");
    };
  }, [selectedGroup]);

  const getMessagesOld = async (ID_group) => {
    try {
      await dispatch(getMessagesGroup({ ID_group: ID_group, token: token }))
        .unwrap()
        .then((response) => {
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

  const openImageModal = (imageUrl) => {
    console.log("🚀 ~ file: Chat.jsx:1 ~ openImageModal ~ imageUrl:", imageUrl);
    setSelectedImage(imageUrl);
    setImageModalVisible(true);
  };

  const closeImageModal = () => {
    setImageModalVisible(false);
    setSelectedImage(null);
  };

  const getFileExtension = (url) => {
    try {
      const pathname = new URL(url).pathname;
      const parts = pathname.split('.');
      return parts.length > 1 ? parts.pop().toLowerCase() : null;
    } catch (error) {
      console.error("URL không hợp lệ:", error);
      return null;
    }
  };

  const sendMessage = (type, content) => {
    if (socket == null || (message == null && type === 'text') || selectedGroup == null) {
      console.log("socket null or message null or type null or selectedGroup null");
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
          content: reply.content || "Tin nhắn không tồn tại",
        }
        : null,
    };
    socket.emit('send_message', payload);
    setMessage('');
    setReply(null);
  };

  const revokeMessage = (ID_message) => {
    if (socket == null || ID_message == null) {
      console.log("socket null or ID_message null");
      return;
    }
    const payload = {
      ID_message: ID_message,
      ID_group: selectedGroup._id
    };
    socket.emit('revoke_message', payload);
  };

  const iconMessage = (ID_message, ID_reaction) => {
    if (socket == null || ID_message == null || ID_reaction == null) {
      console.log("socket null or ID_message null or ID_reaction null");
      return;
    }
    const payload = {
      ID_group: selectedGroup._id,
      ID_message: ID_message,
      ID_user: user._id,
      ID_reaction: ID_reaction,
    };
    socket.emit('send_message_reaction', payload);
  };

  return (
    <div className={styles.app}>
      <div className={styles.chatList}>
        <div className={styles.chatListHeader}>
          <h2>Đoạn chat</h2>
          <button className={styles.createGroupButton} onClick={() => setIsModalCreate(true)}>
            <FaPenSquare />
          </button>
        </div>
        <input
          type="text"
          placeholder="Tìm kiếm trên đoạn chat"
          className={styles.searchBar}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        {filteredGroups.map((item) => (
          <Groupcomponent
            key={item._id}
            item={item}
            ID_me={user._id}
            onSelect={() => handleSelectGroup(item)}
            isSelected={selectedGroup && selectedGroup._id === item._id}
          />
        ))}
      </div>

      <div className={styles.chatContent}>
        {selectedGroup ? (
          <>
            <div className={styles.chatHeader}>
              <button
                style={{ border: "none", background: "none", padding: 0, cursor: "pointer" }}
                onClick={() => navigate(`/profile/${selectedGroup.members.find((m) => m._id !== user._id)?._id}`)}
                disabled={!selectedGroup.isPrivate}
              >
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
              </button>
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
              </div>
              {selectedGroup.isPrivate == false && (
                <div className={styles.chatHeaderActions} onClick={() => setIsModalOpen(true)}>
                  <button><FaAlignJustify /></button>
                </div>
              )}
            </div>

            <div className={styles.chatMessages}>
              {messages.length > 0 ? (
                messages
                  .slice()
                  .reverse()
                  .map((message) => (
                    <MessageItem
                      key={message._id}
                      message={message}
                      user={user}
                      openImageModal={openImageModal}
                      onReply={() => setReply(message)}
                      onRevoke={revokeMessage}
                      onIcon={iconMessage}
                    />
                  ))
              ) : (
                <p>Chưa có tin nhắn nào</p>
              )}
              <div ref={messagesEndRef} />
            </div>
            {
              reply && (
                <div className={styles.replyPreview}>
                  <div>
                    <p className={styles.replyTitle}>Đang trả lời: </p>
                    <p className={styles.replyContent}>
                      {user._id === reply.sender._id
                        ? ' Bạn: '
                        : ` ${reply.sender.first_name} ${reply.sender.last_name}: `}
                      {reply.type === 'text'
                        ? reply.content
                        : reply.type === 'image'
                          ? 'Ảnh'
                          : 'Video'}
                    </p>
                  </div>
                  <button
                    className={styles.replyRight}
                    onClick={() => setReply(null)}
                  >
                    <span className={styles.replyTitle}>✖</span>
                  </button>
                </div>
              )
            }

            <div className={styles.chatInput}>
              <input
                type="file"
                accept="image/*,video/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
              <FaImage className={styles.button_img} onClick={onOpenGallery} />
              <input
                placeholder="Type a message"
                placeholderTextColor={'grey'}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage('text', message);
                  }
                }}
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
                src="https://i.pinimg.com/736x/75/11/c5/7511c5289164c5644782b76e9d122f20.jpg"
                alt="Profile"
                className={styles.avatar}
              />
              <div className={styles.chatHeaderInfo}>
                <h3>Chọn một nhóm để xem tin nhắn</h3>
                {/* <p>Được mã hóa đầu cuối</p> */}
              </div>
            </div>

            <div className={styles.chatMessages}>
              <p>Vui lòng chọn một nhóm để xem tin nhắn.</p>
            </div>

            <div className={styles.chatInput}>
              <input type="text" placeholder="Nhắn tin..." disabled />
              <button disabled>Gửi</button>
            </div>
          </>
        )}
      </div>

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
          <button className={styles.close_button_full_image} onClick={closeImageModal}>
            ✕
          </button>
        </div>
      )}
      {isModalCreate && (
        <CreateGroupModal
          onClose={() => setIsModalCreate(false)}
          onCreateGroup={handleCreateGroup}
        />
      )}
      {isModalOpen &&
        <GroupInfo
          onClose={() => setIsModalOpen(false)}
          group={selectedGroup}
          onRefresh1={onRefresh1}
        />}
    </div>
  );
};

export default Chat;