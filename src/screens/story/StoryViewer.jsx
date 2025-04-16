import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deletePost, storyViewerOfStory, addStoryViewer_reaction } from "../../rtk/API";
import { FaTrash, FaTimes } from "react-icons/fa";
import style from "../../styles/screens/story/StoryViewer.module.css"; // Sử dụng CSS Modules

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
  const [isPaused, setIsPaused] = useState(false); // Bắt đầu không tạm dừng
  const videoRef = useRef(null);
  const intervalRef = useRef(null); // Ref để lưu setInterval

  useEffect(() => {
    // Chỉ gọi API nếu có dữ liệu hợp lệ
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
        resolve(video.duration * 1000); // Chuyển đổi từ giây sang mili giây
      };
      video.onerror = () => resolve(5000); // Mặc định 5 giây nếu lỗi
    });
  };

  const startProgress = async (index) => {
    if (!stories[index]) return;

    let duration = 5000; // Mặc định 5 giây cho ảnh
    if (isVideo(stories[index].medias[0])) {
      duration = await getVideoDuration(stories[index].medias[0]); // Lấy thời gian thực của video
    }

    const startTime = Date.now(); // Lấy thời gian bắt đầu

    const updateProgress = () => {
      if (isPaused) return; // Dừng nếu đang tạm dừng

      const elapsedTime = Date.now() - startTime; // Thời gian đã trôi qua
      let progress = (elapsedTime / duration) * 100; // Tính progress dựa trên thời gian thực

      if (progress >= 100) {
        progress = 100; // Đảm bảo không vượt quá 100%
        clearInterval(intervalRef.current);
        if (!isPaused) {
          handleNextStory(); // Chuyển story chỉ khi progress đạt 100%
        }
        return;
      }

      setProgressValues((prev) => {
        const newValues = [...prev];
        newValues[index] = progress;
        return newValues;
      });
    };

    // Dọn dẹp interval cũ trước khi tạo interval mới
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(updateProgress, 50); // Cập nhật mỗi 50ms

    return () => clearInterval(intervalRef.current); // Cleanup khi component unmount
  };

  useEffect(() => {
    if (stories.length > 0) {
      // Reset progress khi stories thay đổi
      setProgressValues(stories.map(() => 0));
    }
  }, [stories]);

  useEffect(() => {
    if (stories.length > 0) {
      // Reset video khi chuyển story
      if (videoRef.current) {
        videoRef.current.currentTime = 0; // Reset thời gian phát video
        videoRef.current.play(); // Phát lại video
      }
      startProgress(currentIndex);
    }

    // Cleanup interval khi currentIndex thay đổi hoặc component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentIndex, stories]);

  useEffect(() => {
    // Tạm dừng hoặc tiếp tục video khi isPaused thay đổi
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
        newValues[currentIndex] = 100; // Hoàn tất progress của story hiện tại
        newValues[currentIndex + 1] = 0; // Reset progress của story tiếp theo
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
        newValues[currentIndex] = 0; // Reset progress của story hiện tại
        newValues[currentIndex - 1] = 0; // Reset progress của story trước đó
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
      }, 2000); // Đợi 2 giây trước khi điều hướng
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
          <img src={StoryView.user.avatar} alt="Avatar" className={style["avatar"]} />
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
          <p className={style["viewers-title"]}>Đã xem ({viewers.length})</p>
        </div>
      )}

      {showSuccessModal && (
        <div className={style["success-modal"]}>Xóa story thành công</div>
      )}
    </div>
  );
};

export default StoryViewer;