import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes, ScrollToTop, ErrorBoundary } from "./components";
import "./styles/index.scss";
import { Provider } from "react-redux";
import { store } from "./store/store";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <Provider store={store}>
      <BrowserRouter>
        <ScrollToTop>
          <AppRoutes />
        </ScrollToTop>
      </BrowserRouter>
    </Provider>
  </ErrorBoundary>
);
