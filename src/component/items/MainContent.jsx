import React from 'react';
import '../../css/Post.css'; // Import file CSS
import { FaThumbsUp, FaComment, FaShare, FaEllipsisH } from 'react-icons/fa'; // Import các icon từ react-icons
const MainContent = () => {
    return (
        <div className="main-content">
            {/* <div className="create-post">
                <img
                    src="https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg"
                    alt="Profile"
                    className="avatar"
                />
                <input
                    type="text"
                    placeholder="What's on your mind, Dien Do?"
                    className="post-input"
                />
            </div>
            <div className="post-actions">
                <button className="action-button">Live video</button>
                <button className="action-button">Photo/video</button>
                <button className="action-button">Feeling/activity</button>
            </div> */}
            <div className="post">
                <div className="post-header">
                    <div className="post-author-info">
                        <img
                            src="https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg"
                            alt="Profile"
                            className="avatar"
                        />
                        <div className="post-info">
                            <div>
                                <span className="post-author">Phil String</span>
                            </div>
                            <div>
                                <span className="post-time">1h</span>
                            </div>
                        </div>
                    </div>
                    {/* Thêm nút ba chấm */}
                    <button className="post-options">
                        <FaEllipsisH className="options-icon" />
                    </button>
                </div>
                <p>Hello</p>
                <img
                    src="https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg"
                    alt="Post"
                    className="post-image"
                />
                {/* Thêm phần trạng thái Thích, Bình luận, Chia sẻ */}
                <div className="post-interactions">
                    <div className="interaction-stats">
                        <span className="likes">Cao Thùy and 1.2K others</span>
                        <div className="comments-shares">
                            <span className="comments">124 comments</span>
                            <span className="shares">8 shares</span>
                        </div>
                    </div>
                    <div className="interaction-buttons-container">
                        <div className="interaction-buttons">
                            <button className="interaction-button">
                                <FaThumbsUp className="interaction-icon" /> Like
                            </button>
                            <button className="interaction-button">
                                <FaComment className="interaction-icon" /> Comment
                            </button>
                            <button className="interaction-button">
                                <FaShare className="interaction-icon" /> Share
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainContent;