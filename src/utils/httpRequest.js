import axios from "axios";

const httpRequest = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
httpRequest.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

httpRequest.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi là 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => {
              resolve(httpRequest(originalRequest));
            },
            reject: (err) => reject(err),
          });
        });
      }

      isRefreshing = true;

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
          {
            refreshToken,
          }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          res.data;

        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        processQueue(null);

        return httpRequest(originalRequest);
      } catch (err) {
        processQueue(err);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // Nếu không phải lỗi 401
    return Promise.reject(error.response?.data || error);
  }
);
const send = async (method, url, data = {}, config = {}) => {
  try {
    const response = await httpRequest({
      method,
      url,
      ...(method === "get" || method === "delete" ? {} : { data }),
      ...config,
    });
    return response;
  } catch (error) {
    console.error(`Lỗi ở file httpRequest:`, error.message || error);
    throw new Error("Có lỗi xảy ra khi gửi request tới server");
  }
};

export const get = (url, config) => send("get", url, null, config);
export const post = (url, data, config) => send("post", url, data, config);
export const put = (url, data, config) => send("put", url, data, config);
export const patch = (url, data, config) => send("patch", url, data, config);
export const del = (url, config) => send("delete", url, null, config);

export default httpRequest;
