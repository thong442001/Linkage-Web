// src/components/Login.js
import React from 'react';
import { logout } from '../../rtk/Reducer'; // Import actions
import { useDispatch } from 'react-redux';
const Home = () => {
    const dispatch = useDispatch();
    const handleLogout = () => {
        dispatch(logout());
    };
    return (
        <div>
            <h1>Home</h1>
            <button
                onClick={handleLogout}
                style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#1e90ff', // Màu xanh dương cho nút
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s',
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = '#1478d1')} // Hiệu ứng hover
                onMouseOut={(e) => (e.target.style.backgroundColor = '#1e90ff')}
            >
                Log Out
            </button>
        </div>
    );
};

export default Home;