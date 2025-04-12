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