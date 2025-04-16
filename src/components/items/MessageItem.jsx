import React,{useRef} from 'react'
import { useDispatch, useSelector } from "react-redux";
import styles from "../../styles/screens/chat/ChatS.module.css";
import { FaReply, FaRegSmile, FaTrash } from "react-icons/fa";



const MessageItem = ({message,openImageModal,user}) => {
    console.log(message)
    const messageRef = useRef(null); // ref để tham chiếu tới tin nhắn

    //check nó là link gg map
      const isGoogleMapsLink = text => {
        return /^https:\/\/www\.google\.com\/maps\?q=/.test(text);
      };
    
      //check nó là link 
      const isLink = (text) => {
        // Loại bỏ khoảng trắng đầu cuối
        const trimmedText = text.trim();
    
        // Biểu thức chính quy cho URL, hỗ trợ query string lồng nhau
        const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=:+]*)*$|^[\w-]+:\/\/[\w-./?%&=:+]*$/i;
    
        return urlPattern.test(trimmedText);
      };
      //tách link và non link
      const renderStyledMessage = (text) => {
        const parts = text.split(/(https?:\/\/[^\s]+)/g); // Tách link và non-link
    
        return parts.map((part, index) => {
          if (isLink(part)) {
            return (
              <a
                key={index}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className={`linkStyle ${message.sender._id === user._id ? 'currentUserTextLink' : ''}`}
              >
                {part}
              </a>
            );
          }
          return <span key={index}>{part}</span>;
        });
      };
  return (
    <div
    key={message._id}
    className={`${styles.message} ${message.sender._id === user._id
      ? styles.me
      : styles.other
      }`}
  >
    {message.sender._id !== user._id && (
      <img
        src={
          message.sender.avatar ||
          "https://images2.thanhnien.vn/528068263637045248/2025/3/28/viruss-17431943994281777502076.jpg"
        }
        alt="Profile"
        className={styles.avatar}
      />
    )}
    {message.sender._id === user._id && (
    <div className={styles.actionIcons}>
        <span onClick={() => console("thu hồi tin nhắn")}><FaReply /></span>
        <span onClick={() => console("thu hồi tin nhắn")}><FaRegSmile /></span>
        <span onClick={() => console("thu hồi tin nhắn")}><FaTrash /></span>
    </div>
    )}
    <div className={styles.messageContent}>
      <div
        ref={messageRef}
        className={`messageWrapper ${message.sender._id === user._id ? "currentUserMessage" : ""
          }`}
      >
        {/* Hiển thị tin nhắn trả lời nếu có */}
        {/* {message.ID_message_reply &&
          message._destroy === false && (
            <div className="replyContainer">
              <p className="replyText">
                {message.ID_message_reply.content ||
                  "Tin nhắn không tồn tại"}
              </p>
            </div>
          )} */}

        {/* Nội dung chính */}
        {message._destroy === true ? (
          <p className="messageTextThuHoi">
            Tin nhắn đã được thu hồi
          </p>
        ) : message.type === "text" ? (
          isGoogleMapsLink(message.content) ? (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "200px",
                  height: "120px",
                  borderRadius: "10px",
                  backgroundColor: "#ccc",
                  marginBottom: "5px",
                }}
              >
                <p style={{ paddingTop: "45px" }}>
                  Google Maps Preview
                </p>
              </div>
              {/* <button
                // onClick={() =>
                //   handlePressLocation(message.content)
                // }
                style={{
                  backgroundColor: "#2196F3",
                  color: "#fff",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Mở Google Maps
              </button> */}
            </div>
          ) : isLink(message.content) ? (
            <a
              href={message.content}
              target="_blank"
              rel="noopener noreferrer"
              className={`messageTextIsLink ${message.sender._id === user._id ? "currentUserTextLink" : ""
                }`}
            >
              {message.content}
            </a>
          ) : (
            <p
              className={`messageText ${message.sender._id === user._id ? "currentUserText" : ""
                }`}
            >
              {renderStyledMessage(message.content)}
            </p>
          )
        ) : message.type === "image" ? (
          <img
            src={message.content}
            alt="image"
            className="messageImage"
            style={{
              maxWidth: "100%",
              maxHeight: "200px",
              borderRadius: "10px",
            }}
            onClick={() => { openImageModal(message.content) }}
          />
        ) : message.type === "video" ? (
          <video
            src={message.content}
            controls
            className={`messageVideo ${message.sender._id === user._id ? "currentUserText" : ""
              }`}
            style={{
              maxWidth: "100%",
              maxHeight: "200px",
              borderRadius: "10px",
            }}
            onClick={() => { openImageModal(message.content) }}
          />
        ) : null}

        {/* Thời gian gửi */}
        <p className={message.sender._id !== user._id ? styles.messageTime : styles.messageTimeMe}>
          {new Date(message.createdAt).toLocaleTimeString()}
        </p>
      </div>
    </div>
    {message.sender._id !== user._id && (
    <div className={styles.actionIcons}>
        <span onClick={() => console("thu hồi tin nhắn")}><FaReply /></span>
        <span onClick={() => console("thu hồi tin nhắn")}><FaRegSmile /></span>
        <span onClick={() => console("thu hồi tin nhắn")}><FaTrash /></span>
    </div>
    )}
  </div>
  );
}

export default MessageItem
