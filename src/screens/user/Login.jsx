// src/components/Login.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginWeb } from '../../rtk/API'; // Import actions

const Login = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, messageLogin } = useSelector((state) => state.app);

    const [emailVsPhone, setEmailVsPhone] = useState('');
    const [password, setPassword] = useState('');
    const [errorEmailPhone, setErrorEmailPhone] = useState('');
    const [errorPassword, setErrorPassword] = useState('');

    // // Chuyển hướng nếu người dùng đã đăng nhập
    // useEffect(() => {
    //     if (user) {
    //         navigate('/home'); // Chuyển hướng đến trang Home nếu đã đăng nhập
    //     } else {
    //         navigate('/login');
    //     }
    // }, [user, navigate]);

    function isValidEmail(email) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    }

    function isValidPhone(phone) {
        return /^(84|0[3|5|7|8|9])[0-9]{8}$/.test(phone);
    }

    function isValidPassword(password) {
        return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password);
    }

    const validateForm = () => {
        let isValid = true;
        if (!emailVsPhone.trim()) {
            setErrorEmailPhone('Vui lòng nhập số điện thoại hoặc email.');
            isValid = false;
        } else if (!isValidEmail(emailVsPhone) && !isValidPhone(emailVsPhone)) {
            setErrorEmailPhone('Email hoặc số điện thoại không hợp lệ.');
            isValid = false;
        } else {
            setErrorEmailPhone('');
        }

        if (!password.trim()) {
            setErrorPassword('Vui lòng nhập mật khẩu.');
            isValid = false;
        } else if (!isValidPassword(password)) {
            setErrorPassword('Mật khẩu phải có ít nhất 6 ký tự.');
            isValid = false;
        } else {
            setErrorPassword('');
        }
        return isValid;
    };

    const checkLogin = () => {
        if (!validateForm()) return;

        const data = isValidEmail(emailVsPhone)
            ? { email: emailVsPhone, phone: '', password: password }
            : { email: '', phone: emailVsPhone, password: password };

        onLogin(data);
    };

    const onLogin = (data) => {

        dispatch(loginWeb(data))
            .unwrap()
            .then((response) => {
                //console.log(response);
                //console.log("fcmToken login: " + fcmToken);
                // setLoading(false);
                //navigate('/home');
            })
            .catch((error) => {
                // setErrorPassword(error);
                // setLoading(false);
            });
    };



    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: '#f0f2f5', // Màu nền xám nhạt giống trong hình
            }}
        >
            <div
                style={{
                    backgroundColor: 'white',
                    padding: '30px',
                    borderRadius: '10px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Đổ bóng nhẹ
                    textAlign: 'center',
                    width: '300px',
                }}
            >
                <h1
                    style={{
                        color: '#1e90ff', // Màu xanh dương đậm cho "Linkage"
                        fontSize: '36px',
                        margin: '0',
                    }}
                >
                    Linkage
                </h1>
                <p
                    style={{
                        color: 'black',
                        fontSize: '16px',
                        margin: '5px 0 20px 0',
                    }}
                >
                    {/* Web clied */}
                </p>
                <input
                    type="email"
                    value={emailVsPhone}
                    onChange={(e) => setEmailVsPhone(e.target.value)}
                    placeholder="Email or phone"
                    style={{
                        width: '100%',
                        padding: '10px',
                        marginBottom: '15px',
                        border: '1px solid #d9d9d9',
                        borderRadius: '5px',
                        fontSize: '14px',
                        backgroundColor: '#f5faff', // Màu nền nhạt cho input
                    }}
                />
                {errorEmailPhone ? <p
                    style={{
                        color: 'red',
                        fontWeight: '400',
                    }}
                >{errorEmailPhone}</p> : null}
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    style={{
                        width: '100%',
                        padding: '10px',
                        marginBottom: '20px',
                        border: '1px solid #d9d9d9',
                        borderRadius: '5px',
                        fontSize: '14px',
                        backgroundColor: '#f5faff', // Màu nền nhạt cho input
                    }}
                />
                {errorPassword ? <p
                    style={{
                        color: 'red',
                        fontWeight: '400',
                    }}
                >{errorPassword}</p> : null}
                <button
                    onClick={checkLogin}
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#1e90ff', // Màu xanh dương cho nút
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s',
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = '#1478d1')} // Hiệu ứng hover
                    onMouseOut={(e) => (e.target.style.backgroundColor = '#1e90ff')}
                >
                    Log IN
                </button>
                {messageLogin && (
                    <p style={{ color: 'red', marginTop: '10px', fontSize: '14px' }}>
                        {messageLogin}
                    </p>
                )}
            </div>
        </div>
    );
};

export default Login;