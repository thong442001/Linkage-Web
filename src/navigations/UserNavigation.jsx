// src/components/UserNavigation.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../screens/user/Login';
const UserNavigation = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Login />} />
    </Routes>
  );
};

export default UserNavigation;