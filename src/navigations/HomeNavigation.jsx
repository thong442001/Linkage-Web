// src/components/HomeNavigation.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../screens/home/Home';
import Chat from '../screens/chat/Chat';
import Friend from '../screens/friend/Friend'
import Trash from '../screens/trash/Trash';

const HomeNavigation = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/friend" element={<Friend />} />
      <Route path="/trash" element={<Trash />} />
      {/* Thêm các route khác nếu cần */}
    </Routes>
  );
};

export default HomeNavigation;