import React from 'react';
import { useNavigate } from 'react-router-dom';
import './../../styles/screens/home/HomeS.css'; // Import file CSS

const StoryItem = ({ storyPost }) => {
  const navigate = useNavigate();

  // Kiểm tra nếu storyPost không hợp lệ
  if (!storyPost || !storyPost.stories || !storyPost.user) return null;

  const firstImages = storyPost.stories.map(story => story.medias?.[0] || null);

  // Kiểm tra xem media đầu tiên có phải là video không
  const isVideoAtIndex0 = () => {
    const firstStory = storyPost.stories[0];
    return (
      firstStory?.mediaType === 'video' ||
      firstStory?.medias[0]?.toLowerCase().endsWith('.mp4')
    );
  };

  const handleClick = () => {
    navigate('/story-viewer', {
      state: {
        storyView: storyPost,
        currentUserId: storyPost.user._id,
      },
    });
  };

  return (
    <div className="story-item" onClick={handleClick}>
      {isVideoAtIndex0() ? (
        <video
          className="story-media"
          src={firstImages[0]}
          muted
          autoPlay={false}
          style={{ objectFit: 'cover' }}
        />
      ) : (
        <img
          className="story-media"
          src={firstImages[0]}
          alt="Story"
          style={{ objectFit: 'cover' }}
        />
      )}
      <img
        className="story-avatar"
        src={storyPost.user.avatar}
        alt="Avatar"
      />
      <div className="story-background" />
      <span className="story-name">
        {`${storyPost.user.first_name} ${storyPost.user.last_name}`}
      </span>
    </div>
  );
};

export default StoryItem;