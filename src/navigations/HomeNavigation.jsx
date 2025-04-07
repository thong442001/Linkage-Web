// src/components/HomeNavigation.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../screens/home/Home';

const HomeNavigation = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* Thêm các route khác nếu cần */}
    </Routes>
  );
};

export default HomeNavigation;