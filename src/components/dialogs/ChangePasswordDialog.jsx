import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    TextField,
    FormControlLabel,
    Checkbox,
    Button,
    IconButton,
    Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ChangePasswordDialog = ({ open, onClose }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [logoutOtherDevices, setLogoutOtherDevices] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = () => {
        // Kiểm tra mật khẩu
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            setError('Vui lòng điền đầy đủ các trường');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setError('Mật khẩu mới và xác nhận mật khẩu không khớp');
            return;
        }

        // Gửi yêu cầu thay đổi mật khẩu (giả lập API)
        console.log('Thay đổi mật khẩu:', {
            currentPassword,
            newPassword,
            logoutOtherDevices,
        });

        // Đóng dialog sau khi thành công
        setError('');
        onClose();
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
                    type="password"
                    fullWidth
                    margin="normal"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    //helperText="Cập nhật 03/05/2024"
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Mật khẩu mới"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Nhập lại mật khẩu mới"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    error={!!error}
                    helperText={error}
                    sx={{ mb: 2 }}
                />
                {/* <FormControlLabel
                    control={
                        <Checkbox
                            checked={logoutOtherDevices}
                            onChange={(e) => setLogoutOtherDevices(e.target.checked)}
                            color="primary"
                        />
                    }
                    label="Đăng xuất khỏi các thiết bị khác sau khi thay đổi mật khẩu. Chọn mục này nếu người khác có thể sử dụng tài khoản của bạn."
                    sx={{ mb: 2 }}
                /> */}
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
                >
                    Thay đổi mật khẩu
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default ChangePasswordDialog;