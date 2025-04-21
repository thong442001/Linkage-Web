import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Button,
    IconButton,
    Box,
    Typography,
    CircularProgress,
    Snackbar,
    Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSelector, useDispatch } from 'react-redux';
import { editNameOfUser } from '../../rtk/API'; // Giả định đường dẫn giống React Native
const ChangeNameDialog = ({ open, onClose }) => {
    const dispatch = useDispatch();
    const me = useSelector((state) => state.app.user);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(false);
    const [successVisible, setSuccessVisible] = useState(false);
    const [failed, setFailed] = useState(false);
    const [showErrorFirstName, setShowErrorFirstName] = useState(false);
    const [showErrorLastName, setShowErrorLastName] = useState(false);
    const [errorMessageFirstName, setErrorMessageFirstName] = useState('');
    const [errorMessageLastName, setErrorMessageLastName] = useState('');

    // Hàm validate tên: chỉ kiểm tra ký tự hợp lệ
    const validateName = (name) => {
        const regex = /^[A-Za-zÀ-Ỹà-ỹ\s]+$/;
        return regex.test(name);
    };

    // Hàm kiểm tra và đặt thông báo lỗi
    const checkErrors = (firstNameVal, lastNameVal) => {
        const totalLength = firstNameVal.trim().length + lastNameVal.trim().length;

        // Kiểm tra lỗi cho first_name
        if (!firstNameVal.trim()) {
            setShowErrorFirstName(true);
            setErrorMessageFirstName('Vui lòng nhập tên');
        } else if (!validateName(firstNameVal)) {
            setShowErrorFirstName(true);
            setErrorMessageFirstName('Tên chỉ được chứa chữ cái, không chứa số hoặc ký tự đặc biệt');
        } else if (totalLength > 30) {
            setShowErrorFirstName(true);
            setErrorMessageFirstName('Tổng độ dài họ và tên không được vượt quá 30 ký tự');
        } else {
            setShowErrorFirstName(false);
            setErrorMessageFirstName('');
        }

        // Kiểm tra lỗi cho last_name
        if (!lastNameVal.trim()) {
            setShowErrorLastName(true);
            setErrorMessageLastName('Vui lòng nhập họ');
        } else if (!validateName(lastNameVal)) {
            setShowErrorLastName(true);
            setErrorMessageLastName('Họ chỉ được chứa chữ cái, không chứa số hoặc ký tự đặc biệt');
        } else if (totalLength > 30) {
            setShowErrorLastName(true);
            setErrorMessageLastName('Tổng độ dài họ và tên không được vượt quá 30 ký tự');
        } else {
            setShowErrorLastName(false);
            setErrorMessageLastName('');
        }
    };

    // Xử lý khi người dùng nhập tên hoặc họ
    const handleFirstNameChange = (text) => {
        setFirstName(text);
        checkErrors(text, lastName);
    };

    const handleLastNameChange = (text) => {
        setLastName(text);
        checkErrors(firstName, text);
    };

    // Hàm gửi yêu cầu đổi tên
    const onChangeNameUser = async () => {
        checkErrors(firstName, lastName);

        // Nếu có lỗi, không thực hiện đổi tên
        if (showErrorFirstName || showErrorLastName) {
            return;
        }

        setLoading(true);

        const data = { ID_user: me._id, first_name: firstName, last_name: lastName };

        setTimeout(() => {
            dispatch(editNameOfUser(data))
                .unwrap()
                .then(() => {
                    setSuccessVisible(true);
                    setTimeout(() => {
                        setSuccessVisible(false);
                        onClose();
                        window.location.reload(); // Reload trang
                    }, 2000);
                    setFirstName('');
                    setLastName('');
                })
                .catch((error) => {
                    console.error(error);
                    setFailed(true);
                    setTimeout(() => {
                        setFailed(false);
                    }, 2000);
                })
                .finally(() => {
                    setLoading(false);
                });
        }, 2000);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={onClose} sx={{ mr: 1 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    Thay đổi tên
                    <IconButton
                        aria-label="close"
                        onClick={onClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Tên hiện tại: {me.first_name} {me.last_name}
                </Typography>
                <TextField
                    label="Nhập tên mới"
                    fullWidth
                    margin="normal"
                    value={firstName}
                    onChange={(e) => handleFirstNameChange(e.target.value)}
                    error={showErrorFirstName}
                    helperText={showErrorFirstName ? errorMessageFirstName : ''}
                    sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            backgroundColor: '#FFFFFF',
                        },
                    }}
                />
                <TextField
                    label="Nhập họ mới"
                    fullWidth
                    margin="normal"
                    value={lastName}
                    onChange={(e) => handleLastNameChange(e.target.value)}
                    error={showErrorLastName}
                    helperText={showErrorLastName ? errorMessageLastName : ''}
                    sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            backgroundColor: '#FFFFFF',
                        },
                    }}
                />
                <Box sx={{ py: 1 }}>
                    <Typography sx={{ color: '#0064E0' }}>
                        Tên của bạn sẽ là: {firstName} {lastName}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    fullWidth
                    onClick={onChangeNameUser}
                    disabled={loading || !firstName.trim() || !lastName.trim() || showErrorFirstName || showErrorLastName}
                    sx={{
                        backgroundColor: loading || !firstName.trim() || !lastName.trim() || showErrorFirstName || showErrorLastName ? '#A0A0A0' : '#0064E0',
                        '&:hover': {
                            backgroundColor: loading || !firstName.trim() || !lastName.trim() || showErrorFirstName || showErrorLastName ? '#A0A0A0' : '#0050B3',
                        },
                        borderRadius: '40px',
                        padding: '12px',
                        fontSize: '16px',
                        fontWeight: '500',
                        textTransform: 'none',
                    }}
                    startIcon={loading && <CircularProgress size={20} color="inherit" />}
                >
                    {loading ? 'Đang xử lý...' : 'Đổi tên'}
                </Button>
                <Snackbar
                    open={successVisible}
                    autoHideDuration={2000}
                    onClose={() => setSuccessVisible(false)}
                >
                    <Alert severity="success" onClose={() => setSuccessVisible(false)}>
                        Cập nhật tên thành công!
                    </Alert>
                </Snackbar>
                <Snackbar
                    open={failed}
                    autoHideDuration={2000}
                    onClose={() => setFailed(false)}
                >
                    <Alert severity="error" onClose={() => setFailed(false)}>
                        Cập nhật tên thất bại!
                    </Alert>
                </Snackbar>
            </DialogContent>
        </Dialog>
    );
};

export default ChangeNameDialog;