import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { sendOTP_quenMatKhau_gmail } from "../../rtk/API";

const FindWithEmail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [gmail, setGmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [failedVisible, setFailedVisible] = useState(false);
  const [failedMessage, setFailedMessage] = useState("");

  const handleCheckEmail = async () => {
    if (!gmail.trim()) {
      setError("Vui lòng nhập địa chỉ email.");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(gmail)) {
      setError("Địa chỉ email không hợp lệ.");
      return;
    }

    setError("");
    setIsLoading(true);
    try {
      console.log("Sending payload:", { gmail });
      const response = await dispatch(sendOTP_quenMatKhau_gmail({ gmail })).unwrap();
      console.log("Response từ sendOTP_quenMatKhau_gmail:", response);
      if (response.status) {
        navigate("/check-email", { state: { gmail } });
        setGmail("");
      } else {
        throw new Error(response.message || "Gửi OTP thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      setFailedMessage(error.message || "Có lỗi xảy ra, hãy chắc chắn email này đã được đăng ký.");
      setFailedVisible(true);
      setTimeout(() => setFailedVisible(false), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
          .container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background-color: #f0f2f5;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .header {
            justify-content: center;
            text-align: center;
            margin-bottom: 20px;
          }
          .logo {
            font-size: 40px;
            font-weight: 700;
            color: #1877f2;
            margin-bottom: 10px;
            text-align: center;
            width: 100%;
          }
          .title {
            font-size: 24px;
            font-weight: 600;
            color: #1c1e21;
          }
          .subtitle {
            font-size: 15px;
            color: #606770;
          }
          .form {
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
          }
          .input {
            width: 100%;
            padding: 12px;
            border: 1px solid #ccd0d5;
            border-radius: 5px;
            font-size: 15px;
            outline: none;
            margin-bottom: 2px;
          }
          .inputError {
            width: 100%;
            padding: 12px;
            border: 1px solid red;
            border-radius: 5px;
            font-size: 15px;
            outline: none;
            margin-bottom: 2px;
          }
          .input:focus {
            border-color: #1877f2;
          }
          .submitButton {
            width: 100%;
            padding: 12px;
            background-color: #00a400;
            color: #fff;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
          }
          .submitButton:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
          }
          .submitButton:hover:not(:disabled) {
            background-color: #009100;
          }
          .backButton {
            background: none;
            border: none;
            font-size: 20px;
            color: #606770;
            cursor: pointer;
            padding: 10px;
            margin-right: auto;
          }
          .errorText {
            color: red;
            font-size: 12px;
            margin: 0;
            margin-bottom: 5px;
            line-height: 1.2;
          }
          .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }
          .modalContent {
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            max-width: 300px;
            width: 100%;
          }
          .modalFailed {
            background-color: #f3e7e7;
          }
          .modalText {
            font-size: 16px;
            margin-bottom: 10px;
            color: #333;
          }
          .link {
            text-align: center;
            margin-top: 15px;
            font-size: 14px;
            color: #1877f2;
            text-decoration: none;
            cursor: pointer;
          }
          .link:hover {
            text-decoration: underline;
          }
        `}
      </style>
      <div className="container">
        <form className="form">
          <div className="header">
            <div style={{ display: "flex", alignItems: "center" }}>

              <h1 className="logo">Linkage</h1>
            </div>
            <h2 className="title">Tìm tài khoản</h2>
            <p className="subtitle">Nhập địa chỉ email của bạn</p>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <input
              type="text"
              placeholder="Email"
              className={error ? "inputError" : "input"}
              value={gmail}
              onChange={(e) => {
                setGmail(e.target.value);
                setError("");
              }}
              disabled={isLoading}
            />
            {error && <p className="errorText">{error}</p>}
          </div>
          <button
            type="button"
            className="submitButton"
            onClick={handleCheckEmail}
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : "Tiếp tục"}
          </button>
          <p className="link"
           onClick={() => navigate("/find-with-phone")}
           >
            Tìm bằng số điện thoại
          </p>
          <p className="link"
           onClick={() => navigate("/")}
           >
            Bạn đã có tài khoản? Đăng nhập
          </p>
        </form>
        {failedVisible && (
          <div className="modal">
            <div className="modalContent modalFailed">
              <p className="modalText">{failedMessage}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FindWithEmail;