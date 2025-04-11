import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useSelector } from 'react-redux';

// Tạo context để chia sẻ socket và danh sách người dùng online
const SocketContext = createContext(null);

// Hook tùy chỉnh để sử dụng socket trong các component khác
export const useSocket = () => useContext(SocketContext);

// Provider để bao bọc ứng dụng và quản lý socket
export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const user = useSelector(state => state.app.user);

    // Khởi tạo socket khi user thay đổi
    useEffect(() => {
        if (!user || !user._id) return; // Chỉ khởi tạo khi có user

        console.log("🔄 Khởi tạo socket...");
        const newSocket = io(
            // 'http://192.168.1.20:3001', // Dùng cho local testing
            'https://linkage.id.vn', // URL server production
            {
                transports: ['websocket'], // Chỉ sử dụng WebSocket, không polling
                reconnection: true, // Tự động thử kết nối lại
                reconnectionAttempts: 10, // Số lần thử kết nối lại
                reconnectionDelay: 3000, // Thời gian chờ giữa các lần thử (ms)
                reconnectionDelayMax: 10000, // Thời gian chờ tối đa (ms)
                timeout: 10000, // Thời gian timeout kết nối (ms)
                autoConnect: true, // Tự động kết nối khi khởi tạo
                forceNew: false, // Không buộc tạo kết nối mới
                withCredentials: true, // Gửi credentials (cookies, auth)
                upgrade: true, // Nâng cấp kết nối từ polling lên WebSocket
            }
        );

        setSocket(newSocket);

        // Lắng nghe sự kiện "online_users" từ server
        newSocket.on("online_users", (userList) => {
            console.log("🟢 Danh sách user online:", userList);
            setOnlineUsers([...userList]); // Tạo mảng mới để trigger re-render
        });

        // Cleanup khi component unmount hoặc user thay đổi
        return () => {
            newSocket.off("online_users"); // Hủy lắng nghe sự kiện
            newSocket.disconnect(); // Ngắt kết nối socket
        };
    }, [user]);

    // Gửi sự kiện "user_online" khi socket kết nối
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

        // Cleanup khi socket hoặc user thay đổi
        return () => {
            socket.off("connect"); // Hủy lắng nghe sự kiện connect
        };
    }, [socket, user]);

    // Xử lý khi user logout hoặc không còn user
    useEffect(() => {
        if (!socket) return;

        if (!user || !user._id) {
            console.log("📴 User logout, gửi sự kiện user_offline...");
            socket.emit("user_offline");

            setTimeout(() => {
                console.log("📴 Disconnecting socket...");
                socket.disconnect();
                setSocket(null);
            }, 500); // Đợi 500ms để đảm bảo server nhận sự kiện
        }
    }, [user, socket]);

    // Cung cấp socket và danh sách onlineUsers cho các component con
    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};