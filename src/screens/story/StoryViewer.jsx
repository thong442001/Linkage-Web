import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deletePost, storyViewerOfStory, addStoryViewer_reaction } from "../../rtk/API";
import { FaTrash, FaTimes } from "react-icons/fa";
import style from "../../styles/screens/story/StoryViewer.module.css";

const StoryViewer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { StoryView, currentUserId } = location.state || {};
  const me = useSelector((state) => state.app.user);
  const reactions = useSelector((state) => state.app.reactions || []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [stories, setStories] = useState(StoryView?.stories || []);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [viewers, setViewers] = useState([]);
  const [reactionsVisible, setReactionsVisible] = useState(false);
  const [progressValues, setProgressValues] = useState(stories.map(() => 0));
  const [isPaused, setIsPaused] = useState(false);
  const [showViewersDialog, setShowViewersDialog] = useState(false);
  const videoRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (stories.length > 0 && stories[currentIndex] && me?._id) {
      callStoryViewerOfStory();
    }
  }, [currentIndex, stories, me]);

  const callStoryViewerOfStory = async () => {
    try {
      const response = await dispatch(
        storyViewerOfStory({ ID_post: stories[currentIndex]._id, ID_user: me._id })
      ).unwrap();
      if (response && response.storyViewers) {
        setViewers(response.storyViewers);
      }
    } catch (error) {
      console.log("Lỗi khi callStoryViewerOfStory:", error);
    }
  };

  const isVideo = (media) => {
    return media?.toLowerCase().endsWith(".mp4") || stories[currentIndex]?.type === "video";
  };

  const getVideoDuration = async (url) => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.src = url;
      video.onloadedmetadata = () => {
        resolve(video.duration * 1000);
      };
      video.onerror = () => resolve(5000);
    });
  };

  const startProgress = async (index) => {
    if (!stories[index]) return;

    let duration = 5000;
    if (isVideo(stories[index].medias[0])) {
      duration = await getVideoDuration(stories[index].medias[0]);
    }

    const startTime = Date.now();

    const updateProgress = () => {
      if (isPaused) return;

      const elapsedTime = Date.now() - startTime;
      let progress = (elapsedTime / duration) * 100;

      if (progress >= 100) {
        progress = 100;
        clearInterval(intervalRef.current);
        if (!isPaused) {
          handleNextStory();
        }
        return;
      }

      setProgressValues((prev) => {
        const newValues = [...prev];
        newValues[index] = progress;
        return newValues;
      });
    };

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(updateProgress, 50);

    return () => clearInterval(intervalRef.current);
  };

  useEffect(() => {
    if (stories.length > 0) {
      setProgressValues(stories.map(() => 0));
    }
  }, [stories]);

  useEffect(() => {
    if (stories.length > 0) {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
      }
      startProgress(currentIndex);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentIndex, stories]);

  useEffect(() => {
    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  }, [isPaused]);

  const handleNextStory = () => {
    if (currentIndex + 1 < stories.length) {
      setProgressValues((prev) => {
        const newValues = [...prev];
        newValues[currentIndex] = 100;
        newValues[currentIndex + 1] = 0;
        return newValues;
      });
      setCurrentIndex(currentIndex + 1);
      setSelectedEmoji(null);
      setIsPaused(false);
    } else {
      navigate("/");
    }
  };

  const handlePrevStory = () => {
    if (currentIndex > 0) {
      setProgressValues((prev) => {
        const newValues = [...prev];
        newValues[currentIndex] = 0;
        newValues[currentIndex - 1] = 0;
        return newValues;
      });
      setCurrentIndex(currentIndex - 1);
      setSelectedEmoji(null);
      setIsPaused(false);
    }
  };

  const handlePress = (event) => {
    const clickX = event.clientX;
    const screenWidth = window.innerWidth;
    if (clickX < screenWidth / 2) {
      handlePrevStory();
    } else {
      handleNextStory();
    }
  };

  const handleSelectReaction = async (ID_reaction, name, icon) => {
    setSelectedEmoji(icon);
    setReactionsVisible(false);

    try {
      const data = {
        ID_post: stories[currentIndex]._id,
        ID_user: me._id,
        ID_reaction: ID_reaction,
      };
      await dispatch(addStoryViewer_reaction(data)).unwrap();
    } catch (error) {
      console.error("Lỗi khi thêm biểu cảm:", error);
    }
  };

  const handleDeleteStory = async () => {
    if (currentUserId !== StoryView.user._id) {
      console.log("Bạn chỉ có thể xóa story của chính mình!");
      return;
    }
    try {
      const storyId = stories[currentIndex]._id;
      await dispatch(deletePost({ _id: storyId })).unwrap();
      const newStories = stories.filter((story) => story._id !== storyId);
      setStories(newStories);
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Không thể xóa story:", error);
    }
  };

  if (!StoryView || !stories || stories.length === 0 || !me) {
    return (
      <div className={style["story-viewer-container"]}>
        <p className={style["no-data"]}>
          {me ? "Không có dữ liệu Story" : "Vui lòng đăng nhập để xem Story"}
        </p>
      </div>
    );
  }

  return (
    <div className={style["container"]}>
    <div
      className={style["story-viewer-container"]}
      onClick={handlePress}
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
    >
      <div className={style["progress-bar-container"]}>
        {stories.map((_, index) => (
          <div key={index} className={style["progress-bar-background"]}>
            <div
              className={style["progress-bar"]}
              style={{ width: `${progressValues[index]}%` }}
            />
          </div>
        ))}
      </div>

      {isVideo(stories[currentIndex]?.medias[0]) ? (
        <video ref={videoRef} className={style["story-media"]}>
          <source src={stories[currentIndex]?.medias[0]} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <img
          src={stories[currentIndex]?.medias[0]}
          alt="Story"
          className={style["story-media"]}
        />
      )}

      <div className={style["header-container"]}>
        <div className={style["user-info-container"]}>
          <img src={StoryView.user.avatar} alt="Avatar" className={style["viewer-avatar"]} />
          <p className={style["username"]}>
            {StoryView.user.first_name} {StoryView.user.last_name}
          </p>
        </div>
        <div className={style["button-container"]}>
          {me._id === StoryView.user?._id && (
            <button className={style["delete-button"]} onClick={handleDeleteStory}>
              <FaTrash />
            </button>
          )}
          <button className={style["exit-button"]} onClick={() => navigate("/")}>
            <FaTimes />
          </button>
        </div>
      </div>

      {me._id !== StoryView.user?._id && (
        <button
          className={style["reaction-trigger"]}
          onClick={() => setReactionsVisible(true)}
        >
          <span className={style["reaction-text"]}>{selectedEmoji || "👍"}</span>
        </button>
      )}

      {reactionsVisible && (
        <div className={style["reaction-modal"]}>
          <div className={style["reaction-bar"]}>
            {reactions.map((reaction) => (
              <button
                key={reaction._id}
                className={style["reaction-button"]}
                onClick={() =>
                  handleSelectReaction(reaction._id, reaction.name, reaction.icon)
                }
              >
                <span className={style["reaction-text"]}>{reaction.icon}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {me._id === StoryView.user?._id && (
        <div className={style["viewers-count-container"]}>
          <p
            className={style["viewers-title"]}
            onClick={() => setShowViewersDialog(true)}
          >
            Đã xem ({viewers.length})
          </p>
        </div>
      )}

      {showSuccessModal && (
        <div className={style["success-modal"]}>Xóa story thành công</div>
      )}

{showViewersDialog && (
  <div className={style["viewers-dialog-overlay"]}>
    <div className={style["viewers-dialog"]}>
      <div className={style["viewers-dialog-header"]}>
        <h3>Người đã xem ({viewers.length})</h3>
        <button
          className={style["viewers-dialog-close"]}
          onClick={() => setShowViewersDialog(false)}
        >
          <FaTimes />
        </button>
      </div>
      <div className={style["viewers-list"]}>
        {viewers.length > 0 ? (
          viewers.map((viewer) => {
            const reaction = viewer.ID_reaction || null;
            console.log("Viewer Reaction:", reaction);
            return (
              <div key={viewer._id} className={style["viewer-item"]}>
                <img
                  src={viewer.ID_user?.avatar}
                  alt="Viewer Avatar"
                  className={style["viewer-avatar"]}
                />
                <p className={style["viewer-name"]}>
                  {viewer.ID_user?.first_name} {viewer.ID_user?.last_name}
                </p>
                {reaction && (
                  <span className={style["viewer-reaction"]}>
                    {reaction.icon}
                  </span>
                )}
              </div>
            );
          })
        ) : (
          <p className={style["no-viewers"]}>Chưa có ai xem story này.</p>
        )}
      </div>
    </div>
  </div>
)}
    </div>
    /</div>
  );
};

export default StoryViewer;