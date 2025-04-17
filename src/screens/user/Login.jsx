// src/components/Login.js
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginWeb } from "../../rtk/API";
import { QRCodeCanvas } from "qrcode.react"; // Đã thay đổi từ QRCode sang QRCodeCanvas
import { loginQR } from "../../rtk/Reducer";
import { io } from "socket.io-client";
import styles from "../../styles/screens/user/LoginS.module.css"; // Đường dẫn đến file CSS
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
  const [loiMatKhau, setLoiMatKhau] = useState("");
  const [hienThiQR, setHienThiQR] = useState(false);
  const [qrToken, setQrToken] = useState(""); // State để lưu token cho QR

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Kết nối tới server
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
            token: data.token || "", // Backend cần gửi token
            refreshToken: data.refreshToken || "", // Backend cần gửi refreshToken
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

  // Tạo token mới mỗi khi modal QR được mở
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
      setLoiMatKhau("Vui lòng nhập mật khẩu.");
      hopLe = false;
    } else if (!kiemTraMatKhauHopLe(matKhau)) {
      setLoiMatKhau("Mật khẩu phải có ít nhất 6 ký tự.");
      hopLe = false;
    } else {
      setLoiMatKhau("");
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
        setLoiMatKhau(error);
      });
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
          width: "300px",
        }}
      >
        <h1
          style={{
            color: "#1e90ff",
            fontSize: "36px",
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
        <input
          type="text" // Đổi từ "email" sang "text" vì chấp nhận cả email và số điện thoại
          value={emailHoacDienThoai}
          onChange={(e) => setEmailHoacDienThoai(e.target.value)}
          placeholder="Email hoặc số điện thoại"
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
            border: "1px solid #d9d9d9",
            borderRadius: "5px",
            fontSize: "14px",
            backgroundColor: "#f5faff",
          }}
        />
        {loiEmailDienThoai && (
          <p style={{ color: "red", fontWeight: "400" }}>{loiEmailDienThoai}</p>
        )}
        <input
          type="password"
          value={matKhau}
          onChange={(e) => setMatKhau(e.target.value)}
          placeholder="Mật khẩu"
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "20px",
            border: "1px solid #d9d9d9",
            borderRadius: "5px",
            fontSize: "14px",
            backgroundColor: "#f5faff",
          }}
        />
        {loiMatKhau && (
          <p style={{ color: "red", fontWeight: "400" }}>{loiMatKhau}</p>
        )}
        <p
          style={{
            margin: "10px 0",
            fontSize: "14px",
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
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#1478d1")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#1e90ff")}
        >
          Đăng Nhập
        </button>
        {messageLogin && (
          <p style={{ color: "red", marginTop: "10px", fontSize: "14px" }}>
            {messageLogin}
          </p>
        )}
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
