import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ItemListTag from '../../components/items/ItemListTag'; // Điều chỉnh đường dẫn nếu cần

const ListTag = ({ ListTag }) => {
    const navigate = useNavigate();
    const me = useSelector((state) => state.app.user);
    const filteredListTag = ListTag ? ListTag.filter((item) => item._id !== me._id) : [];

    return (
        <div style={styles.container}>
            <div style={styles.list}>
                {filteredListTag.length > 0 ? (
                    filteredListTag.map((item) => (
                        <div
                            key={item._id}
                            style={styles.listItem}
                            onClick={() => navigate(`/profile/${item._id}`)}
                        >
                            <ItemListTag data={item} />
                        </div>
                    ))
                ) : (
                    <span style={styles.emptyText}>Không có người được tag</span>
                )}
            </div>
        </div>
    );
};

export default ListTag;

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        padding: '10px 0',
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
    },
    listItem: {
        cursor: 'pointer',
    },
    emptyText: {
        fontSize: '14px',
        color: 'gray',
        textAlign: 'center',
        padding: '20px',
    },
};