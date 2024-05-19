import { useState } from 'react';
import PropTypes from 'prop-types';

function Login({ onLogin }) {
  const [nickname, setNickname] = useState('');
  const [fullname, setFullname] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onLogin(nickname, fullname);
  };

  return (
    <div className="user-form">
      <h2>Enter Chatroom</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="nickname">Nickname:</label>
        <input
          type="text"
          id="nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
        />
        <label htmlFor="fullname">Real Name:</label>
        <input
          type="text"
          id="fullname"
          value={fullname}
          onChange={(e) => setFullname(e.target.value)}
          required
        />
        <button type="submit">Enter Chatroom</button>
      </form>
    </div>
  );
}

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

export default Login;
