import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllGroupOfUser } from "../../rtk/API";
import { FaCaretDown, FaPenSquare } from "react-icons/fa";
import Groupcomponent from "../../components/items/Groupcomponent";
import CreateGroupModal from "../../components/dialogs/CreateGroupModal";
import styles from "../../styles/components/dialogs/HomeChatModal.module.css";
import { useNavigate } from 'react-router-dom';
const HomeChatModal = ({ onClose, onSelectGroup }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, token } = useSelector((state) => state.app);
    const [groups, setGroups] = useState([]);
    const [filteredGroups, setFilteredGroups] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [isModalCreate, setIsModalCreate] = useState(false);

    const modalRef = useRef(null);

    // Thêm logic "click ra ngoài"
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [onClose]);

    // Chuẩn hóa text để tìm kiếm
    const normalizeText = (text) =>
        text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D");

    // Lọc nhóm theo tìm kiếm
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

    // Lấy danh sách nhóm
    useEffect(() => {
        const callGetAllGroupOfUser = async (ID_user) => {
            try {
                const response = await dispatch(
                    getAllGroupOfUser({ ID_user, token })
                ).unwrap();
                setGroups(response.groups || []);
                setSelectedGroup(response.groups[0] || null);
            } catch (error) {
                console.log("Error:", error);
            }
        };
        callGetAllGroupOfUser(user._id);
    }, [user, dispatch, token]);

    // Xử lý chọn nhóm
    const handleSelectGroup = (group) => {
        setSelectedGroup(group);
        onSelectGroup(group);
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal} ref={modalRef}>
                <div className={styles.modalHeader}>
                    <h2>Đoạn chat</h2>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <button className={styles.closeButton}
                         onClick={() => {
                            navigate('/chat');
                        }}
                        >
                            <FaCaretDown className={styles.caretIcon} size={20} style={{ marginRight: 10 }} />
                        </button>
                        <button className={styles.closeButton} onClick={onClose}>
                            ×
                        </button>
                    </div>
                </div>
                <div className={styles.chatList}>
                    <div className={styles.chatListHeader}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm đoạn chat"
                            className={styles.searchBar}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onClick={(e) => e.stopPropagation()} // Ngăn sự kiện click lan truyền
                        />
                        {/* <button
                            className={styles.createGroupButton}
                            onClick={(e) => {
                                e.stopPropagation(); // Ngăn sự kiện lan truyền
                                setIsModalCreate(true);
                            }}
                        >
                            <FaPenSquare />
                        </button> */}
                    </div>
                    <div className={styles.groupList}>
                        {filteredGroups.map((item) => (
                            <Groupcomponent
                                key={item._id}
                                item={item}
                                ID_me={user._id}
                                onSelect={(e) => {
                                    e.stopPropagation(); // Ngăn sự kiện lan truyền
                                    handleSelectGroup(item);
                                }}
                                isSelected={selectedGroup && selectedGroup._id === item._id}
                            />
                        ))}
                    </div>
                </div>
                {isModalCreate && (
                    <CreateGroupModal onClose={() => setIsModalCreate(false)} />
                )}
            </div>
        </div>
    );
};

export default HomeChatModal;