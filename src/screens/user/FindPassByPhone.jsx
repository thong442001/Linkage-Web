import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { sendOTP_dangKi_phone } from "../../rtk/API"; // Ensure this is the correct API

const FindWithPhone = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFailed, setIsFailed] = useState(false);

  const handleCheckPhone = async () => {
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      setError("Vui lòng nhập số điện thoại.");
      return;
    }

    const phoneRegex = /^(?:\+84|84|0)(3[2-9]|5[5-9]|7[0|6-9]|8[1-9]|9[0-4|6-9])\d{7}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      setError("Số điện thoại không hợp lệ.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      console.log("Sending OTP for phone:", { phone: trimmedPhone });
      const otpResponse = await dispatch(sendOTP_dangKi_phone({ phone: trimmedPhone })).unwrap();
      console.log("Response từ sendOTP_dangKi_phone:", otpResponse);

      if (otpResponse.status) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          navigate("/check-phone", { state: { phone: trimmedPhone } });
        }, 2000);
      } else {
        throw new Error(otpResponse.message || "Gửi OTP thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
      setIsFailed(true);
      setTimeout(() => setIsFailed(false), 2000);
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
            margin-bottom: 10px;
          }
          .form {
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
            text-align: center;
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
          .backButton:disabled {
            color: #cccccc;
            cursor: not-allowed;
          }
          .input {
            width: 100%;
            padding: 12px;
            border: 1px solid #ccd0d5;
            border-radius: 5px;
            font-size: 15px;
            outline: none;
            margin-bottom: 2px;
            color: #606770;
          }
          .inputError {
            width: 100%;
            padding: 12px;
            border: 1px solid red;
            border-radius: 5px;
            font-size: 15px;
            outline: none;
            margin-bottom: 2px;
            color: #606770;
          }
          .input:disabled {
            background-color: #f0f0f0;
            cursor: not-allowed;
          }
          .input:focus {
            border-color: #1877f2;
          }
          .errorText {
            color: red;
            font-size: 12px;
            margin: 0;
            margin-bottom: 10px;
            line-height: 1.2;
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
            margin-bottom: 10px;
            margin-top: 10px;
          }
          .submitButton:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
          }
          .submitButton:hover:not(:disabled) {
            background-color: #009100;
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
          .modalSuccess {
            background-color: #e7f3e7;
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
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleCheckPhone();
          }}
        >
          <div className="header">
            <div style={{ display: "flex", alignItems: "center" }}>
              <h1 className="logo">Linkage</h1>
            </div>
            <h2 className="title">Tìm tài khoản</h2>
            <p className="subtitle">Nhập số di động đã đăng ký của bạn.</p>
          </div>
          <input
            type="text"
            placeholder="Nhập số điện thoại"
            className={error ? "inputError" : "input"}
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value.replace(/\s/g, ""));
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCheckPhone();
                e.preventDefault();
              }
            }}
            disabled={isLoading}
          />
          {error && <p className="errorText">{error}</p>}
          <button
            type="button"
            className="submitButton"
            onClick={handleCheckPhone}
            disabled={isLoading}
          >
            Tiếp tục
          </button>
          <p className="link"
            onClick={() => navigate("/find-with-email")}
          >
            Tìm bằng email
          </p>
          <p className="link"
            onClick={() => navigate("/")}
          >
            Bạn đã có tài khoản? Đăng nhập
          </p>
        </form>
        {isLoading && (
          <div className="modal">
            <div className="modalContent">
              <p className="modalText">Đang xử lý...</p>
            </div>
          </div>
        )}
        {isSuccess && (
          <div className="modal">
            <div className="modalContent modalSuccess">
              <p className="modalText">Mã OTP đã được gửi!</p>
            </div>
          </div>
        )}
        {isFailed && (
          <div className="modal">
            <div className="modalContent modalFailed">
              <p className="modalText">{error || "Đã xảy ra lỗi!"}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FindWithPhone;