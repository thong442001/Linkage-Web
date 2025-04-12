import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useSelector } from 'react-redux';

const SocketContext = createContext(null);
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const user = useSelector(state => state.app.user);

    useEffect(() => {
        if (!user || !user._id) return; // Chỉ khởi tạo khi có user

        console.log("🔄 Khởi tạo socket...");
        const newSocket = io(
            //'http://192.168.1.20:3001',
            'https://linkage.id.vn',
            {
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: 10,
                reconnectionDelay: 3000,
                reconnectionDelayMax: 10000,
                timeout: 10000,
                autoConnect: true,
                forceNew: false,
                withCredentials: true,
                upgrade: true,
            });

        setSocket(newSocket);

        newSocket.on("online_users", (userList) => {
            console.log("🟢 Danh sách user online:", userList);
            setOnlineUsers([...userList]); // Tạo mảng mới để re-render
        });

        return () => {
            newSocket.off("online_users");
            newSocket.disconnect();
        };
    }, [user]); // Chạy lại khi user thay đổi


    useEffect(() => {
        if (!socket || !user || !user._id) return;

        if (socket.connected) {
            console.log("📡 Gửi sự kiện user_online:", user._id);
            socket.emit("user_online", user._id);
        } else {
            socket.on("connect", () => {
                console.log("✅ Socket connected, gửi lại user_online:", user._id);
                socket.emit("user_online", user._id);
            });
        }

        return () => {
            socket.off("connect");
        };
    }, [socket, user]);


    useEffect(() => {
        if (!socket) return;

        if (!user || !user._id) {
            console.log("📴 User logout, gửi sự kiện user_offline...");
            socket.emit("user_offline");

            setTimeout(() => {
                console.log("📴 Disconnecting socket...");
                socket.disconnect();
                setSocket(null);
            }, 500); // Đợi 1 giây để đảm bảo server nhận được
        }
    }, [user, socket]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};