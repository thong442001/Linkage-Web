import React, { useState, useEffect } from 'react';
import '../../styles/screens/chat/ChatS.css'; // Import file CSS
const Groupcomponent = ({ item, ID_me, onSelect, isSelected }) => {

    const [name, setName] = useState(null);
    const [avatar, setAvatar] = useState(null);

    useEffect(() => {
        if (item.isPrivate == true) {
            const otherUser = item.members.find(user => user._id !== ID_me);
            if (otherUser) {
                setAvatar(otherUser.avatar);
            } else {
                console.log("⚠️ Không tìm thấy thành viên khác trong nhóm!");
            }

            if (item.name == null) {
                if (otherUser) {
                    //setName(otherUser.displayName);
                    setName((otherUser.first_name + " " + otherUser.last_name));
                } else {
                    console.log("⚠️ Không tìm thấy thành viên khác trong nhóm!");
                }
            } else {
                setName(item.name);
            }
        } else {
            if (item.avatar == null) {
                setAvatar('https://firebasestorage.googleapis.com/v0/b/hamstore-5c2f9.appspot.com/o/Anlene%2Flogo.png?alt=media&token=f98a4e03-1a8e-4a78-8d0e-c952b7cf94b4');
            } else {
                setAvatar(item.avatar);
            }
            if (item.name == null) {
                const names = item.members
                    .filter(user => user._id !== ID_me)
                    .map(user => `${user.first_name} ${user.last_name}`)
                    .join(", ");
                // Cập nhật state một lần duy nhất
                setName(names);
            } else {
                setName(item.name);
            }
        }

    }, []);

    const formatTime = (timestamp) => {
        if (!timestamp) return '';

        const date = new Date(timestamp);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false, // Hiển thị 24h (Bỏ dòng này nếu muốn 12h)
        });
    };

    return (
        <div
            className={`group-item ${isSelected ? 'active' : ''}`}
            onClick={onSelect}
        >
            {
                (name !== null)
                && <img src={avatar} alt="Profile" className='avatar' />
            }

            <div className="chat-info">
                {
                    (avatar !== null)
                    && <div className="chat-name">
                        <p
                        //style={styles.name}
                        // numberOfLines={1} // Số dòng tối đa
                        // ellipsizeMode="tail" // Cách hiển thị dấu 3 chấm (tail: ở cuối)
                        >{name}</p>
                    </div>
                }
                {/* <div >{chat.name}</div> */}
                {/* <div className="last-message">{item.messageLatest.content}</div> */}
                {/* tin nhắn mới nhất */}
                {
                    item.messageLatest != null
                    && (
                        <div
                        //style={styles.vMessageNew}
                        >
                            {/* name */}
                            {
                                ID_me != item.messageLatest.sender.ID_user
                                    ? <div
                                    //style={styles.messageName}
                                    >
                                        {item.messageLatest.sender.first_name} {item.messageLatest.sender.last_name}: </div>
                                    : <div
                                    //style={styles.messageName}
                                    >
                                        Bạn: </div>
                            }
                            {/* content */}
                            <div
                                //style={styles.messageContent}
                                numberOfLines={1}
                            >{item.messageLatest.content}</div>
                            {/* thời gian */}
                            <div
                            //style={styles.messageNewTime}
                            >{formatTime(item.messageLatest.createdAt)}</div>
                        </div>
                    )
                }
            </div>
        </div >
    );
};

export default Groupcomponent;