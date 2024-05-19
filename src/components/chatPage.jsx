import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes for prop type validation
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

function ChatPage({ user }) {
  const { nickname, fullname } = user;
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const chatAreaRef = useRef(null);

  let stompClient = useRef(null);

  useEffect(() => {
    connect();

    return () => {
      if (stompClient.current) {
        stompClient.current.disconnect();
      }
    };
  }, []);

  const connect = () => {
    const socket = new SockJS('/ws');
    stompClient.current = new Client(); // Use the Client object
    stompClient.current.webSocketFactory = () => socket;
    stompClient.current.activate();
    stompClient.current.onConnect = onConnected;
    stompClient.current.onStompError = onError;
  };

  const onConnected = () => {
    stompClient.current.subscribe(`/user/${nickname}/queue/messages`, onMessageReceived);
    stompClient.current.subscribe(`/user/public`, onMessageReceived);

    stompClient.current.publish({
      destination: '/app/user.addUser',
      body: JSON.stringify({ nickName: nickname, fullName: fullname, status: 'ONLINE' }),
    });

    fetchConnectedUsers();
  };

  const fetchConnectedUsers = async () => {
    const response = await fetch('/users');
    const users = await response.json();
    setConnectedUsers(users.filter((user) => user.nickName !== nickname));
  };

  const onError = (error) => {
    console.error('Could not connect to WebSocket server. Please refresh this page to try again!', error);
  };

  const onMessageReceived = async (payload) => {
    fetchConnectedUsers();
    const message = JSON.parse(payload.body);
    if (selectedUser && selectedUser.nickName === message.senderId) {
      setMessages((prevMessages) => [...prevMessages, message]);
      scrollToBottom();
    }
  };

  const sendMessage = (event) => {
    event.preventDefault();
    if (messageInput.trim() && stompClient.current) {
      const chatMessage = {
        senderId: nickname,
        recipientId: selectedUser.nickName,
        content: messageInput.trim(),
        timestamp: new Date(),
      };
      stompClient.current.publish({
        destination: '/app/chat',
        body: JSON.stringify(chatMessage),
      });
      setMessages((prevMessages) => [...prevMessages, chatMessage]);
      setMessageInput('');
      scrollToBottom();
    }
  };

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    const response = await fetch(`/messages/${nickname}/${user.nickName}`);
    const userMessages = await response.json();
    setMessages(userMessages);
    scrollToBottom();
  };

  const scrollToBottom = () => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  };

  return (
    <div className="chat-container">
      <div className="users-list">
        <div className="users-list-container">
          <h2>Online Users</h2>
          <ul>
            {connectedUsers.map((user) => (
              <li
                key={user.nickName}
                className={`user-item ${selectedUser && selectedUser.nickName === user.nickName ? 'active' : ''}`}
                onClick={() => handleUserClick(user)}
              >
                <img src="../img/user_icon.png" alt={user.fullName} />
                <span>{user.fullName}</span>
                <span className="nbr-msg hidden">0</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p>{fullname}</p>
          <button onClick={() => window.location.reload()}>Logout</button>
        </div>
      </div>

      <div className="chat-area">
        <div className="chat-area" id="chat-messages" ref={chatAreaRef}>
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.senderId === nickname ? 'sender' : 'receiver'}`}>
              <p>{msg.content}</p>
            </div>
          ))}
        </div>

        {selectedUser && (
          <form id="messageForm" onSubmit={sendMessage}>
            <div className="message-input">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type your message..."
                autoComplete="off"
              />
              <button type="submit">Send</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ChatPage.propTypes = {
//   user: PropTypes.shape({
//     nickname: PropTypes.string.isRequired,
//     fullname: PropTypes.string.isRequired,
//   }).isRequired,
// };

export default ChatPage;
