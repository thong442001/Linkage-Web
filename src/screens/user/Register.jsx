import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { checkPhone, checkEmail, sendOTP_dangKi_phone, sendOTP_dangKi_gmail } from '../../rtk/API';

const Register = () => {
    const [ho, setHo] = useState('');
    const [ten, setTen] = useState('');
    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [matKhau, setMatKhau] = useState('');
    const [ngay, setNgay] = useState('');
    const [thang, setThang] = useState('');
    const [nam, setNam] = useState('');
    const [gioiTinh, setGioiTinh] = useState('Nữ');

    const [errorHo, setErrorHo] = useState('');
    const [errorTen, setErrorTen] = useState('');
    const [errorEmailOrPhone, setErrorEmailOrPhone] = useState('');
    const [errorMatKhau, setErrorMatKhau] = useState('');
    const [errorDate, setErrorDate] = useState('');
    const [errorGioiTinh, setErrorGioiTinh] = useState('');

    const [failedVisible, setFailedVisible] = useState(false);
    const [failedMessage, setFailedMessage] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const validateName = (name) => {
        const regex = /^[A-Za-zÀ-Ỹà-ỹ\s]+$/;
        return regex.test(name);
    };

    function kiemTraEmailHopLe(email) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    }

    function kiemTraDienThoaiHopLe(phone) {
        return /^(84|0[3|5|7|8|9])[0-9]{8}$/.test(phone);
    }

    function kiemTraMatKhauHopLe(password) {
        return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password);
    }

    const validateDateOfBirth = () => {
        if (!ngay || !thang || !nam) {
            setErrorDate('Vui lòng chọn ngày sinh.');
            return false;
        }

        const monthMap = {
            "Tháng 1": 1, "Tháng 2": 2, "Tháng 3": 3, "Tháng 4": 4, "Tháng 5": 5, "Tháng 6": 6,
            "Tháng 7": 7, "Tháng 8": 8, "Tháng 9": 9, "Tháng 10": 10, "Tháng 11": 11, "Tháng 12": 12
        };
        const thangSo = monthMap[thang];

        const birthDate = new Date(nam, thangSo - 1, ngay);
        const today = new Date('2025-04-18');

        if (birthDate > today) {
            setErrorDate('Ngày sinh không được trong tương lai.');
            return false;
        }

        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();

        if (age < 12 || (age === 12 && monthDiff < 0) || (age === 12 && monthDiff === 0 && dayDiff < 0)) {
            setErrorDate('Bạn phải từ 12 tuổi trở lên.');
            return false;
        }

        setErrorDate('');
        return true;
    };

    const checkEmailOrPhone = async () => {
        if (!emailOrPhone.trim()) {
            setErrorEmailOrPhone('Vui lòng nhập số điện thoại hoặc email.');
            return false;
        }

        if (!kiemTraEmailHopLe(emailOrPhone) && !kiemTraDienThoaiHopLe(emailOrPhone)) {
            setErrorEmailOrPhone('Email hoặc số điện thoại không hợp lệ.');
            return false;
        }

        try {
            let response;
            if (kiemTraEmailHopLe(emailOrPhone)) {
                // Sử dụng email chữ thường cho API
                response = await dispatch(checkEmail({ email: emailOrPhone.toLowerCase() })).unwrap();
            } else if (kiemTraDienThoaiHopLe(emailOrPhone)) {
                response = await dispatch(checkPhone({ phone: emailOrPhone })).unwrap();
            }

            if (!response || typeof response.status !== 'boolean') {
                setErrorEmailOrPhone('Phản hồi từ server không hợp lệ. Vui lòng thử lại.');
                return false;
            }

            if (!response.status) {
                setErrorEmailOrPhone(response.message || (kiemTraEmailHopLe(emailOrPhone) ? 'Email đã được sử dụng.' : 'Số điện thoại đã được sử dụng.'));
                return false;
            }

            setErrorEmailOrPhone('');
            return true;
        } catch (error) {
            setErrorEmailOrPhone(error.message || 'Lỗi kiểm tra email/số điện thoại. Vui lòng thử lại.');
            return false;
        }
    };

    const kiemTraForm = async () => {
        let hopLe = true;

        if (!ho.trim()) {
            setErrorHo('Vui lòng nhập họ.');
            hopLe = false;
        } else if (!validateName(ho)) {
            setErrorHo('Họ chỉ được chứa chữ cái.');
            hopLe = false;
        } else {
            setErrorHo('');
        }

        if (!ten.trim()) {
            setErrorTen('Vui lòng nhập tên.');
            hopLe = false;
        } else if (!validateName(ten)) {
            setErrorTen('Tên chỉ được chứa chữ cái.');
            hopLe = false;
        } else {
            setErrorTen('');
        }

        const totalLength = ho.trim().length + ten.trim().length;
        if (totalLength > 30) {
            setErrorHo('Tổng độ dài họ và tên không được vượt quá 30 ký tự.');
            setErrorTen('Tổng độ dài họ và tên không được vượt quá 30 ký tự.');
            hopLe = false;
        }

        if (!validateDateOfBirth()) {
            hopLe = false;
        }

        if (!gioiTinh) {
            setErrorGioiTinh('Vui lòng chọn giới tính.');
            hopLe = false;
        } else {
            setErrorGioiTinh('');
        }

        if (!(await checkEmailOrPhone())) {
            hopLe = false;
        }

        if (!matKhau.trim()) {
            setErrorMatKhau('Vui lòng nhập mật khẩu.');
            hopLe = false;
        } else if (!kiemTraMatKhauHopLe(matKhau)) {
            setErrorMatKhau('Mật khẩu phải có ít nhất 6 ký tự, bao gồm cả chữ và số.');
            hopLe = false;
        } else {
            setErrorMatKhau('');
        }

        return hopLe;
    };

    const handleRegister = async () => {
        if (await kiemTraForm()) {
            const monthMap = {
                "Tháng 1": "01", "Tháng 2": "02", "Tháng 3": "03", "Tháng 4": "04", "Tháng 5": "05", "Tháng 6": "06",
                "Tháng 7": "07", "Tháng 8": "08", "Tháng 9": "09", "Tháng 10": "10", "Tháng 11": "11", "Tháng 12": "12"
            };
            const dateOfBirth = `${nam}-${monthMap[thang]}-${ngay.padStart(2, '0')}`;
            const userData = {
                first_name: ten,
                last_name: ho,
                dateOfBirth,
                sex: gioiTinh,
                // Lưu email chữ thường vào userData
                email: kiemTraEmailHopLe(emailOrPhone) ? emailOrPhone.toLowerCase() : null,
                phone: kiemTraDienThoaiHopLe(emailOrPhone) ? emailOrPhone : null,
                password: matKhau
            };

            try {
                let otpResponse;
                if (kiemTraEmailHopLe(emailOrPhone)) {
                    // Gửi OTP với email chữ thường
                    otpResponse = await dispatch(sendOTP_dangKi_gmail({ gmail: emailOrPhone.toLowerCase() })).unwrap();
                } else if (kiemTraDienThoaiHopLe(emailOrPhone)) {
                    otpResponse = await dispatch(sendOTP_dangKi_phone({ phone: emailOrPhone })).unwrap();
                }

                if (otpResponse.status) {
                    navigate('/verify-otp', { state: { userData, emailOrPhone: kiemTraEmailHopLe(emailOrPhone) ? emailOrPhone.toLowerCase() : emailOrPhone } });
                } else {
                    throw new Error(otpResponse.message || 'Gửi OTP thất bại.');
                }
            } catch (error) {
                setFailedMessage(error.message || 'Gửi OTP thất bại. Vui lòng thử lại.');
                setFailedVisible(true);
                setTimeout(() => setFailedVisible(false), 2000);
            }
        }
    };

    const handleDateChange = (field, value) => {
        if (field === 'ngay') setNgay(value);
        if (field === 'thang') setThang(value);
        if (field === 'nam') setNam(value);

        if ((field === 'ngay' && thang && nam) || 
            (field === 'thang' && ngay && nam) || 
            (field === 'nam' && ngay && thang)) {
            const updatedNgay = field === 'ngay' ? value : ngay;
            const updatedThang = field === 'thang' ? value : thang;
            const updatedNam = field === 'nam' ? value : nam;

            const monthMap = {
                "Tháng 1": 1, "Tháng 2": 2, "Tháng 3": 3, "Tháng 4": 4, "Tháng 5": 5, "Tháng 6": 6,
                "Tháng 7": 7, "Tháng 8": 8, "Tháng 9": 9, "Tháng 10": 10, "Tháng 11": 11, "Tháng 12": 12
            };
            const thangSo = monthMap[updatedThang];
            const birthDate = new Date(updatedNam, thangSo - 1, updatedNgay);
            const today = new Date('2025-04-18');

            if (birthDate > today) {
                setErrorDate('Ngày sinh không được trong tương lai.');
                return;
            }

            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            const dayDiff = today.getDate() - birthDate.getDate();

            if (age < 12 || (age === 12 && monthDiff < 0) || (age === 12 && monthDiff === 0 && dayDiff < 0)) {
                setErrorDate('Bạn phải từ 12 tuổi trở lên.');
            } else {
                setErrorDate('');
            }
        } else {
            setErrorDate('Vui lòng chọn ngày sinh.');
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
                    .nameFields {
                        display: flex;
                        gap: 10px;
                        margin-bottom: 10px;
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
                    .dateFields {
                        display: flex;
                        gap: 10px;
                        margin-bottom: 10px;
                    }
                    .select {
                        flex: 1;
                        padding: 12px;
                        border: 1px solid #ccd0d5;
                        border-radius: 5px;
                        font-size: 15px;
                        background-color: #fff;
                        outline: none;
                        margin-bottom: 2px;
                    }
                    .selectError {
                        flex: 1;
                        padding: 12px;
                        border: 1px solid red;
                        border-radius: 5px;
                        font-size: 15px;
                        background-color: #fff;
                        outline: none;
                        margin-bottom: 2px;
                    }
                    .genderFields {
                        display: flex;
                        gap: 10px;
                        margin-bottom: 10px;
                    }
                    .genderFields label {
                        flex: 1;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 12px;
                        border: 1px solid #ccd0d5;
                        border-radius: 5px;
                        font-size: 15px;
                        cursor: pointer;
                    }
                    .genderError label {
                        flex: 1;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 12px;
                        border: 1px solid red;
                        border-radius: 5px;
                        font-size: 15px;
                        cursor: pointer;
                    }
                    .radio {
                        margin-right: 8px;
                    }
                    .text {
                        font-size: 12px;
                        color: #606770;
                        margin-bottom: 15px;
                        line-height: 1.4;
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
                    .loginLink {
                        text-align: center;
                        margin-top: 15px;
                        font-size: 14px;
                    }
                    .loginLink a {
                        color: #1877f2;
                        text-decoration: none;
                    }
                    .loginLink a:hover {
                        text-decoration: underline;
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
                `}
            </style>
            <div className="container">
                <form className="form">
                    <div className="header">
                        <h1 className="logo">Linkage</h1>
                        <h2 className="title">Tạo tài khoản mới</h2>
                        <p className="subtitle">Nhanh chóng và dễ dàng.</p>
                    </div>
                    <div className="nameFields">
                        <div style={{ width: '100%' }}>
                            <input
                                type="text"
                                placeholder="Họ"
                                className={errorHo ? "inputError" : "input"}
                                value={ho}
                                onChange={(e) => {
                                    setHo(e.target.value);
                                    const totalLength = e.target.value.trim().length + ten.trim().length;
                                    setErrorHo(
                                        !e.target.value.trim()
                                            ? 'Vui lòng nhập họ.'
                                            : !validateName(e.target.value)
                                                ? 'Họ chỉ được chứa chữ cái.'
                                                : totalLength > 30
                                                    ? 'Tổng độ dài họ và tên không được vượt quá 30 ký tự.'
                                                    : ''
                                    );
                                    setErrorTen(
                                        !ten.trim()
                                            ? 'Vui lòng nhập tên.'
                                            : !validateName(ten)
                                                ? 'Tên chỉ được chứa chữ cái.'
                                                : totalLength > 30
                                                    ? 'Tổng độ dài họ và tên không được vượt quá 30 ký tự.'
                                                    : ''
                                    );
                                }}
                            />
                            {errorHo && <p className="errorText">{errorHo}</p>}
                        </div>
                        <div style={{ width: '100%' }}>
                            <input
                                type="text"
                                placeholder="Tên"
                                className={errorTen ? "inputError" : "input"}
                                value={ten}
                                onChange={(e) => {
                                    setTen(e.target.value);
                                    const totalLength = ho.trim().length + e.target.value.trim().length;
                                    setErrorHo(
                                        !ho.trim()
                                            ? 'Vui lòng nhập họ.'
                                            : !validateName(ho)
                                                ? 'Họ chỉ được chứa chữ cái.'
                                                : totalLength > 30
                                                    ? 'Tổng độ dài họ và tên không được vượt quá 30 ký tự.'
                                                    : ''
                                    );
                                    setErrorTen(
                                        !e.target.value.trim()
                                            ? 'Vui lòng nhập tên.'
                                            : !validateName(e.target.value)
                                                ? 'Tên chỉ được chứa chữ cái.'
                                                : totalLength > 30
                                                    ? 'Tổng độ dài họ và tên không được vượt quá 30 ký tự.'
                                                    : ''
                                    );
                                }}
                            />
                            {errorTen && <p className="errorText">{errorTen}</p>}
                        </div>
                    </div>
                    <div className="dateFields">
                        <select
                            className={errorDate ? "selectError" : "select"}
                            value={ngay}
                            onChange={(e) => handleDateChange('ngay', e.target.value)}
                        >
                            <option value="">Ngày</option>
                            {[...Array(31)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                            ))}
                        </select>
                        <select
                            className={errorDate ? "selectError" : "select"}
                            value={thang}
                            onChange={(e) => handleDateChange('thang', e.target.value)}
                        >
                            <option value="">Tháng</option>
                            {["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"].map((month, i) => (
                                <option key={i + 1} value={month}>{month}</option>
                            ))}
                        </select>
                        <select
                            className={errorDate ? "selectError" : "select"}
                            value={nam}
                            onChange={(e) => handleDateChange('nam', e.target.value)}
                        >
                            <option value="">Năm</option>
                            {[...Array(100)].map((_, i) => {
                                const year = 2025 - i;
                                return <option key={year} value={year}>{year}</option>;
                            })}
                        </select>
                    </div>
                    {errorDate && <p className="errorText">{errorDate}</p>}
                    <div className={errorGioiTinh ? "genderError" : "genderFields"}>
                        <label>
                            <input
                                type="radio"
                                name="gender"
                                value="Nữ"
                                className="radio"
                                checked={gioiTinh === 'Nữ'}
                                onChange={(e) => setGioiTinh(e.target.value)}
                            />
                            Nữ
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="gender"
                                value="Nam"
                                className="radio"
                                checked={gioiTinh === 'Nam'}
                                onChange={(e) => setGioiTinh(e.target.value)}
                            />
                            Nam
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="gender"
                                value="Khác"
                                className="radio"
                                checked={gioiTinh === 'Khác'}
                                onChange={(e) => setGioiTinh(e.target.value)}
                            />
                            Tùy chỉnh
                        </label>
                    </div>
                    {errorGioiTinh && <p className="errorText">{errorGioiTinh}</p>}
                    <div style={{ marginBottom: '10px' }}>
                        <input
                            type="text"
                            placeholder="Số di động hoặc email"
                            className={errorEmailOrPhone ? "inputError" : "input"}
                            value={emailOrPhone}
                            onChange={(e) => setEmailOrPhone(e.target.value)}
                            onBlur={checkEmailOrPhone}
                        />
                        {errorEmailOrPhone && <p className="errorText">{errorEmailOrPhone}</p>}
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Mật khẩu mới"
                            className={errorMatKhau ? "inputError" : "input"}
                            value={matKhau}
                            onChange={(e) => setMatKhau(e.target.value)}
                        />
                        {errorMatKhau && <p className="errorText">{errorMatKhau}</p>}
                    </div>
                    <p className="text">
                        Những người đăng ký với chúng tôi có thể tải thông tin liên hệ của bạn lên Linkage.
                        Bạn có thể thay đổi đối tượng nhìn thấy bài đăng của bạn trong cài đặt.
                        <br></br>
                        <br></br>
                        Chính sách quyền riêng tư và Điều khoản chính sách của chúng tôi được áp dụng khi bạn sử dụng SMS hoặc email để xác nhận tài khoản của bạn.
                    </p>
                    <button
                        type="button"
                        className="submitButton"
                        onClick={handleRegister}
                    >
                        Đăng ký
                    </button>
                    <p className="loginLink">
                        <a href="/">Bạn đã có tài khoản?</a>
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

export default Register;