import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Profile from '../screens/profile/Profile';
import Home from '../screens/home/Home';

const ProfileNavigation = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      {/* Add more routes if needed */}
    </Routes>
  );
};

export default ProfileNavigation;