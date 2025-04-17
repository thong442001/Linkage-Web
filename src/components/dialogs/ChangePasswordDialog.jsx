import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    TextField,
    Button,
    IconButton,
    Box,
    InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useSelector, useDispatch } from 'react-redux';
import { editPasswordOfUser } from '../../rtk/API';

const ChangePasswordDialog = ({ open, onClose }) => {

    const dispatch = useDispatch();
    const me = useSelector(state => state.app.user);

    const [passwordNew, setPasswordNew] = useState('');
    const [passwordOLd, setPasswordOld] = useState('');
    const [rePass, setRepass] = useState('');
    const [btnState, setBtnState] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successVisible, setSuccessVisible] = useState(false);
    const [failed, setFailed] = useState(false);

    const [errorOldPassword, setErrorOldPassword] = useState('');
    const [errorNewPassword, setErrorNewPassword] = useState('');
    const [errorRePass, setErrorRePass] = useState('');

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showRePassword, setShowRePassword] = useState(false);

    useEffect(() => {
        if (passwordNew.trim() && passwordOLd.trim() && rePass.trim()) {
            setBtnState(true);
        } else {
            setBtnState(false);
        }
    }, [passwordNew, passwordOLd, rePass]);

    const handleSubmit = () => {
        let hasError = false;
        setErrorOldPassword('');
        setErrorNewPassword('');
        setErrorRePass('');

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

        if (!passwordRegex.test(passwordNew)) {
            setErrorNewPassword('Mật khẩu mới phải có ít nhất 6 ký tự, bao gồm chữ cái và số, không được chứa ký tự đặc biệt.');
            hasError = true;
        }

        if (passwordNew === passwordOLd) {
            setErrorOldPassword('Mật khẩu mới không được trùng với mật khẩu cũ.');
            hasError = true;
        }

        if (passwordNew !== rePass) {
            setErrorRePass('Mật khẩu nhập lại không khớp.');
            hasError = true;
        }

        if (hasError) {
            return;
        }

        setLoading(true);
        setBtnState(false);
        const data = { ID_user: me._id, passwordOLd, passwordNew };

        setTimeout(() => {
            dispatch(editPasswordOfUser(data))
                .unwrap()
                .then((response) => {
                    if (response.status === true) {
                        setSuccessVisible(true);
                        setTimeout(() => {
                            setSuccessVisible(false);
                            onClose();
                        }, 2000);
                    } else {
                        setFailed(true);
                        setErrorOldPassword('Mật khẩu cũ không đúng.');
                        setTimeout(() => {
                            setFailed(false);
                        }, 2000);
                    }
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {
                    setLoading(false);
                    setBtnState(true);
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
                    Thay đổi mật khẩu
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
                <DialogContentText sx={{ mb: 2 }}>
                    Mật khẩu của bạn phải có ít nhất 6 ký tự và bao gồm số, ký tự đặc biệt và ký tự in hoa. Hãy chọn cái gì đó khó đoán.
                </DialogContentText>
                <TextField
                    label="Mật khẩu hiện tại"
                    type={showOldPassword ? 'text' : 'password'}
                    fullWidth
                    margin="normal"
                    value={passwordOLd}
                    onChange={(e) => setPasswordOld(e.target.value)}
                    error={!!errorOldPassword}
                    helperText={errorOldPassword}
                    sx={{ mb: 2 }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                    edge="end"
                                >
                                    {showOldPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <TextField
                    label="Mật khẩu mới"
                    type={showNewPassword ? 'text' : 'password'}
                    fullWidth
                    margin="normal"
                    value={passwordNew}
                    onChange={(e) => setPasswordNew(e.target.value)}
                    error={!!errorNewPassword}
                    helperText={errorNewPassword}
                    sx={{ mb: 2 }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    edge="end"
                                >
                                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <TextField
                    label="Nhập lại mật khẩu mới"
                    type={showRePassword ? 'text' : 'password'}
                    fullWidth
                    margin="normal"
                    value={rePass}
                    onChange={(e) => setRepass(e.target.value)}
                    error={!!errorRePass}
                    helperText={errorRePass}
                    sx={{ mb: 2 }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => setShowRePassword(!showRePassword)}
                                    edge="end"
                                >
                                    {showRePassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleSubmit}
                    sx={{
                        backgroundColor: '#1b74e4',
                        '&:hover': { backgroundColor: '#1557b0' },
                        py: 1.5,
                    }}
                    disabled={!btnState || loading}
                >
                    {loading ? 'Đang xử lý...' : 'Thay đổi mật khẩu'}
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default ChangePasswordDialog;