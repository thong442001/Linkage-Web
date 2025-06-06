import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "../../styles/screens/chat/ChatS.module.css";
import { FaReply, FaRegSmile, FaTrash } from "react-icons/fa";
import ReactionModal from "../dialogs/ReactionModal";

const MessageItem = ({
  message,
  openImageModal,
  user,
  onReply,
  onRevoke,
  onIcon,
}) => {
  const messageRef = useRef(null); // ref để tham chiếu tới tin nhắn
  const reactions = useSelector((state) => state.app.reactions);
  const [showReactionList, setShowReactionList] = useState(false);
  const popupRef = useRef(null); // tạo ref cho popup
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReactions, setSelectedReactions] = useState([]);
  const handleOpenModal = () => {
    setSelectedReactions(message.message_reactionList);
    setModalOpen(true);
  };
  console.log(message);
  //hàm kiểm tra đuôi file
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
  // hàm thu hồi tin nhắn
  const handleonRevoke = () => {
    console.log("tin nhắn đã xóa", message._id);
    setShowReactionList(false);
    onRevoke(message._id); // Thu hồi tin nhắn
  };
  // hàm trả lời tin nhắn
  const handleonReply = () => {
    console.log("tin nhắn đã chọn", message);
    setShowReactionList(false);
    onReply(message);
  };
  // hàm thả raction
  const handleonIcon = (ID_reaction, ID_message) => {
    console.log("Bạn đã chọn reaction:", ID_reaction, ID_message);
    setShowReactionList(false);
    onIcon(ID_message, ID_reaction);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowReactionList(false);
      }
    };

    const handleScroll = () => {
      setShowReactionList(false);
    };

    if (showReactionList) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [showReactionList]);

  const toggleReactionList = () => {
    setShowReactionList((prev) => !prev);
  };

  //check nó là link gg map
  const isGoogleMapsLink = (text) => {
    return /^https:\/\/www\.google\.com\/maps\?q=/.test(text);
  };

  //check nó là link
  const isLink = (text) => {
    // Loại bỏ khoảng trắng đầu cuối
    const trimmedText = text.trim();

    // Biểu thức chính quy cho URL, hỗ trợ query string lồng nhau
    const urlPattern =
      /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=:+]*)*$|^[\w-]+:\/\/[\w-./?%&=:+]*$/i;

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
            className={`linkStyle ${
              message.sender._id === user._id ? "currentUserTextLink" : ""
            }`}
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
      className={`${styles.message} ${
        message.sender._id === user._id ? styles.me : styles.other
      }`}
    >
      {message.sender._id !== user._id && (
        <img
          src={
            message.sender.avatar ||
            "https://i.pinimg.com/736x/75/11/c5/7511c5289164c5644782b76e9d122f20.jpg"
          }
          alt="Profile"
          className={styles.avatar}
        />
      )}
      {message.sender._id === user._id && (
        <div>
          {!showReactionList && (
            <div className={styles.actionIcons}>
              <span onClick={handleonReply}>
                <FaReply />
              </span>
              <span onClick={toggleReactionList}>
                <FaRegSmile />
              </span>
              <span onClick={handleonRevoke}>
                <FaTrash />
              </span>
            </div>
          )}

          {showReactionList && (
            <div ref={popupRef} className={styles.reactionList}>
              {reactions.map((reaction) => (
                <span
                  key={reaction._id}
                  className={styles.reactionItem}
                  onClick={() => handleonIcon(reaction._id, message._id)}
                >
                  {reaction.icon}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      <div className={styles.messageContent}>
        <div
          ref={messageRef}
          className={`messageWrapper ${
            message.sender._id === user._id ? "currentUserMessage" : ""
          }`}
        >
          {/* Hiển thị tin nhắn trả lời nếu có */}
          {message.ID_message_reply && message._destroy === false && (
            <div className={styles.replyContainer}>
              <p className={styles.replyText}>
                {isGoogleMapsLink(message.ID_message_reply.content) ? (
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        height: "120px",
                        borderRadius: "10px",
                        marginBottom: "5px",
                      }}
                    >
                      <p style={{ paddingTop: "45px" }}>Chia sẻ vị trí</p>
                    </div>
                    <a
                    style={{
                      color: "black",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                    href={message.ID_message_reply.content} target="_blank" rel="noopener noreferrer"
                    >
                       {message.ID_message_reply.content.length > 20
                        ? message.ID_message_reply.content.slice(0, 15) + "..."
                        : message.ID_message_reply.content}
                  </a>
                  </div>
                ) : getFileExtension(message.ID_message_reply.content) == 'jpg' ? (
                  <img
                  src={message.ID_message_reply.content}
                  alt="image"
                  className="messageImage"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    borderRadius: "10px",
                  }}
                  onClick={() => {
                    openImageModal(message.ID_message_reply.content);
                  }}
                />
                ): getFileExtension(message.ID_message_reply?.content)  === 'mp4' ? (
                  <video
                    src={message.ID_message_reply.content}
                    controls
                    className={`messageVideo ${
                      message.sender._id === user._id ? "currentUserText" : ""
                    }`}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "200px",
                      borderRadius: "10px",
                    }}
                    onClick={() => {
                      openImageModal(message.ID_message_reply.content);
                    }}
                  />
                ):(
                  <div>
                    {message.ID_message_reply.content ||
                      "Tin nhắn không tồn tại"}
                  </div>
                )}
              </p>
            </div>
          )}

          {/* Nội dung chính */}
          {message._destroy === true ? (
            <p className="messageTextThuHoi">Tin nhắn đã được thu hồi</p>
          ) : message.type === "text" ? (
            isGoogleMapsLink(message.content) ? (
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    height: "120px",
                    borderRadius: "10px",
                    marginBottom: "5px",
                  }}
                >
                  <p style={{ paddingTop: "45px" }}>Chia sẻ vị trí</p>
                </div>
                <a
                    style={{
                      color: "white",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                    href={message.content} target="_blank" rel="noopener noreferrer"
                    >
                       {message.content.length > 20
                        ? message.content.slice(0, 15) + "..."
                        : message.content}
                  </a>
              </div>
            ) : isLink(message.content) ? (
              <a
                href={message.content}
                target="_blank"
                rel="noopener noreferrer"
                className={`messageTextIsLink ${
                  message.sender._id === user._id ? "currentUserTextLink" : ""
                }`}
              >
                {message.content}
              </a>
            ) : (
              <p
                className={`messageText ${
                  message.sender._id === user._id ? "currentUserText" : ""
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
              onClick={() => {
                openImageModal(message.content);
              }}
            />
          ) : message.type === "video" ? (
            <video
              src={message.content}
              controls
              className={`messageVideo ${
                message.sender._id === user._id ? "currentUserText" : ""
              }`}
              style={{
                maxWidth: "100%",
                maxHeight: "200px",
                borderRadius: "10px",
              }}
              onClick={() => {
                openImageModal(message.content);
              }}
            />
          ) : null}

          {/* Thời gian gửi */}
          <p
            className={
              message.sender._id !== user._id
                ? styles.messageTime
                : styles.messageTimeMe
            }
          >
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <div style={{ display: "flex", flexDirection: "row" }}>
            {message?.message_reactionList.map((reaction, index) => (
              <div
                key={index}
                className={styles.reaction_button}
                onClick={handleOpenModal}
              >
                <span className={styles.reaction_text}>
                  {reaction.ID_reaction.icon} {reaction.quantity}
                </span>
              </div>
            ))}
          </div>
          {modalOpen && (
            <ReactionModal
              onClose={() => setModalOpen(false)}
              reactions={selectedReactions}
            />
          )}
        </div>
      </div>
      {message.sender._id !== user._id && (
        <div>
          {!showReactionList && (
            <div className={styles.actionIcons}>
              <span onClick={handleonReply}>
                <FaReply />
              </span>
              <span onClick={toggleReactionList}>
                <FaRegSmile />
              </span>
            </div>
          )}
          {showReactionList && (
            <div ref={popupRef} className={styles.reactionList}>
              {reactions.map((reaction) => (
                <span
                  key={reaction._id}
                  className={styles.reactionItem}
                  onClick={() => handleonIcon(reaction._id, message._id)}
                >
                  {reaction.icon}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageItem;