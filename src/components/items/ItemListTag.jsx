import React from 'react';

const ItemListTag = (props) => {
    const { data } = props;

    return (
        <div style={styles.container}>
            <img
                style={styles.avatar}
                src={data.avatar}
                alt={`${data.first_name} ${data.last_name}`}
            />
            <span style={styles.text}>
                {data.first_name} {data.last_name}
            </span>
        </div>
    );
};

export default ItemListTag;

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: '20px',
        paddingRight: '20px',
        borderBottomWidth: '0.7px',
        borderBottomStyle: 'solid',
        borderBottomColor: '#ECEAEA',
        paddingTop: '10px',
        paddingBottom: '10px',
    },
    avatar: {
        width: '70px',
        height: '70px',
        borderRadius: '50%',
        marginRight: '10px',
    },
    text: {
        fontSize: '15px',
        fontWeight: 'bold',
        color: 'black',
    },
};