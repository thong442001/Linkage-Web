import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { checkOTP_phone, checkOTP_gmail, register } from '../../rtk/API';

const VerifyOTP = () => {
    const [otp, setOtp] = useState('');
    const [errorOtp, setErrorOtp] = useState('');
    const [successVisible, setSuccessVisible] = useState(false);
    const [failedVisible, setFailedVisible] = useState(false);
    const [failedMessage, setFailedMessage] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { userData, emailOrPhone } = location.state || {};

    const kiemTraEmailHopLe = (email) => {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    };

    const kiemTraDienThoaiHopLe = (phone) => {
        return /^(84|0[3|5|7|8|9])[0-9]{8}$/.test(phone);
    };

    const handleVerifyOTP = async () => {
        if (!otp.trim()) {
            setErrorOtp('Vui lòng nhập mã OTP.');
            return;
        }
        if (otp.length !== 4 || !/^\d{4}$/.test(otp)) {
            setErrorOtp('Mã OTP phải là 4 chữ số.');
            return;
        }

        try {
            let otpResponse;
            if (kiemTraEmailHopLe(emailOrPhone)) {
                otpResponse = await dispatch(checkOTP_gmail({ gmail: emailOrPhone, otp })).unwrap();
            } else if (kiemTraDienThoaiHopLe(emailOrPhone)) {
                otpResponse = await dispatch(checkOTP_phone({ phone: emailOrPhone, otp })).unwrap();
            }

            if (otpResponse.status) {
                // OTP hợp lệ, tiến hành đăng ký
                const registerResponse = await dispatch(register(userData)).unwrap();
                console.log('registerResponse:', registerResponse); // Kiểm tra phản hồi

                // Kiểm tra phản hồi: chuỗi "Đăng kí thành công" hoặc object với status/success
                const isSuccess =
                    typeof registerResponse === 'string' && registerResponse.includes('thành công') ||
                    (typeof registerResponse === 'object' && (
                        registerResponse.status === true ||
                        registerResponse.success === true ||
                        (registerResponse.data && !registerResponse.error)
                    ));

                if (isSuccess) {
                    setSuccessVisible(true);
                    setTimeout(() => {
                        setSuccessVisible(false);
                        navigate('/');
                    }, 2000);
                } else {
                    throw new Error(
                        typeof registerResponse === 'string'
                            ? registerResponse
                            : registerResponse.message || registerResponse.error || 'Đăng ký thất bại.'
                    );
                }
            } else {
                throw new Error(otpResponse.message || 'Mã OTP không hợp lệ.');
            }
        } catch (error) {
            console.error('Error in handleVerifyOTP:', error); // Log lỗi chi tiết
            setErrorOtp('');
            setFailedMessage(error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
            setFailedVisible(true);
            setTimeout(() => setFailedVisible(false), 2000);
        }
    };

    const handleOtpChange = (e) => {
        const value = e.target.value;
        // Chỉ cho phép nhập số
        if (/^\d*$/.test(value) && value.length <= 4) {
            setOtp(value);
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
                    .form {
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        width: 100%;
                        max-width: 400px;
                        text-align: center;
                    }
                    .header {
                        margin-bottom: 20px;
                    }
                    .logo {
                        font-size: 40px;
                        font-weight: 700;
                        color: #1877f2;
                        margin-bottom: 10px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
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
                    .boldText {
                        font-weight: bold;
                        color: #1c1e21;
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
                    .submitButton:hover {
                        background-color: #009100;
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
                        justify-content: center;
                        align-items: center;
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
                <div className="form">
                    <div className="header">
                        <h1 className="logo">Linkage</h1>
                        <h2 className="title">Xác thực OTP</h2>
                        <p className="subtitle">
                            Vui lòng nhập mã OTP gồm 4 số được gửi đến <span className="boldText">{emailOrPhone}</span>
                        </p>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <input
                            type="text"
                            placeholder="Nhập mã OTP"
                            className={errorOtp ? "inputError" : "input"}
                            value={otp}
                            onChange={handleOtpChange}
                            maxLength="4"
                            inputMode="numeric"
                        />
                        {errorOtp && <p className="errorText">{errorOtp}</p>}
                    </div>
                    <button
                        type="button"
                        className="submitButton"
                        onClick={handleVerifyOTP}
                    >
                        Xác thực
                    </button>
                </div>
                {successVisible && (
                    <div className="modal">
                        <div className="modalContent modalSuccess">
                            <p className="modalText">Tạo tài khoản thành công!</p>
                        </div>
                    </div>
                )}
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

export default VerifyOTP;