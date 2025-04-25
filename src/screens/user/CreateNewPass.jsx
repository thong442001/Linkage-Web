import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { quenMatKhau_gmail } from "../../rtk/API";
import { IconButton, InputAdornment } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const CreateNewPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { gmail } = location.state || {};

  const [passwordNew, setPasswordNew] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({ passwordNew: "", confirmPassword: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPasswordNew, setShowPasswordNew] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Hàm validate mật khẩu mới
  const validatePasswordNew = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!password.trim()) {
      return "Vui lòng nhập mật khẩu mới.";
    }
    if (password.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự.";
    }
    if (!/[A-Za-z]/.test(password)) {
      return "Mật khẩu phải chứa ít nhất một chữ cái.";
    }
    if (!/\d/.test(password)) {
      return "Mật khẩu phải chứa ít nhất một số.";
    }
    if (/[^A-Za-z\d]/.test(password)) {
      return "Mật khẩu không được chứa ký tự đặc biệt.";
    }
    return "";
  };

  // Hàm validate xác nhận mật khẩu
  const validateConfirmPassword = (confirm, password) => {
    if (!confirm.trim()) {
      return "Vui lòng nhập xác nhận mật khẩu.";
    }
    if (confirm !== password) {
      return "Mật khẩu xác nhận không khớp.";
    }
    return "";
  };

  // Validate khi người dùng nhập
  const handlePasswordNewChange = (e) => {
    const text = e.target.value;
    setPasswordNew(text);
    const error = validatePasswordNew(text);
    setErrors((prev) => ({ ...prev, passwordNew: error }));
  };

  const handleConfirmPasswordChange = (e) => {
    const text = e.target.value;
    setConfirmPassword(text);
    const error = validateConfirmPassword(text, passwordNew);
    setErrors((prev) => ({ ...prev, confirmPassword: error }));
  };

  const handleCreatePassword = async () => {
    const passwordNewError = validatePasswordNew(passwordNew);
    const confirmPasswordError = validateConfirmPassword(confirmPassword, passwordNew);

    if (passwordNewError || confirmPasswordError) {
      setErrors({
        passwordNew: passwordNewError,
        confirmPassword: confirmPasswordError,
      });
      return;
    }

    setErrors({ passwordNew: "", confirmPassword: "" });
    setIsLoading(true);
    try {
      console.log("Sending payload:", { gmail, passwordNew });
      const response = await dispatch(quenMatKhau_gmail({ gmail, passwordNew })).unwrap();
      console.log("Response từ quenMatKhau_gmail:", response);

      if (response.status) {
        setIsLoading(false);
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          navigate("/");
        }, 2000);
      } else {
        setIsLoading(false);
        setErrors({ passwordNew: "", confirmPassword: response.message || "Đổi mật khẩu thất bại. Vui lòng thử lại." });
      }
    } catch (error) {
      setIsLoading(false);
      console.log("Lỗi khi đổi mật khẩu:", error);
      setErrors({ passwordNew: "", confirmPassword: error.message || "Có lỗi xảy ra. Vui lòng thử lại sau." });
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
          .inputContainer {
            position: relative;
            margin-bottom: 10px;
          }
          .input {
            width: 100%;
            padding: 12px;
            border: 1px solid #ccd0d5;
            border-radius: 5px;
            font-size: 15px;
            outline: none;
          }
          .inputError {
            width: 100%;
            padding: 12px;
            border: 1px solid red;
            border-radius: 5px;
            font-size: 15px;
            outline: none;
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
            margin-bottom: 5px;
            line-height: 1.2;
            display: flex;
            align-items: center;
            gap: 5px;
          }
          .errorIcon {
            font-size: 14px;
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
          .modalText {
            font-size: 16px;
            margin-bottom: 10px;
            color: #333;
          }
        `}
      </style>
      <div className="container">
        <form className="form">
          <div className="header">
            <div style={{ display: "flex", alignItems: "center" }}>
              {/* <button
                type="button"
                className="backButton"
                onClick={() => navigate("/check-email")}
                disabled={isLoading}
              >
                ←
              </button> */}
              <h1 className="logo">Linkage</h1>
            </div>
            <h2 className="title">Tạo mật khẩu mới</h2>
            <p className="subtitle">
              Mật khẩu phải có ít nhất 6 ký tự, gồm chữ cái và số, không chứa ký tự đặc biệt.
            </p>
          </div>
          <div className="inputContainer">
            <input
              type={showPasswordNew ? "text" : "password"}
              placeholder="Mật khẩu mới"
              className={errors.passwordNew ? "inputError" : "input"}
              value={passwordNew}
              onChange={handlePasswordNewChange}
              disabled={isLoading}
              autoComplete="new-password"
            />
            <InputAdornment position="end" style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)" }}>
              <IconButton
                onClick={() => setShowPasswordNew(!showPasswordNew)}
                edge="end"
                disabled={isLoading}
              >
                {showPasswordNew ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          </div>
          {errors.passwordNew && (
            <p className="errorText">
              <span className="errorIcon">⚠</span>
              {errors.passwordNew}
            </p>
          )}
          <div className="inputContainer">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Xác nhận mật khẩu"
              className={errors.confirmPassword ? "inputError" : "input"}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              disabled={isLoading}
              autoComplete="new-password"
            />
            <InputAdornment position="end" style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)" }}>
              <IconButton
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                edge="end"
                disabled={isLoading}
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          </div>
          {errors.confirmPassword && (
            <p className="errorText">
              <span className="errorIcon">⚠</span>
              {errors.confirmPassword}
            </p>
          )}
          <button
            type="button"
            className="submitButton"
            onClick={handleCreatePassword}
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
              <p className="modalText">Đổi mật khẩu thành công!</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CreateNewPassword;