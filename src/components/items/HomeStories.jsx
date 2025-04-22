import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaPlusCircle } from 'react-icons/fa';
import StoryItem from './StoryItem';
import style from '../../styles/components/items/HomeStories.module.css';
import UpPost from '../../components/dialogs/UpPost';

const HomeStories = ({ stories, liveSessions }) => {
  const navigate = useNavigate();
  const me = useSelector((state) => state.app.user);
  const [liveID, setLiveID] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Tạo liveID ngẫu nhiên
  useEffect(() => {
    setLiveID(String(Math.floor(Math.random() * 100000000)));
  }, []);

  const handleAddStoryClick = () => {
    navigate('/UpStory');
  };



  return (
    <div className={style['home-stories-container']}

    >
      {/* Input và các nút */}
      <div className={style['home-stories-header']}>
        <div className={style['user-avatar-container']}>
          <img
            src={me?.avatar}
            alt="Avatar"
            className={style['user-avatar']}
            onClick={() => navigate(`/profile/${me._id}`)}
          />
        </div>
        <input
          className={style['post-input']}
          placeholder="Bạn đang nghĩ gì thế?"
          onClick={() => setIsOpen(true)}
          readOnly
        />
      </div>

      {/* Dialog UpPost */}
      <UpPost isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {/* Danh sách Stories */}
      <div className={style['stories-list']}>
        {/* Nút Tạo tin */}
        <div className={`${style['story-item']} ${style['add-story']}`} onClick={handleAddStoryClick}>
          <img
            src={me?.avatar}
            alt="Avatar"
            className={style['story-media']}
            style={{ objectFit: 'cover' }}
          />
          <div className={style['add-story-icon']}>
            <FaPlusCircle size={40} color="#0064E0" />
          </div>
          <div className={style['story-background']} />
          <span className={style['add-story-text']}>Tạo tin</span>
        </div>

        {/* Danh sách Live và Stories */}
        {liveSessions.concat(stories).map((item, index) =>
          item.liveID ? (
            <div key={`live-${index}`} className={`${style['story-item']} ${style['live-item']}`}>
              <img
                src={item.avatar}
                alt="Live"
                className={style['story-media']}
                style={{ objectFit: 'cover' }}
              />
              <span className={style['story-name']}>{item.userName}</span>
            </div>
          ) : (
            <StoryItem key={item._id || `story-${index}`} storyPost={item} />
          )
        )}
      </div>
    </div>
  );
};

export default HomeStories;