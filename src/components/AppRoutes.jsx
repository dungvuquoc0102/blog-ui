import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";

import AppLayout from "../layouts/AppLayout/AppLayout";
import FullscreenLayout from "../layouts/FullscreenLayout/FullscreenLayout";
import AuthLayout from "../layouts/AuthLayout/AuthLayout";
import Loading from "./Loading/Loading";
import ErrorBoundary from "./ErrorBoundary/ErrorBoundary";
import VerifyEmailNotice from "@/pages/VerifyEmailNotice/VerifyEmailNotice";
import VerifyEmailConfirm from "@/pages/VerifyEmailConfirm/VerifyEmailConfirm";

// Lazy load pages for better performance
const Home = lazy(() => import("../pages/Home/Home"));
const Topic = lazy(() => import("../pages/Topic/Topic"));
const TopicsListing = lazy(() =>
  import("../pages/TopicsListing/TopicsListing")
);
const BlogDetail = lazy(() => import("../pages/BlogDetail/BlogDetail"));
const Profile = lazy(() => import("../pages/Profile/Profile"));
const EditProfile = lazy(() => import("../pages/EditProfile/EditProfile"));
const MyPosts = lazy(() => import("../pages/MyPosts/MyPosts"));
const WritePost = lazy(() => import("../pages/WritePost/WritePost"));
const Bookmarks = lazy(() => import("../pages/Bookmarks/Bookmarks"));
const DirectMessages = lazy(() =>
  import("../pages/DirectMessages/DirectMessages")
);
const Settings = lazy(() => import("../pages/Settings/Settings"));
const Login = lazy(() => import("../pages/Login/Login"));
const Register = lazy(() => import("../pages/Register/Register"));
const ForgotPassword = lazy(() =>
  import("../pages/ForgotPassword/ForgotPassword")
);
const ResetPassword = lazy(() =>
  import("../pages/ResetPassword/ResetPassword")
);
const NotFound = lazy(() => import("../pages/NotFound/NotFound"));

const AppRoutes = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading fullscreen />}>
        <Routes>
          {/* App Layout Routes */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="topics" element={<TopicsListing />} />
            <Route path="topics/:slug" element={<Topic />} />
            <Route path="blog/:slug" element={<BlogDetail />} />
            <Route path="profile/:username" element={<Profile />} />
            <Route path="profile/:username/edit" element={<EditProfile />} />
            <Route path="my-posts" element={<MyPosts />} />
            <Route path="bookmarks" element={<Bookmarks />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Fullscreen Layout Routes */}
          <Route path="/" element={<FullscreenLayout />}>
            <Route path="write" element={<WritePost />} />
            <Route path="write/:slug" element={<WritePost />} />
            <Route path="messages" element={<DirectMessages />} />
          </Route>

          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="verify-email" element={<VerifyEmailNotice />} />
            <Route
              path="verify-email/confirm"
              element={<VerifyEmailConfirm />}
            />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default AppRoutes;
