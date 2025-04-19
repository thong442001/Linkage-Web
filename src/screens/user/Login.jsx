import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginWeb } from "../../rtk/API";
import { QRCodeCanvas } from "qrcode.react";
import { loginQR } from "../../rtk/Reducer";
import { io } from "socket.io-client";
import styles from "../../styles/screens/user/LoginS.module.css";
import {
    TextField,
    IconButton,
    InputAdornment,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// Hàm tạo token ngẫu nhiên
const taoTokenNgauNhien = (doDai = 16) => {
    const kyTu = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";
    for (let i = 0; i < doDai; i++) {
        token += kyTu.charAt(Math.floor(Math.random() * kyTu.length));
    }
    return token;
};

const DangNhap = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { messageLogin } = useSelector((state) => state.app);

    const [emailHoacDienThoai, setEmailHoacDienThoai] = useState("");
    const [matKhau, setMatKhau] = useState("");
    const [loiEmailDienThoai, setLoiEmailDienThoai] = useState("");
    const [errorPassword, setErrorPassword] = useState('');
    const [hienThiQR, setHienThiQR] = useState(false);
    const [qrToken, setQrToken] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io("https://linkage.id.vn", {
            transports: ["websocket"],
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
        if (qrToken) {
            newSocket.emit("join_login_QR", qrToken);
            console.log(`📡 Tham gia phòng QR: ${qrToken}`);
        }

        newSocket.on("lang_nghe_login_QR", (data) => {
            console.log("📨 Nhận lang_nghe_login_QR:", data);
            if (data.user) {
                dispatch(
                    loginQR({
                        user: data.user,
                        token: data.token || "",
                        refreshToken: data.refreshToken || "",
                    })
                );
            } else {
                console.log("Lỗi lang_nghe_login_QR: user ko có");
            }
        });

        return () => {
            newSocket.off("lang_nghe_login_QR");
        };
    }, [qrToken]);

    useEffect(() => {
        if (hienThiQR) {
            setQrToken(taoTokenNgauNhien());
        }
    }, [hienThiQR]);

    function kiemTraEmailHopLe(email) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    }

    function kiemTraDienThoaiHopLe(phone) {
        return /^(84|0[3|5|7|8|9])[0-9]{8}$/.test(phone);
    }

    function kiemTraMatKhauHopLe(password) {
        return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password);
    }

    const kiemTraForm = () => {
        let hopLe = true;
        if (!emailHoacDienThoai.trim()) {
            setLoiEmailDienThoai("Vui lòng nhập số điện thoại hoặc email.");
            hopLe = false;
        } else if (
            !kiemTraEmailHopLe(emailHoacDienThoai) &&
            !kiemTraDienThoaiHopLe(emailHoacDienThoai)
        ) {
            setLoiEmailDienThoai("Email hoặc số điện thoại không hợp lệ.");
            hopLe = false;
        } else {
            setLoiEmailDienThoai("");
        }

        if (!matKhau.trim()) {
            setErrorPassword("Vui lòng nhập mật khẩu.");
            hopLe = false;
        } else if (!kiemTraMatKhauHopLe(matKhau)) {
            setErrorPassword("Mật khẩu phải có ít nhất 6 ký tự.");
            hopLe = false;
        } else {
            setErrorPassword("");
        }
        return hopLe;
    };

    const kiemTraDangNhap = () => {
        if (!kiemTraForm()) return;

        const duLieu = kiemTraEmailHopLe(emailHoacDienThoai)
            ? { email: emailHoacDienThoai, phone: "", password: matKhau }
            : { email: "", phone: emailHoacDienThoai, password: matKhau };

        thucHienDangNhap(duLieu);
    };

    const thucHienDangNhap = (duLieu) => {
        dispatch(loginWeb(duLieu))
            .unwrap()
            .then((phanHoi) => {
                // navigate('/');
            })
            .catch((error) => {
                setErrorPassword(error);
            });
    };

    const handleNavigateToRegister = () => {
        navigate('/register');
    };

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                backgroundColor: "#f0f2f5",
            }}
        >
            <div
                style={{
                    backgroundColor: "white",
                    padding: "30px",
                    borderRadius: "10px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    textAlign: "center",
                    width: "400px",
                }}
            >
                <h1
                    style={{
                        color: "#1e90ff",
                        fontSize: "38px",
                        margin: "0",
                    }}
                >
                    Linkage
                </h1>
                <p
                    style={{
                        color: "black",
                        fontSize: "16px",
                        margin: "5px 0 20px 0",
                    }}
                >
                    {/* Ứng dụng web */}
                </p>
                <TextField
                    label="Email hoặc số điện thoại"
                    type={'text'}
                    fullWidth
                    margin="normal"
                    value={emailHoacDienThoai}
                    onChange={(e) => setEmailHoacDienThoai(e.target.value)}
                    error={!!loiEmailDienThoai}
                    helperText={loiEmailDienThoai}
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Mật khẩu"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    margin="normal"
                    value={matKhau}
                    onChange={(e) => setMatKhau(e.target.value)}
                    error={!!errorPassword}
                    helperText={errorPassword}
                    sx={{ mb: 2 }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => setShowPassword(!showPassword)}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <p
                    style={{
                        margin: "10px 0",
                        fontSize: "16px",
                        color: "#555",
                        cursor: "pointer",
                    }}
                    onClick={() => setHienThiQR(true)}
                >
                    Đăng nhập bằng mã QR
                </p>
                <button
                    onClick={kiemTraDangNhap}
                    style={{
                        width: "100%",
                        padding: "10px",
                        backgroundColor: "#1e90ff",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        fontSize: "18px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        transition: "background-color 0.3s",
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = "#1478d1")}
                    onMouseOut={(e) => (e.target.style.backgroundColor = "#1e90ff")}
                >
                    Đăng Nhập
                </button>
                <p style={{ margin: "10px 0", fontSize: "14px", color: "#555" }}>
                    Hoặc
                </p>
                <button
                    onClick={handleNavigateToRegister}
                    style={{
                        width: "100%",
                        padding: "10px",
                        backgroundColor: "#00a400",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        fontSize: "18px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        transition: "background-color 0.3s",
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = "#009100")}
                    onMouseOut={(e) => (e.target.style.backgroundColor = "#00a400")}
                >
                    Đăng Ký
                </button>
            </div>
            {hienThiQR && (
                <div className={styles.modalContainer}>
                    <div className={styles.modalContent}>
                        <h1 style={{ color: "#1e90ff", margin: 0 }}>Linkage</h1>
                        <h3 className={styles.modalTitle}>Quét mã QR để đăng nhập</h3>
                        <QRCodeCanvas value={`chatapp://login/${qrToken}`} size={180} />
                        <p style={{ fontSize: "14px", color: "#555" }}>
                            Token: {qrToken} <br />
                            1. Mở ứng dụng Linkage trên điện thoại của bạn.
                            <br />
                            2. Chọn "Quét mã QR". <br />
                            3. Quét mã QR này để đăng nhập. <br />
                        </p>
                        <button
                            onClick={() => setHienThiQR(false)}
                            className={styles.closeButton}
                        >
                            <span className={styles.closeButtonText}>Đóng</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DangNhap;