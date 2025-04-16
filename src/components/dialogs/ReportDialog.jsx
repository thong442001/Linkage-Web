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
import {
    addReport_post,
    addReport_user
} from '../../rtk/API';
import { useDispatch, useSelector } from 'react-redux';
const ReportDialog = ({ open, onClose, reasons, ID_me, ID_post, ID_user }) => {

    const dispatch = useDispatch();

    const handleReasonClick = (ID_reason) => {
        if (!ID_me) return;
        if (ID_post) {
            callAddReport_post(ID_reason)
        } else {
            callAddReport_user(ID_reason)
        }
        onClose(); // Đóng dialog sau khi chọn
    };

    const callAddReport_post = async (ID_reason) => {
        try {
            if (!ID_post) {
                console.log('ID_post: ', ID_post);
                return;
            }
            const paramsAPI = {
                me: ID_me,
                ID_post: ID_post,
                ID_reason: ID_reason,
            }
            await dispatch(addReport_post(paramsAPI))
                .unwrap()
                .then(response => {
                    console.log('status callAddReport_post:', response.status);
                    //navigation.goBack()
                })
                .catch(error => {
                    console.log('Lỗi khi callAddReport_post:', error);
                });
        } catch (error) {
            console.log('Lỗi trong addReport_post:', error);
        }
    };

    const callAddReport_user = async (ID_reason) => {
        try {
            if (!ID_user) {
                console.log('ID_post: ', ID_user);
                return;
            }
            const paramsAPI = {
                me: ID_me,
                ID_user: ID_user,
                ID_reason: ID_reason,
            }
            await dispatch(addReport_user(paramsAPI))
                .unwrap()
                .then(response => {
                    console.log('status callAddReport_user:', response.status);
                    //navigation.goBack()
                })
                .catch(error => {
                    console.log('Lỗi khi callAddReport_user:', error);
                });
        } catch (error) {
            console.log('Lỗi trong addReport_post:', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {
                    (ID_post)
                        ? 'Tại sao bạn báo cáo bài viết này?'
                        : 'Tại sao bạn báo cáo trang cá nhân này?'
                }

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
                    Nếu bạn nhận thấy ai đó đang gặp nguy hiểm, đừng chần chừ mà hãy tìm ngay sự giúp đỡ trước khi báo cáo với Linkage.
                </DialogContentText>
                <List>
                    {reasons?.map((reason, index) => (
                        <ListItem
                            key={index}
                            button
                            onClick={() => handleReasonClick(reason._id)}
                            sx={{ py: 1 }}
                            secondaryAction={<ChevronRightIcon />}
                        >
                            <ListItemText
                                primary={
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {reason.reason_text}
                                    </Typography>
                                }
                            //secondary={reason.description}
                            />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
        </Dialog>
    );
};

export default ReportDialog;