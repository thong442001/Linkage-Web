import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const ReportDialog = ({ open, onClose }) => {
    const reportReasons = [
        {
            title: 'Vấn đề liên quan đến người dưới 18 tuổi',
            description: 'Bắt nạt, quấy rối học đường/làm việc, nguồn đại diện',
        },
        {
            title: 'Bạo lực, quấy rối hoặc ngôn ngữ thù địch',
            description: 'Đối xử bất công, đe dọa, kích động bạo lực',
        },
        {
            title: 'Tự tử hoặc tự gây thương tích',
            description: 'Nội dung mạnh tính bạo lực, tự ghét hoặc gây phiền toái',
        },
        {
            title: 'Bán hoặc quảng cáo mặt hàng bị hạn chế',
            description: 'Nội dung nguồn lớn',
        },
        {
            title: 'Thông tin sai sự thật, lùa đảo hoặc gian lận',
            description: 'Quyền sở hữu trí tuệ',
        },
        {
            title: 'Tôi không muốn xem nội dung này',
            description: '',
        },
    ];

    const handleReasonClick = (reason) => {
        console.log('Lý do báo cáo được chọn:', reason.title);
        // Xử lý logic khi chọn lý do (ví dụ: gửi API báo cáo)
        onClose(); // Đóng dialog sau khi chọn
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                Tại sao bạn báo cáo bài viết này?
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
            </DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mb: 2 }}>
                    Nếu bạn nhận thấy ai đó đang gặp nguy hiểm, đừng chần chừ mà hãy tìm ngay sự giúp đỡ trước khi báo cáo với Facebook.
                </DialogContentText>
                <List>
                    {reportReasons.map((reason, index) => (
                        <ListItem
                            key={index}
                            button
                            onClick={() => handleReasonClick(reason)}
                            sx={{ py: 1 }}
                            secondaryAction={<ChevronRightIcon />}
                        >
                            <ListItemText
                                primary={
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {reason.title}
                                    </Typography>
                                }
                                secondary={reason.description}
                            />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
        </Dialog>
    );
};

export default ReportDialog;