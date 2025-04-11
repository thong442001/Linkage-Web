import React from 'react';
import '../../styles/screens/chat/ChatS.css'; // Import file CSS
import { useDispatch, useSelector } from 'react-redux';

const Chat = () => {
  // Dữ liệu cứng cho danh sách đoạn chat bên trái
  const chatList = [
    { name: 'Peter', lastMessage: 'hello', time: '1 phút', avatar: 'https://images2.thanhnien.vn/528068263637045248/2025/3/28/viruss-17431943994281777502076.jpg' },
    { name: 'Peter', lastMessage: 'hello', time: '1 phút', avatar: 'https://images2.thanhnien.vn/528068263637045248/2025/3/28/viruss-17431943994281777502076.jpg' },
    { name: 'Peter', lastMessage: 'hello', time: '1 phút', avatar: 'https://images2.thanhnien.vn/528068263637045248/2025/3/28/viruss-17431943994281777502076.jpg' },
    { name: 'Peter', lastMessage: 'hello', time: '1 phút', avatar: 'https://images2.thanhnien.vn/528068263637045248/2025/3/28/viruss-17431943994281777502076.jpg' },
    { name: 'Peter', lastMessage: 'hello', time: '1 phút', avatar: 'https://images2.thanhnien.vn/528068263637045248/2025/3/28/viruss-17431943994281777502076.jpg' },
    { name: 'Peter', lastMessage: 'hello', time: '1 phút', avatar: 'https://images2.thanhnien.vn/528068263637045248/2025/3/28/viruss-17431943994281777502076.jpg' },
    { name: 'Peter', lastMessage: 'hello', time: '1 phút', avatar: 'https://images2.thanhnien.vn/528068263637045248/2025/3/28/viruss-17431943994281777502076.jpg' },
  ];

  // Dữ liệu cứng cho nội dung đoạn chat bên phải
  const messages = [
    { sender: 'Ngọc Nhân', content: 'Tài ngu', time: 'Hôm thứ', isMe: false },
    { sender: 'Ngọc Nhân', content: 'Tài ngu', time: 'Hôm thứ', isMe: false },
    { sender: 'Ngọc Nhân', content: 'Tài ngu', time: 'Hôm thứ', isMe: false },
    { sender: 'Ngọc Nhân', content: 'Tài ngu', time: 'Hôm thứ', isMe: false },

    { sender: 'Me', content: 'Em muốn hun Peter của anh', time: 'Hôm thứ', isMe: true },
    { sender: 'Me', content: 'Em muốn hun Peter của anh', time: 'Hôm thứ', isMe: true },
    { sender: 'Me', content: 'Em muốn hun Peter của anh', time: 'Hôm thứ', isMe: true },
    { sender: 'Me', content: 'Em muốn hun Peter của anh', time: 'Hôm thứ', isMe: true },

  ];

  return (
    <div className="app">
      {/* Phần danh sách đoạn chat bên trái */}
      <div className="chat-list">
        <h2>Đoạn chat</h2>
        <input type="text" placeholder="Tìm kiếm trên Messenger" className="search-bar" />
        {chatList.map((chat, index) => (
          <div key={index} className={`chat-item ${chat.name === 'Ngọc Nhân' ? 'active' : ''}`}>
            <img src={chat.avatar} alt="Profile" className='avatar' />
            <div className="chat-info">
              <div className="chat-name">{chat.name}</div>
              <div className="last-message">{chat.lastMessage}</div>
            </div>
            <div className="chat-time">{chat.time}</div>
          </div>
        ))}
      </div>

      {/* Phần nội dung đoạn chat bên phải */}
      <div className="chat-content">
        <div className="chat-header">
        <img src='https://images2.thanhnien.vn/528068263637045248/2025/3/28/viruss-17431943994281777502076.jpg' alt="Profile" className='avatar' />
          <div className="chat-header-info">
            <h3>Peter</h3>
            <p>Được mã hóa đầu cuối</p>
          </div>
          <div className="chat-header-actions">
            <button>📞</button>
            <button>🔕</button>
            <button>🔍</button>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.isMe ? 'me' : 'other'}`}>
              {!message.isMe &&         
                <img src='https://images2.thanhnien.vn/528068263637045248/2025/3/28/viruss-17431943994281777502076.jpg' alt="Profile" className='avatar' />
              }
              <div className="message-content">
                <p>{message.content}</p>
                <span className="message-time">{message.time}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="chat-input">
          <input type="text" placeholder="Nhắn tin..." />
          <button>👍</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;