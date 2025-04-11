// src/components/Login.js
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import HomeNavigation from './HomeNavigation';
import UserNavigation from './UserNavigation';
const WebNavigation = () => {
  const { user } = useSelector((state) => state.app);



  return (
    <div>
      {
        user ? (
          <HomeNavigation />
        ) : (
          <UserNavigation />
        )
      }
    </div>
  );
};

export default WebNavigation;