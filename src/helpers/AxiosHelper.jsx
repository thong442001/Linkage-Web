// src/components/helpers/AxiosHelper.jsx
import axios from 'axios';
import { logout, resetToken } from '../rtk/Reducer';

// Tạo instance axios với cấu hình mặc định
const AxiosHelper = (token = '', contentType = 'application/json') => {
    const axiosInstance = axios.create({
        baseURL: 'https://linkage.id.vn', // URL công khai
        // baseURL: 'http://localhost:3001', // Dùng khi phát triển cục bộ
    });

    // Interceptor cho request: Thêm token vào header
    axiosInstance.interceptors.request.use(
        async (config) => {
            // Trì hoãn việc import store đến khi request được thực hiện
            const { store } = await import('../rtk/Store');
            const token = store.getState().app.token;
            config.headers = {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                'Content-Type': contentType,
            };
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Interceptor cho response: Xử lý lỗi và refresh token
    axiosInstance.interceptors.response.use(
        (response) => {
            return response.data; // Trả về dữ liệu từ response
        },
        async (error) => {
            const originalRequest = error?.config;
            if (error.response?.status === 403 && !originalRequest?.sent) {
                console.log('403, token hết hạn');
                originalRequest.sent = true;

                // Trì hoãn việc import store đến khi cần
                const { store } = await import('../rtk/Store');
                try {
                    const response = await axios.post(
                        `https://linkage.id.vn/user/refreshToken`,
                        {
                            refreshToken: store.getState().app.refreshToken,
                        }
                    );

                    console.log('=>token1: ' + response.data?.token);
                    // Cập nhật token mới vào Redux store
                    await store.dispatch(resetToken(response.data?.token));
                    // Cập nhật header của yêu cầu gốc với token mới
                    originalRequest.headers['Authorization'] = `Bearer ${response.data?.token}`;
                    // Gửi lại yêu cầu gốc
                    return axiosInstance(originalRequest);
                } catch (refreshError) {
                    console.log('Refresh token hết hạn');
                    // Nếu refresh token hết hạn, đăng xuất người dùng
                    await store.dispatch(logout());
                    return Promise.reject(refreshError);
                }
            }

            // Nếu có lỗi từ response, trả về lỗi đó
            if (error.response && error.response.data) {
                return Promise.reject(error.response.data);
            }
            return Promise.reject(error.message);
        }
    );

    return axiosInstance;
};

export default AxiosHelper;