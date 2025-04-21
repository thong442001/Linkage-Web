// src/components/UserNavigation.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../screens/user/Login';
import Register from '../screens/user/Register';
import VerifyOTP from '../screens/user/VerifyOTP';
const UserNavigation = () => {
  return (
    <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Login />} />
    </Routes>
  );
};

export default UserNavigation;