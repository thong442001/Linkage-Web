import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../screens/home/Home';
import Friend from '../screens/friend/Friend';
import Profile from '../screens/profile/Profile';
import Chat from '../screens/chat/Chat';
import Trash from '../screens/trash/Trash';

// Component bố cục chính
const MainLayout = ({ children }) => {
  return (
    <div>
      <Home content={children} /> {/* Home cung cấp header và nội dung động */}
    </div>
  );
};

const HomeNavigation = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <MainLayout>
            <div className="mid-sidebar">
              {/* Nội dung mặc định sẽ được xử lý trong Home.jsx */}
            </div>
          </MainLayout>
        }
      />
      <Route
        path="/friend"
        element={
          <MainLayout>
            <Friend />
          </MainLayout>
        }
      />
      <Route
        path="/chat"
        element={
          <MainLayout>
            <Chat />
          </MainLayout>
        }
      />
      <Route
        path="/profile"
        element={
          <MainLayout>
            <Profile />
          </MainLayout>
        }
      />
      <Route
        path="/profile/:id"
        element={
          <MainLayout>
            <Profile />
          </MainLayout>
        }
      />
      <Route
        path="/trash"
        element={
          <MainLayout>
            <Trash />
          </MainLayout>
        }
      />
    </Routes>
  );
};

export default HomeNavigation;