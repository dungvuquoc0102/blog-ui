import PusherJS from "pusher-js";

let socketClient = new PusherJS("app1", {
  cluster: "",
  wsHost: "103.20.96.192",
  wsPort: 6001,
  forceTLS: false,
  encrypted: false,
  disableStats: true,
  enabledTransports: ["ws", "wss"],
  authEndpoint: "http://localhost:3000/api/v1/pusher/auth",
  auth: {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  },
});

export default socketClient;
