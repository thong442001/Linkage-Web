import React from "react";
import styles from "../../styles/components/items/ChatS.module.css";

const Groupcomponent = React.memo(({ item, ID_me, onSelect, isSelected }) => {
    //console.log("Rendering Groupcomponent with item:", item);

    // Tính toán name và avatar trực tiếp
    let name = null;
    let avatar = null;

    if (item.isPrivate == true) {
        const otherUser = item.members.find((user) => user._id !== ID_me);
        if (otherUser) {
            avatar = otherUser.avatar;
        } else {
            console.log("⚠️ Không tìm thấy thành viên khác trong nhóm!");
        }

        if (item.name == null) {
            if (otherUser) {
                name = otherUser.first_name + " " + otherUser.last_name;
            } else {
                console.log("⚠️ Không tìm thấy thành viên khác trong nhóm!");
            }
        } else {
            name = item.name;
        }
    } else {
        if (item.avatar == null) {
            avatar =
                "https://firebasestorage.googleapis.com/v0/b/hamstore-5c2f9.appspot.com/o/Anlene%2Flogo.png?alt=media&token=f98a4e03-1a8e-4a78-8d0e-c952b7cf94b4";
        } else {
            avatar = item.avatar;
        }
        if (item.name == null) {
            const names = item.members
                .filter((user) => user._id !== ID_me)
                .map((user) => `${user.first_name} ${user.last_name}`)
                .join(", ");
            name = names;
        } else {
            name = item.name;
        }
    }

    const formatTime = (timestamp) => {
        if (!timestamp) return "";

        const date = new Date(timestamp);
        return date.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    };

    return (
        <div
            className={`${styles.groupItem} ${isSelected ? styles.groupItemActive : ""}`}
            onClick={onSelect}
        >
            {name && (
                <img src={avatar} alt="Profile" className={styles.groupAvatar} />
            )}

            <div className={styles.chatInfo}>
                {avatar && (
                    <div className={styles.chatName}>
                        <p>{name}</p>
                    </div>
                )}

                {item.messageLatest && (
                    <div className={styles.chatcontent}>
                        <div>
                            {(ID_me !== item.messageLatest.sender.ID_user
                                ? `${item.messageLatest.sender.first_name} ${item.messageLatest.sender.last_name}`
                                : "Bạn") +
                                ": " +
                                (item.messageLatest.content.length > 20
                                    ? item.messageLatest.content.slice(0, 30) + "..."
                                    : item.messageLatest.content)}
                        </div>
                        <div className={styles.chatTime}>
                            {formatTime(item.messageLatest.createdAt)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

export default Groupcomponent;