import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import {
  getPostsUserIdDestroyTrue,
  changeDestroyPost,
  deletePost,
} from '../../rtk/API';
import Post from '../../components/items/Post.jsx'; // Thay thế PostItem bằng Post
import Style from '../../styles/screens/trash/Trash.module.css';

const Trash = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const me = useSelector((state) => state.app.user);
  const token = useSelector((state) => state.app.token);  
  const reactions = useSelector((state) => state.app.reactions) || []; // Lấy reactions từ Redux, hoặc mặc định là mảng rỗng
  const reasons = useSelector((state) => state.app.reasons) || []; // Lấy reasons từ Redux, hoặc mặc định là mảng rỗng
  const [posts, setPosts] = useState([]);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Cập nhật currentTime cho Post
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Lấy danh sách bài viết trong thùng rác khi component mount
  useEffect(() => {
    if (me?._id && token) {
      callGetPostsUserIdDestroyTrue(me._id);
    }
  }, [me._id, token]);

  const callGetPostsUserIdDestroyTrue = async (ID_user) => {
    try {
      await dispatch(getPostsUserIdDestroyTrue({ me: ID_user, token }))
        .unwrap()
        .then((response) => {
          console.log('Post thùng rác: ', response.posts);
          setPosts(response.posts || []);
        })
        .catch((error) => {
          console.log('Error callGetPostsUserIdDestroyTrue: ', error);
        });
    } catch (error) {
      console.log('Error: ', error);
    }
  };

  const callDeletePost = async (ID_post) => {
    try {
      await dispatch(deletePost({ _id: ID_post }))
        .unwrap()
        .then((response) => {
          console.log('Xóa vĩnh viễn thành công:', response);
          setPosts((prevPosts) => prevPosts.filter((post) => post._id !== ID_post));
        })
        .catch((error) => {
          console.log('Lỗi khi xóa vĩnh viễn bài viết:', error);
        });
    } catch (error) {
      console.log('Lỗi trong callDeletePost:', error);
    }
  };

  const callChangeDestroyPost = async (ID_post) => {
    try {
      await dispatch(changeDestroyPost({ _id: ID_post }))
        .unwrap()
        .then((response) => {
          console.log('Phục hồi thành công:', response);
          const restoredPost = posts.find((post) => post._id === ID_post);
          setPosts((prevPosts) => prevPosts.filter((post) => post._id !== ID_post));
          navigate(-1, { state: { isRestored: true, restoredPost } });
        })
        .catch((error) => {
          console.log('Lỗi khi phục hồi bài viết:', error);
        });
    } catch (error) {
      console.log('Lỗi trong callChangeDestroyPost:', error);
    }
  };

  return (
    <div className={Style.trashContainer}>
      <div className={Style.header}>
        <h1 className={Style.header_title}>Thùng rác</h1>
      </div>
      <div className={Style.post_container}>
        {posts && posts.length > 0 ? (
          <div className={Style.post_list}>
            {posts.map((item) => (
              <div key={item._id} className={Style.post_item}>
                <Post
                  post={item}
                  me={me}
                  reactions={reactions}
                  reasons={reasons}
                  currentTime={currentTime}
                  onDelete={() => callChangeDestroyPost(item._id)}
                  onDeleteVinhVien={() => callDeletePost(item._id)}
                  updatePostReaction={() => {}}
                  deletePostReaction={() => {}}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className={Style.empty_container}>
            <p className={Style.empty_text}>Chưa có bài nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Trash;