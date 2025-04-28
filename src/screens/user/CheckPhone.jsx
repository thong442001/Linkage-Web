import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { checkOTP_phone, sendOTP_dangKi_phone } from "../../rtk/API";

const CheckPhone = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { phone } = location.state || {};

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSendSuccess, setIsSendSuccess] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  // Bộ đếm ngược cho nút "Lấy mã mới"
  useEffect(() => {
    let timer;
    if (resendCooldown > 0 && isResendDisabled) {
      timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown, isResendDisabled]);

  const handleOtpChange = (e) => {
    const value = e.target.value;
    // Chỉ cho phép nhập số, tối đa 4 ký tự
    if (/^\d*$/.test(value) && value.length <= 4) {
      setCode(value);
      setError("");
    }
  };

  const handleCheckOTP = async () => {
    if (!code.trim() || code.length !== 4) {
      setError("Vui lòng nhập đủ 4 số");
      return;
    }

    setError("");
    try {
      setIsLoading(true);
      const response = await dispatch(checkOTP_phone({ phone, otp: code })).unwrap();
      console.log("Response từ checkOTP_phone:", response);

      if (response.status) {
        setIsLoading(false);
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          navigate("/create-new-phone", { state: { phone } });
        }, 2000);
      } else {
        setIsLoading(false);
        setError(response.message || "Mã OTP không đúng. Vui lòng thử lại.");
        setCode("");
        setIsFailed(true);
        setTimeout(() => {
          setIsFailed(false);
        }, 2000);
      }
    } catch (error) {
      setIsLoading(false);
      console.log("Lỗi khi kiểm tra OTP:", error);
      setError(error.message || "Có lỗi xảy ra. Vui lòng thử lại sau.");
      setCode("");
      setIsFailed(true);
      setTimeout(() => {
        setIsFailed(false);
      }, 2000);
    }
  };

  const handleResendOTP = () => {
    if (isResendDisabled) return;

    setIsLoading(true);
    setError("");
    dispatch(sendOTP_dangKi_phone({ phone }))
      .unwrap()
      .then((response) => {
        if (response.status) {
          setIsSendSuccess(true);
          setTimeout(() => {
            setIsSendSuccess(false);
            setResendCooldown(30);
            setIsResendDisabled(true);
            setCode("");
          }, 2000);
        } else {
          setError(response.message || "Không thể gửi OTP mới");
          setIsFailed(true);
          setTimeout(() => {
            setIsFailed(false);
          }, 2000);
        }
      })
      .catch((error) => {
        console.log("Error resending OTP:", error);
        setError(error.message || "Không thể gửi OTP mới. Vui lòng thử lại.");
        setIsFailed(true);
        setTimeout(() => {
          setIsFailed(false);
        }, 2000);
      })
      .finally(() => {
        setIsLoading(false);
      });
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
          .boldText {
            font-weight: bold;
            color: #1877f2;
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
          .infoText {
            font-size: 14px;
            color: #606770;
            margin-bottom: 15px;
          }
          .resendLink {
            color: #1877f2;
            cursor: pointer;
            text-decoration: underline;
          }
          .resendLink:disabled {
            color: #a0a0a0;
            cursor: not-allowed;
            text-decoration: none;
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
        `}
      </style>
      <div className="container">
      <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault(); 
          }}
        >
          <div className="header">
            <div style={{ display: "flex", alignItems: "center" }}>
              {/* <button
                type="button"
                className="backButton"
                onClick={() => navigate("/find-with-phone")}
                disabled={isLoading}
              >
                ←
              </button> */}
              <h1 className="logo">Linkage</h1>
            </div>
            <h2 className="title">Kiểm tra số điện thoại</h2>
            <p className="subtitle">
              Chúng tôi đã gửi mã xác nhận gồm 4 số đến số điện thoại{" "}
              <span className="boldText">{phone}</span>. Nhập mã để đặt lại mật khẩu.
            </p>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <input
              type="text"
              placeholder="Nhập mã OTP"
              className={error ? "inputError" : "input"}
              value={code}
              onChange={handleOtpChange}
              onKeyDown={( e ) => {
                
                if (e.key === "Enter") {
                  handleCheckOTP();
                }
              }
            }
              maxLength="4"
              inputMode="numeric"
              disabled={isLoading}
            />
            {error && <p className="errorText">{error}</p>}
          </div>
          <p className="infoText">
            Có thể bạn cần chờ vài phút để nhận được mã.{" "}
            <span
              className={`resendLink ${isResendDisabled ? "disabled" : ""}`}
              onClick={handleResendOTP}
              style={{ pointerEvents: isResendDisabled ? "none" : "auto" }}
            >
              {isResendDisabled ? `Gửi lại sau ${resendCooldown}s` : "Lấy mã mới"}
            </span>
          </p>
          <button
            type="button"
            className="submitButton"
            onClick={handleCheckOTP}
            disabled={isLoading}
          >
            Tiếp tục
          </button>
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
              <p className="modalText">Xác thực OTP thành công!</p>
            </div>
          </div>
        )}
        {isSendSuccess && (
          <div className="modal">
            <div className="modalContent modalSuccess">
              <p className="modalText">Mã OTP đã được gửi lại!</p>
            </div>
          </div>
        )}
        {isFailed && (
          <div className="modal">
            <div className="modalContent modalFailed">
              <p className="modalText">{error || "Không thể gửi OTP mới!"}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CheckPhone;