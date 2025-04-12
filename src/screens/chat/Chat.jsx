import React, { useState, useEffect } from 'react';
import '../../styles/screens/chat/ChatS.css'; // Import file CSS
import { useDispatch, useSelector } from 'react-redux';
import { getAllGroupOfUser, getMessagesGroup } from '../../rtk/API';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/socketContext';
import Groupcomponent from '../../components/items/Groupcomponent';
const Chat = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, token } = useSelector((state) => state.app);
  const { socket, onlineUsers } = useSocket();
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [searchText, setSearchText] = useState('');

  //chat 
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const normalizeText = text =>
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');

  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredGroups(groups || []);
    } else {
      const lowerSearch = normalizeText(searchText);
      const filtered = (groups || []).filter(group => {
        if (group.isPrivate) {
          const otherUser = group.members.find(member => member._id !== user._id);
          if (otherUser) {
            const fullName = `${otherUser.first_name} ${otherUser.last_name}`;
            return normalizeText(fullName).includes(lowerSearch);
          }
          return false;
        }
        const groupName = group.name || '';
        if (normalizeText(groupName).includes(lowerSearch)) return true;
        const memberNames = group.members
          .filter(member => member._id !== user._id)
          .map(member => `${member.first_name} ${member.last_name}`);
        return memberNames.some(name => normalizeText(name).includes(lowerSearch));
      });
      setFilteredGroups(filtered);
    }
  }, [searchText, groups]);

  useEffect(() => {
    callGetAllGroupOfUser(user._id);
  }, [user]);

  const callGetAllGroupOfUser = async ID_user => {
    try {
      await dispatch(getAllGroupOfUser({ ID_user, token }))
        .unwrap()
        .then(response => {
          setGroups(response.groups || []);
          handleSelectGroup(response.groups[0] || null);
          //setSelectedGroup(response.groups[0] || null);
          //console.log('🚀 ~ file: Chat.jsx:20 ~ callGetAllGroupOfUser ~ response:', response.groups);
        });
    } catch (error) {
      console.log('Error:', error);
    }
  };

  useEffect(() => {
    if (!socket) return;
    socket.on('new_group', ({ group }) => {
      setGroups(prevGroups => {
        if (!prevGroups) return [group];
        if (!prevGroups.some(g => g._id === group._id)) {
          return [group, ...prevGroups];
        }
        return prevGroups;
      });
    });

    socket.on('new_message', ({ ID_group, message }) => {
      setGroups(prevGroups => {
        // console.log('🚀 ~ file: Chat.jsx:40 ~ socket.on ~ prevGroups:', prevGroups);
        //console.log("type:" + message.type)
        return prevGroups
          .map(group => {
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

    socket.on('group_deleted', ({ ID_group }) => {
      setGroups(prevGroups => (prevGroups ? prevGroups.filter(group => group._id !== ID_group) : []));
    });

    socket.on('kicked_from_group', ({ ID_group }) => {
      setGroups(prevGroups => prevGroups.filter(group => group._id !== ID_group));
    });

    return () => {
      socket.off('new_group');
      socket.off('new_message');
      socket.off('group_deleted');
      socket.off('kicked_from_group');
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !selectedGroup) return;

    //chat
    // Lắng nghe tin nhắn từ server
    socket.on('receive_message', (data) => {
      //setIsMessNew(true);
      setMessages(prevMessages => {
        // Thay thế tin nhắn tạm thời nếu đã tồn tại
        const tempIndex = prevMessages.findIndex(msg => msg.isLoading && msg.type === data.type);
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
              ? { _id: data.ID_message_reply._id, content: data.ID_message_reply.content || 'Tin nhắn không tồn tại' }
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
              ? { _id: data.ID_message_reply._id, content: data.ID_message_reply.content || 'Tin nhắn không tồn tại' }
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
    socket.on('message_revoked', (data) => {
      //console.log("🔥 Đã nhận được message_revoked:");
      setMessages(prevMessages => {
        const updatedMessages = prevMessages?.map(msg =>
          msg._id === data.ID_message ? { ...msg, _destroy: true } : msg
        );
        //console.log("📌 Danh sách tin nhắn sau khi thu hồi:", updatedMessages);
        return updatedMessages;
      });
    });

    // Lắng nghe tin nhắn từ server biểu cảm
    socket.on('receive_message_reation', (data) => {
      //console.log("🔥 Đã nhận được receive_message_reation:" + data);
      setMessages(prevMessages => {
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
                quantity: updatedReactions[reactionIndex].quantity + 1
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
              console.log(data.ID_reaction.icon,);
            }

            return {
              ...msg,
              message_reactionList: updatedReactions
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
          console.log('Error2:', error);
        });

    } catch (error) {
      console.log(error)
    }
  }

  const handleSelectGroup = (group) => {

    if (!socket) return;
    socket.emit("joinGroup", group._id);
    getMessagesOld(group._id);
    console.log('📌 Chọn nhóm:', group._id);

    setSelectedGroup(group);
  };

  return (
    <div className="app">
      {/* Phần danh sách đoạn chat bên trái */}
      <div className="chat-list">
        <h2>Đoạn chat</h2>
        <input type="text" placeholder="Tìm kiếm trên Messenger" className="search-bar" />
        {groups.map((item, index) => (
          // <div key={index} className={`chat-item ${chat.name === 'Ngọc Nhân' ? 'active' : ''}`}>
          //   <img src={chat.avatar} alt="Profile" className='avatar' />
          //   <div className="chat-info">
          //     <div className="chat-name">{chat.name}</div>
          //     <div className="last-message">{chat.lastMessage}</div>
          //   </div>
          //   <div className="chat-time">{chat.time}</div>
          // </div>
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
      <div className="chat-content">
        {selectedGroup ? (
          <>
            <div className="chat-header">
              <img
                src={
                  selectedGroup.isPrivate
                    ? selectedGroup.members.find((m) => m._id !== user._id)?.avatar ||
                    'https://images2.thanhnien.vn/528068263637045248/2025/3/28/viruss-17431943994281777502076.jpg'
                    : selectedGroup.avatar ||
                    'https://images2.thanhnien.vn/528068263637045248/2025/3/28/viruss-17431943994281777502076.jpg'
                }
                alt="Profile"
                className="avatar"
              />
              <div className="chat-header-info">
                <h3>
                  {selectedGroup.isPrivate
                    ? `${selectedGroup.members.find((m) =>
                      m._id !== user._id)?.first_name} ${selectedGroup.members.find((m) =>
                        m._id !== user._id)?.last_name}`
                    : (selectedGroup.name)
                      ? `${selectedGroup.name}`
                      : `${selectedGroup.members.filter(m => m._id !== user._id)
                        .map(m => `${m.first_name} ${m.last_name}`)
                        .join(", ")}`
                  }
                </h3>
                <p>Được mã hóa đầu cuối</p>
              </div>
              <div className="chat-header-actions">
                <button>📞</button>
                <button>🔕</button>
                <button>🔍</button>
              </div>
            </div>

            <div className="chat-messages">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div key={message._id} className={`message ${message.isMe ? 'me' : 'other'}`}>
                    {!message.isMe && (
                      <img
                        src={
                          message.sender.avatar ||
                          'https://images2.thanhnien.vn/528068263637045248/2025/3/28/viruss-17431943994281777502076.jpg'
                        }
                        alt="Profile"
                        className="avatar"
                      />
                    )}
                    <div className="message-content">
                      <p>{message.content}</p>
                      <span className="message-time">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p>Chưa có tin nhắn nào</p>
              )}
            </div>

            <div className="chat-input">
              <input
                type="text"
                placeholder="Nhắn tin..."
                value={newMessage}
              //onChange={(e) => setNewMessage(e.target.value)}
              //onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button
              //onClick={handleSendMessage}
              >👍</button>
            </div>
          </>
        ) : (
          <>
            <div className="chat-header">
              <img
                src="https://images2.thanhnien.vn/528068263637045248/2025/3/28/viruss-17431943994281777502076.jpg"
                alt="Profile"
                className="avatar"
              />
              <div className="chat-header-info">
                <h3>Chọn một nhóm để xem tin nhắn</h3>
                <p>Được mã hóa đầu cuối</p>
              </div>
              <div className="chat-header-actions">
                <button disabled>📞</button>
                <button disabled>🔕</button>
                <button disabled>🔍</button>
              </div>
            </div>

            <div className="chat-messages">
              <p>Vui lòng chọn một nhóm để xem tin nhắn.</p>
            </div>

            <div className="chat-input">
              <input type="text" placeholder="Nhắn tin..." disabled />
              <button disabled>👍</button>
            </div>
          </>
        )}
      </div>

    </div>
  );
};

export default Chat;