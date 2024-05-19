import  { useState } from 'react';
import LoginPage from './components/login';
import ChatPage from './components/chatPage';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (nickname, fullname) => {
    setUser({ nickname, fullname });
  };

  return (
    <div className="App">
      {user ? (
        <ChatPage user={user} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
