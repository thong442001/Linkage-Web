import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMessagesGroup } from "../../rtk/API";
import { useSocket } from "../../context/socketContext";
import styles from "../../styles/components/dialogs/ChatModal.module.css";
import axios from 'axios';
import { FaImage, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import MessageItem from "../../components/items/MessageItem";
import { useNavigate } from 'react-router-dom';
const ChatModal = ({ group, onClose }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, token } = useSelector((state) => state.app);
    const { socket } = useSocket();
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [reply, setReply] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isImageModalVisible, setImageModalVisible] = useState(false);
    const [sendingFiles, setSendingFiles] = useState({});
    const [isExpanded, setIsExpanded] = useState(true);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Tự động cuộn xuống tin nhắn mới nhất
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Tham gia nhóm chat và lấy tin nhắn cũ
    useEffect(() => {
        if (!socket || !group) return;

        socket.emit("joinGroup", group._id);
        getMessagesOld(group._id);

        // Lắng nghe tin nhắn mới
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

        // Lắng nghe tin nhắn bị thu hồi
        socket.on("message_revoked", (data) => {
            setMessages((prevMessages) =>
                prevMessages?.map((msg) =>
                    msg._id === data.ID_message ? { ...msg, _destroy: true } : msg
                )
            );
        });

        // Lắng nghe biểu cảm tin nhắn
        socket.on("receive_message_reation", (data) => {
            setMessages((prevMessages) =>
                prevMessages?.map((msg) => {
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
                        return { ...msg, message_reactionList: updatedReactions };
                    }
                    return msg;
                })
            );
        });

        return () => {
            socket.off("receive_message");
            socket.off("message_revoked");
            socket.off("receive_message_reation");
        };
    }, [socket, group]);

    // Lấy tin nhắn cũ
    const getMessagesOld = async (ID_group) => {
        try {
            const response = await dispatch(
                getMessagesGroup({ ID_group, token })
            ).unwrap();
            setMessages(response.messages || []);
        } catch (error) {
            console.log("Error fetching messages:", error);
        }
    };

    // Upload file lên Cloudinary
    const uploadFile = async (file) => {
        const tempId = Date.now().toString();
        setSendingFiles((prev) => ({ ...prev, [tempId]: true }));

        setMessages((prev) => [
            {
                _id: tempId,
                ID_group: group._id,
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
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            const fileUrl = response.data.secure_url;
            sendMessage(file.type.startsWith('image/') ? 'image' : 'video', fileUrl);

            setSendingFiles((prev) => {
                const newState = { ...prev };
                delete newState[tempId];
                return newState;
            });
        } catch (error) {
            console.log("Error uploading file:", error);
            setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
        }
    };

    // Mở file explorer
    const onOpenGallery = () => {
        fileInputRef.current.click();
    };

    // Xử lý chọn file
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            uploadFile(file);
            event.target.value = null;
        }
    };

    // Gửi tin nhắn
    const sendMessage = (type, content) => {
        if (!socket || !content || !group) return;

        const payload = {
            ID_group: group._id,
            sender: user._id,
            content,
            type,
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

    // Thu hồi tin nhắn
    const revokeMessage = (ID_message) => {
        if (!socket || !ID_message) return;
        const payload = {
            ID_message,
            ID_group: group._id,
        };
        socket.emit('revoke_message', payload);
    };

    // Thả biểu cảm tin nhắn
    const iconMessage = (ID_message, ID_reaction) => {
        if (!socket || !ID_message || !ID_reaction) return;
        const payload = {
            ID_group: group._id,
            ID_message,
            ID_user: user._id,
            ID_reaction,
        };
        socket.emit('send_message_reaction', payload);
    };

    // Xem ảnh lớn
    const openImageModal = (imageUrl) => {
        setSelectedImage(imageUrl);
        setImageModalVisible(true);
    };

    // Đóng modal ảnh
    const closeImageModal = () => {
        setImageModalVisible(false);
        setSelectedImage(null);
    };

    // Lấy đuôi file
    const getFileExtension = (url) => {
        try {
            const pathname = new URL(url).pathname;
            const parts = pathname.split('.');
            return parts.length > 1 ? parts.pop().toLowerCase() : null;
        } catch (error) {
            console.error("Invalid URL:", error);
            return null;
        }
    };

    // Tên nhóm chat
    const groupName = group.isPrivate
        ? `${group.members.find((m) => m._id !== user._id)?.first_name} ${group.members.find((m) => m._id !== user._id)?.last_name
        }`
        : group.name || group.members
            .filter((m) => m._id !== user._id)
            .map((m) => `${m.first_name} ${m.last_name}`)
            .join(", ");

    return (
        <div className={styles.chatModalOverlay}>
            <div className={`${styles.chatModal} ${isExpanded ? styles.expanded : styles.collapsed}`}>
                <div className={styles.chatModalHeader}>
                    <div className={styles.headerContent}>
                        <button
                            style={{ border: "none", background: "none", padding: 0, cursor: "pointer" }}
                            onClick={() => navigate(`/profile/${group.members.find((m) => m._id !== user._id)?._id}`)}
                        >
                            <img
                                src={
                                    group.isPrivate
                                        ? group.members.find((m) => m._id !== user._id)?.avatar ||
                                        "https://images2.thanhnien.vn/528068263637045248/2025/3/28/viruss-17431943994281777502076.jpg"
                                        : group.avatar ||
                                        "https://images2.thanhnien.vn/528068263637045248/2025/3/28/viruss-17431943994281777502076.jpg"
                                }
                                alt="Profile"
                                className={styles.avatar}
                            />
                        </button>
                        <div className={styles.chatHeaderInfo}>
                            <button
                                style={{ border: "none", background: "none", padding: 0, cursor: "pointer" }}
                                onClick={() => navigate(`/profile/${group.members.find((m) => m._id !== user._id)?._id}`)}
                            >
                                <h3>{groupName}</h3>
                            </button>
                        </div>
                    </div>
                    <div className={styles.headerActions}>
                        <button
                            className={styles.toggleButton}
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? <FaChevronDown /> : <FaChevronUp />}
                        </button>
                        <button className={styles.closeButton} onClick={onClose}>
                            ✕
                        </button>
                    </div>
                </div>
                {isExpanded && (
                    <>
                        <div className={styles.chatModalBody}>
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
                        {reply && (
                            <div className={styles.replyPreview}>
                                <div>
                                    <p className={styles.replyTitle}>Đang trả lời:</p>
                                    <p className={styles.replyContent}>
                                        {user._id === reply.sender._id
                                            ? 'Bạn: '
                                            : `${reply.sender.first_name} ${reply.sender.last_name}: `}
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
                        )}
                        <div className={styles.chatModalFooter}>
                            <input
                                type="file"
                                accept="image/*,video/*"
                                style={{ display: 'none' }}
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                            />
                            <FaImage
                                className={styles.attachIcon}
                                onClick={onOpenGallery}
                            />
                            <input
                                type="text"
                                placeholder="Nhập tin nhắn..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage('text', message);
                                    }
                                }}
                            />
                            <button onClick={() => sendMessage('text', message)}>
                                Gửi
                            </button>
                        </div>
                    </>
                )}
            </div>
            {isImageModalVisible && (
                <div className={styles.imageModal}>
                    <div className={styles.modalBackground} onClick={closeImageModal}></div>
                    {getFileExtension(selectedImage) === "mp4" ? (
                        <video
                            src={selectedImage}
                            className={styles.fullImage}
                            controls
                        />
                    ) : (
                        <img src={selectedImage} className={styles.fullImage} />
                    )}
                    <button className={styles.closeButtonFullImage} onClick={closeImageModal}>
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
};

export default ChatModal;