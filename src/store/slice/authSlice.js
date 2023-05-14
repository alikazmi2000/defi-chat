import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { createDiffieHellman } from 'crypto-browserify';
import CryptoJS from 'crypto-js';

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: false,
  error: null,
};
const url = 'http://localhost:3001/users'
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    registerSuccess: (state, action) => {
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user',JSON.stringify(action.payload.user))
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user',JSON.stringify(action.payload.user))
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
    logoutSuccess: (state) => {
      localStorage.removeItem('token');
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
    authError: (state, action) => {
      localStorage.removeItem('token');
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = action.payload;
    },
    setLoading: (state) => {
      state.isLoading = true;
    },
  },
});

export const { registerSuccess, loginSuccess, logoutSuccess, authError, setLoading } = authSlice.actions;
export default authSlice.reducer;
const generateDhKeys = ()=>{
  try {
    const clientPublicKey = DH.generateKeys('hex');
    
    return clientPublicKey
  } catch (error) {
    return undefined
  }
}
// Register User
export const register = ({ name, email, password }) => async (dispatch) => {
  dispatch(setLoading());
  try {
    const res = await axios.post(url+'/register', { name, email, password });
    await dispatch(registerSuccess(res.data));

  } catch (err) {
    console.log("Error",err)
    dispatch(authError(err.response.data.error));
  }
};

// Login User
export const login = ({ email, password }) => async (dispatch) => {
  dispatch(setLoading());
  try {
    const res = await axios.post(url+'/login', { email, password });
    console.log(res);
    await dispatch(loginSuccess(res.data));

  } catch (err) {
    console.log("Error",err)

    dispatch(authError(err.response.data.error));
  }
};

// Logout User
export const logout = () => async (dispatch) => {
  dispatch(logoutSuccess());
};
