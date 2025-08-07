import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { get, post } from "@/utils/httpRequest"; // hoặc axios instance

// Async thunk để gọi API /auth/me
export const fetchUser = createAsyncThunk(
  "user/fetchUser",
  async (_, thunkAPI) => {
    try {
      const userInfo = await get("/auth/me");
      return userInfo;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Lỗi khi lấy thông tin user"
      );
    }
  }
);

export const logout = createAsyncThunk(
  "user/logout",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { refreshToken } = getState().user;

      if (refreshToken) {
        await post("/auth/logout", { refreshToken: refreshToken });
      }

      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Logout thất bại"
      );
    }
  }
);

export const login = createAsyncThunk(
  "user/login",
  async ({ email, password, rememberMe }, { dispatch, rejectWithValue }) => {
    try {
      const tokenData = await post("/auth/login", {
        email,
        password,
        rememberMe,
      });

      return {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
      };
    } catch (error) {
      console.dir(error);

      return rejectWithValue(error || "Login failed");
    }
  }
);

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  status: "idle",
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setAuthData: (state, action) => {
      console.log(action.payload);
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = "failed";
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.status = "idle";
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(login.pending, (state) => {
        state.status = "loading";
      })
      .addCase(login.fulfilled, (state, action) => {
        localStorage.setItem("accessToken", action.payload.accessToken);
        if (action.payload.refreshToken) {
          localStorage.setItem("refreshToken", action.payload.refreshToken);
        }

        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { setAuthData } = userSlice.actions;

export default userSlice.reducer;
