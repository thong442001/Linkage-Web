import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Profile from '../screens/profile/Profile';
import Home from '../screens/home/Home';
import Chat from '../screens/chat/Chat';
import Friend from '../screens/friend/Friend'
import Trash from '../screens/trash/Trash';

const ProfileNavigation = () => {
  return (
    <Routes>
      <Route path="/*" element={<Home />} />
      <Route path="/chat" element={<Chat />} />
      {/* <Route path="/friend" element={<Friend />} /> */}
      {/* <Route path="/trash" element={<Trash />} />  */}
      {/* Thêm các route khác nếu cần */}
      <Route path="/profile" element={<Profile />} />
      <Route path="/profile/:id" element={<Profile />} /> {/* Profile của người khác */}
      {/* Add more routes if needed */}
    </Routes>
  );
};

export default ProfileNavigation;