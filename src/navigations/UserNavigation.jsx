// src/components/UserNavigation.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../screens/user/Login';
import Register from '../screens/user/Register';
import VerifyOTP from '../screens/user/VerifyOTP';
import FindWithEmail from '../screens/user/FindPassByEmail';
import CheckEmail from '../screens/user/CheckEmail';
import CreateNewPassword from '../screens/user/CreateNewPass';
import FindWithPhone from '../screens/user/FindPassByPhone';
import CheckPhone from '../screens/user/CheckPhone';
import CreateNewPassWordPhone from '../screens/user/CreateNewPassPhone';
const UserNavigation = () => {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/find-with-email" element={<FindWithEmail />} />   
      <Route path="/find-with-phone" element={<FindWithPhone />} />   
      <Route path="/create-new-pass" element={<CreateNewPassword />} /> 
      <Route path="/create-new-phone" element={<CreateNewPassWordPhone />} />         
      <Route path="/check-email" element={<CheckEmail />} />    
      <Route path="/check-phone" element={<CheckPhone />} />  
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Login />} />
    </Routes>
  );
};

export default UserNavigation;