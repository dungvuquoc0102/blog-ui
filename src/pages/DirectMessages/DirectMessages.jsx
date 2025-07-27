import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import FallbackImage from "../../components/FallbackImage/FallbackImage";
import styles from "./DirectMessages.module.scss";
import socketClient from "@/utils/socketClient";
import { get, post } from "@/utils/httpRequest";
import { useSelector } from "react-redux";

const DirectMessages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const messagesEndRef = useRef(null);
  const [currentMessages, setCurrentMessages] = useState([]);
  const { user } = useSelector((state) => state.user);

  const [conversations, setConversations] = useState([
    {
      id: 1,
      participant: {
        id: 2,
        name: "Sarah Chen",
        username: "sarahc",
        avatar:
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face",
      },
      lastMessage: {
        content: "Hey! Did you see the latest blog post about React hooks?",
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
        senderId: 2,
      },
      participants: [],
      unreadCount: 2,
      isOnline: true,
    },
    {
      id: 2,
      participant: {
        id: 3,
        name: "Alex Johnson",
        username: "alexj",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
      },
      lastMessage: {
        content: "Thanks for the feedback on my article!",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        senderId: 1,
      },
      participants: [],

      unreadCount: 0,
      isOnline: false,
    },
    {
      id: 3,
      participant: {
        id: 4,
        name: "Emily Davis",
        username: "emilyd",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face",
      },
      lastMessage: {
        content: "Would love to collaborate on a project!",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        senderId: 4,
      },
      participants: [],

      unreadCount: 1,
      isOnline: true,
    },
  ]);

  const [messages, setMessages] = useState({
    1: [
      {
        id: 1,
        content:
          "Hi! I really enjoyed your latest post about TypeScript best practices.",
        senderId: 2,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: 2,
        content:
          "Thank you! I'm glad you found it helpful. Are you using TypeScript in your projects?",
        senderId: 1,
        timestamp: new Date(Date.now() - 90 * 60 * 1000),
      },
      {
        id: 3,
        content:
          "Yes, we just migrated our entire React app to TypeScript. The type safety is amazing!",
        senderId: 2,
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
      },
      {
        id: 4,
        content: "Hey! Did you see the latest blog post about React hooks?",
        senderId: 2,
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
      },
    ],
    2: [
      {
        id: 5,
        content: "Thanks for the feedback on my article!",
        senderId: 1,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    ],
    3: [
      {
        id: 6,
        content: "Would love to collaborate on a project!",
        senderId: 4,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    ],
  });

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      const res = await get("/conversations");
      setConversations(res.data);
    };
    fetchConversations();
  }, []);

  // Fetch messages of a conversation
  const fetchMessages = async (conversationId) => {
    const res = await get(`/messages?conversationId=${conversationId}`);
    setMessages((prev) => ({ ...prev, [conversationId]: res.data }));
  };

  // Render selected conversation and messages from query params
  useEffect(() => {
    const conversationId = searchParams.get("conversation");
    if (conversationId) {
      const conversation = conversations.find(
        (c) => c.id === parseInt(conversationId)
      );
      if (conversation) {
        setSelectedConversation(conversation);
        fetchMessages(conversation.id);
      }
    }
  }, [searchParams, conversations, selectedConversation]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedConversation, currentMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // const markAsRead = (conversationId) => {
  //   setConversations((prev) =>
  //     prev.map((conv) =>
  //       conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
  //     )
  //   );
  // };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    setSearchParams({ conversation: conversation.id.toString() });
  };

  const handleSendMessage = async () => {
    if (
      !newMessage.trim() ||
      (newMessage.trim() && !selectedConversation && !receiver)
    )
      return;

    let payload;
    if (selectedConversation) {
      payload = {
        conversationId: selectedConversation.id,
        content: newMessage.trim(),
      };
    } else if (receiver) {
      payload = {
        receiverId: receiver.id,
        content: newMessage.trim(),
      };
    }

    const res = await post("/messages/send", payload);

    // const resolvedConversationId = res.data.conversationId;
    // setMessages((prev) => ({
    //   ...prev,
    //   [resolvedConversationId.id]: [
    //     ...(prev[resolvedConversationId.id] || []),
    //     res.data,
    //   ],
    // }));
    // setCurrentMessages((prev) => [...prev, res.data]);

    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    date = new Date(date);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date?.toLocaleDateString();
  };

  // Filter conversations:
  // Name's conversation
  // Username of participants
  // Content of messsages
  useEffect(() => {
    // Have conversations and searchQuery
    // ...
    setFilteredConversations(conversations);
  }, [searchQuery, conversations]);

  // Set message list of selected conversation
  useEffect(() => {
    setCurrentMessages((prev) =>
      selectedConversation ? [...messages[selectedConversation.id]] || [] : []
    );
  }, [selectedConversation, messages]);

  // Subscribe to Soketi
  useEffect(() => {
    const channelName = selectedConversation
      ? `private-chat-${selectedConversation.id}`
      : null;
    if (!channelName) return;

    const channel = socketClient.subscribe(channelName);

    channel.bind("new-message", (data) => {
      setCurrentMessages((prev) => [...prev, data]);
    });

    return () => {
      socketClient.unsubscribe(channelName);
    };
  }, [selectedConversation]);

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        {/* Conversations Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h1 className={styles.title}>Messages</h1>
            <Button
              variant="ghost"
              size="sm"
              className={styles.newMessageButton}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </Button>
          </div>

          <div className={styles.searchSection}>
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.conversationsList}>
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`${styles.conversationItem} ${
                  selectedConversation?.id === conversation.id
                    ? styles.selected
                    : ""
                }`}
                onClick={() => handleConversationSelect(conversation)}
              >
                <div className={styles.avatarContainer}>
                  <FallbackImage
                    src={
                      conversation.participants.length === 2
                        ? conversation.participants.find(
                            (c) => c.id !== user.id
                          ).avatar
                        : "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face"
                    }
                    alt={
                      conversation.participants.length === 2
                        ? conversation.participants.find(
                            (c) => c.id !== user.id
                          ).username
                        : "Sarah Chen"
                    }
                    className={styles.avatar}
                  />
                  {conversation.participant?.isOnline && (
                    <div className={styles.onlineIndicator} />
                  )}
                </div>

                <div className={styles.conversationContent}>
                  <div className={styles.conversationHeader}>
                    <span className={styles.participantName}>
                      {conversation.participants.length === 2
                        ? conversation.participants.find(
                            (c) => c.id !== user.id
                          ).username
                        : "Sarah Chen"}
                    </span>
                    <span className={styles.timestamp}>
                      {formatTime(conversation.lastMessage?.timestamp)}
                    </span>
                  </div>
                  <div className={styles.lastMessage}>
                    <span className={styles.messageText}>
                      {conversation.lastMessage?.content}
                    </span>
                    {conversation.unreadCount > 0 && (
                      <span className={styles.unreadBadge}>
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Messages Area */}
        <div className={styles.messagesArea}>
          {selectedConversation ? (
            <>
              {/* Messages Header */}
              <div className={styles.messagesHeader}>
                <div className={styles.participantInfo}>
                  <FallbackImage
                    src={
                      selectedConversation.participants.length === 2
                        ? selectedConversation.participants.find(
                            (c) => c.id !== user.id
                          ).avatar
                        : "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face"
                    }
                    alt={
                      selectedConversation.participants.length === 2
                        ? selectedConversation.participants.find(
                            (c) => c.id !== user.id
                          ).username
                        : "Conversation Name..."
                    }
                    className={styles.headerAvatar}
                  />
                  <div>
                    <h2 className={styles.participantName}>
                      {selectedConversation.participants.length === 2
                        ? selectedConversation.participants.find(
                            (u) => u.id !== user.id
                          ).username
                        : "Conversation Name..."}
                    </h2>
                    <span className={styles.participantStatus}>
                      {selectedConversation.isOnline
                        ? selectedConversation.isOnline
                          ? "Online"
                          : "Offline"
                        : "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages Thread */}
              <div className={styles.messagesThread}>
                {currentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`${styles.message} ${
                      message.userId === user.id ? styles.sent : styles.received
                    }`}
                  >
                    <div className={styles.messageContent}>
                      <span className={styles.messageText}>
                        {message.content}
                      </span>
                      <span className={styles.messageTime}>
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className={styles.messageInputContainer}>
                <div className={styles.messageInputWrapper}>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message ${selectedConversation.participant.name}...`}
                    className={styles.messageInput}
                    rows={1}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className={styles.sendButton}
                    size="sm"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateContent}>
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={styles.emptyIcon}
                >
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                <h3 className={styles.emptyTitle}>Select a conversation</h3>
                <p className={styles.emptyDescription}>
                  Choose a conversation from the sidebar to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectMessages;
