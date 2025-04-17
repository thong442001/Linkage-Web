import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaPlusCircle, FaVideo, FaPhotoVideo, FaSmile } from 'react-icons/fa';
import StoryItem from './StoryItem';
import style from '../../styles/components/items/HomeStories.module.css'; // Import CSS Modules

const HomeStories = ({ stories, liveSessions }) => {
  const navigate = useNavigate();
  const me = useSelector((state) => state.app.user);
  const [liveID, setLiveID] = useState('');

  // Tạo liveID ngẫu nhiên
  useEffect(() => {
    setLiveID(String(Math.floor(Math.random() * 100000000)));
  }, []);

  const handleAddStoryClick = () => {
    navigate('/UpStory');
  };

  const handleGoLiveClick = () => {
    navigate('/host-live', {
      state: {
        userID: me._id,
        avatar: me.avatar,
        userName: `${me.first_name} ${me.last_name}`,
        liveID,
      },
    });
  };

  const handlePhotoVideoClick = () => {
    navigate('/up-post'); // Điều hướng đến trang đăng ảnh/video
  };

  const handleFeelingActivityClick = () => {
    // Logic cho nút "Cảm xúc/hoạt động" (có thể mở dialog hoặc điều hướng)
    console.log('Feeling/Activity clicked');
  };

  return (
    <div className={style['home-stories-container']}>
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
          placeholder="Quẳng ơi, bạn đang nghĩ gì thế?"
          onClick={() => navigate('/up-post')}
          readOnly
        />
      </div>

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