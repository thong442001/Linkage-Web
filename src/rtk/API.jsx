import { createAsyncThunk } from '@reduxjs/toolkit'
import AxiosHelper from '../helpers/AxiosHelper'

export const checkBanUser = createAsyncThunk(
  'user/checkBanUser',
  async (data, { rejectWithValue }) => {
    try {
      const response =
        await AxiosHelper(data.token)
          //.get('post/getMyPosts', data);
          .get(`user/checkBanUser?ID_user=${data.ID_user}`);
      //console.log(response)
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loginWeb = createAsyncThunk(
  'user/loginWeb',
  async (data, { rejectWithValue }) => {
    try {
      const response =
        await AxiosHelper()
          .post('user/loginWeb', data);
      //console.log(response)
      if (response.status == true) {
        return response;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAllLoiMoiKetBan = createAsyncThunk(
  'relationship/getAllLoiMoiKetBan',
  async (data, { rejectWithValue }) => {
    try {
      const response = await AxiosHelper(data.token)
        .get(`relationship/getAllLoiMoiKetBan?me=${data.me}`);
      //console.log(response.status)
      if (response.status == true) {
        return response;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const chapNhanLoiMoiKetBan = createAsyncThunk(
  'relationship/chapNhanLoiMoiKetBan',
  async (data, { rejectWithValue }) => {
    try {
      const response = await AxiosHelper()
        .post(`relationship/chapNhanLoiMoiKetBan`, data);
      //console.log(response.status)
      if (response.status == true) {
        return response;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const huyLoiMoiKetBan = createAsyncThunk(
  'relationship/huyLoiMoiKetBan',
  async (data, { rejectWithValue }) => {
    try {
      const response = await AxiosHelper()
        .post(`relationship/huyLoiMoiKetBan`, data);
      //console.log(response.status)
      if (response.status == true) {
        return response;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const getGoiYBanBe = createAsyncThunk(
  'relationship/getGoiYBanBe',
  async (data, { rejectWithValue }) => {
    try {
      const response = await AxiosHelper(data.token)
        .get(`relationship/getGoiYBanBe?me=${data.me}`);
      //console.log(response.status)
      if (response.status == true) {
        return response;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const getRelationshipAvsB = createAsyncThunk(
  'relationship/getRelationshipAvsB',
  async (data, { rejectWithValue }) => {
    try {
      const response = await AxiosHelper()
        .post('relationship/getRelationshipAvsB', data);
      console.log(response)
      if (response.status == true) {
        return response;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
// post
export const addPost = createAsyncThunk(
  'post/addPost',
  async (data, { rejectWithValue }) => {
    try {
      const response =
        await AxiosHelper()
          .post('post/addPost', data);
      console.log(response)
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// xóa post_reaction
// params: _id
export const deletePost_reaction = createAsyncThunk(
  'post_reaction/deletePost_reaction',
  async (data, { rejectWithValue }) => {
    try {
      const response = await AxiosHelper()
        .post('post_reaction/deletePost_reaction', data);
      //console.log(response?.message)
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// post_reaction
// params: ID_post, ID_user, ID_reaction
export const addPost_Reaction = createAsyncThunk(
  'post_reaction/addPost_Reaction',
  async (data, { rejectWithValue }) => {
    try {
      const response = await AxiosHelper()
        .post('post_reaction/addPost_Reaction', data);
      //console.log(response?.message)
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// all post in home
export const getAllPostsInHome = createAsyncThunk(
  'post/getAllPostsInHome',
  async (data, { rejectWithValue }) => {
    try {
      const response = await AxiosHelper(data.token)
        .get(`post/getAllPostsInHome?me=${data.me}`);
      //console.log(response.status)
      if (response.status == true) {
        return response;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const guiLoiMoiKetBan = createAsyncThunk(
  'relationship/guiLoiMoiKetBan',
  async (data, { rejectWithValue }) => {
    try {
      const response = await AxiosHelper()
        .post(`relationship/guiLoiMoiKetBan`, data);
      //console.log(response.status)
      if (response.status == true) {
        return response;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const getAllFriendOfID_user = createAsyncThunk(
  'relationship/getAllLoiMoiKetBan',
  async (data, { rejectWithValue }) => {
    try {
      const response = await AxiosHelper(data.token)
        .get(`relationship/getAllFriendOfID_user?me=${data.me}`);
      //console.log(response.status)
      if (response.status == true) {
        return response;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAllGroupOfUser = createAsyncThunk(
  'group/getAllGroupOfUser',
  async (data, { rejectWithValue }) => {
    try {
      const response = await AxiosHelper(data.token)
        .get(`group/getAllGroupOfUser?ID_user=${data.ID_user}`);
      //console.log(response.status)
      if (response.status == true) {
        return response;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getMessagesGroup = createAsyncThunk(
  'message/getMessagesGroup',
  async (data, { rejectWithValue }) => {
    try {
      const response = await AxiosHelper(data.token)
        .get(`message/getMessagesGroup?ID_group=${data.ID_group}`);
      //console.log(response.status)
      if (response.status == true) {
        return response;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// params : me(ID_user)
export const getAllNotificationOfUser = createAsyncThunk(
  'notification/getAllNotificationOfUser',
  async (data, { rejectWithValue }) => {
    try {
      const response = await AxiosHelper(data.token)
        .get(`notification/getAllNotificationOfUser?me=${data.me}`);
      //console.log(response.status)
      if (response.status == true) {
        return response;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Lấy toàn bộ thông tin profile (bao gồm user, posts, relationship, friends, stories)
export const allProfile = createAsyncThunk(
  'post/allProfile',
  async (data, { rejectWithValue }) => {
    try {
      const response = await AxiosHelper()
        .post('post/allProfile', data);
      if (response.status === true) {
        return response;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Chỉnh sửa avatar của người dùng
export const editAvatarOfUser = createAsyncThunk(
  'user/editAvatarOfUser',
  async (data, { rejectWithValue }) => {
    try {
      const response = await AxiosHelper()
        .post('user/editAvatarOfUser', data);
      if (response.status === true) {
        return response;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Chỉnh sửa ảnh bìa của người dùng
export const editBackgroundOfUser = createAsyncThunk(
  'user/editBackgroundOfUser',
  async (data, { rejectWithValue }) => {
    try {
      const response = await AxiosHelper()
        .post('user/editBackgroundOfUser', data);
      if (response.status === true) {
        return response;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Chỉnh sửa bio của người dùng
export const editBioOfUser = createAsyncThunk(
  'user/editBioOfUser',
  async (data, { rejectWithValue }) => {
    try {
      const response = await AxiosHelper()
        .post('user/editBioOfUser', data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Hủy bạn bè
export const huyBanBe = createAsyncThunk(
  'relationship/huyBanBe',
  async (data, { rejectWithValue }) => {
    try {
      const response = await AxiosHelper()
        .post(`relationship/huyBanBe`, data);
      if (response.status === true) {
        return response;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);



// Tham gia hoặc tạo nhóm chat riêng tư
export const joinGroupPrivate = createAsyncThunk(
  'group/joinGroupPrivate',
  async (data, { rejectWithValue }) => {
    try {
      const response = await AxiosHelper()
        .post('group/joinGroupPrivate', data);
      if (response.status === true) {
        return response;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Xóa bài đăng (đặt _destroy = true)
export const changeDestroyPost = createAsyncThunk(
  'post/changeDestroyPost',
  async (data, { rejectWithValue }) => {
    try {
      const response = await AxiosHelper()
        .post('post/changeDestroyPost', data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/// test token
export const getAllUsers = createAsyncThunk(
  'user/getAllUsers',
  async (data, { rejectWithValue }) => {
    try {
      const response = await AxiosHelper(data.token)
        .get('user/getAllUsers', data);
      //console.log(response.status)
      if (response.status == true) {
        return response;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getPostsUserIdDestroyTrue = createAsyncThunk(
  'post/getPostsUserIdDestroyTrue',
  async (data, { rejectWithValue }) => {
    try {
      const response = await AxiosHelper(data.token)
        .get(`post/getPostsUserIdDestroyTrue?me=${data.me}`);
      //console.log(response.status)
      if (response.status == true) {
        return response;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deletePost = createAsyncThunk(
  'post/deletePost',
  async (data, { rejectWithValue }) => {
    try {
      const response = await AxiosHelper()
        .post('post/deletePost', data);
      //console.log(response)
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAllReaction = createAsyncThunk(
  'reaction/getAllReaction',
  async (data, { rejectWithValue }) => {
    try {
      const response = await AxiosHelper()
        .get(`reaction/getAllReaction`);
      //console.log(response.status)
      if (response.status == true) {
        return response;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ****************** report ****************

export const getAllReason = createAsyncThunk(
  'reason/getAllReason',
  async (data, { rejectWithValue }) => {
    try {
      const response = await AxiosHelper(data.token)
        .get(`reason/getAllReason`);
      //console.log(response.status)
      if (response.status == true) {
        return response;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Report post
// params : me, ID_post, ID_reason
export const addReport_post = createAsyncThunk(
  'report_post/addReport_post',
  async (data, { rejectWithValue }) => {
    try {
      const response = await AxiosHelper()
        .post('report_post/addReport_post', data);
      //console.log(response)
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


// Report user
// params :me, ID_user, ID_reason
export const addReport_user = createAsyncThunk(
  'report_user/addReport_user',
  async (data, { rejectWithValue }) => {
    try {
      const response = await AxiosHelper()
        .post('report_user/addReport_user', data);
      //console.log(response)
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

