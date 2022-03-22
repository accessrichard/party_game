import React, { useEffect, useRef, useState } from 'react';
import {
  channelJoin,
  channelOn,
  channelPush,
} from '../phoenix/phoenixMiddleware';
import { useDispatch, useSelector } from 'react-redux';

import Players from '../game/Players';
import { SOCKET_CONNECTED } from '../phoenix/phoenixMiddleware';
import { message } from './chatSlice';

const onEvents = (topic) => [
  {
    event: 'chat',
    dispatcher: message(),
    topic,
  }
]

const typingEvent = (topic, isTyping) => {
  return {
    topic: topic,
    event: "user:typing", 
    data: { typing: isTyping }
  }
}

const Chat = () => {
  const dispatch = useDispatch();
  const messages = useSelector(state => state.chat.messages);
  const chatBottomRef = useRef(null);
  const player = useSelector(state => state.game.playerName);
  const gameCode = useSelector(state => state.game.gameCode);
  const socketStatus = useSelector(state => state.phoenix.socket.status);
  const [text, setText] = useState("");
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const topic = `chat:${gameCode}`
  const presence = `game:${gameCode}`

  useEffect(() => {
    chatBottomRef.current.scrollTop = chatBottomRef.current.scrollHeight + window.innerHeight;
  });

  useEffect(() => {
    if (socketStatus !== SOCKET_CONNECTED || isSubscribed) {
      return;
    }
    
    setIsSubscribed(true);
    dispatch(channelJoin({ topic, data: { playerName: player } }));
    onEvents(topic).forEach((e) => dispatch(channelOn(e)));
  }, [socketStatus, dispatch, topic, player, isSubscribed]);

  function send() {
    dispatch(channelPush({
      topic,
      event: topic,
      data: {
        message: text,
        player,
        time: new Date().toLocaleTimeString()
      }
    }));

    setText("");
  }

  function onKeyPress(e) {
    if (e.key === 'Enter' && text.trim() !== '') {
      send();
      setIsUserTyping(false);
    }

    if (isUserTyping) {
      return;
    }

    setIsUserTyping(true);
    dispatch(channelPush(typingEvent(presence, true)));

    setTimeout(() => {
      dispatch(channelPush(typingEvent(presence, false)));
      setIsUserTyping(false);
    }, 2500);
  }

  return (
    <React.Fragment>

      <div className='flex-grid center-65'>
        <div className='flex-item flex-2-col-sidebar '>
          <div className='item card '>
            <h3>Players</h3>
            <div className='player-container'>
              <Players />
            </div>
          </div>
        </div>
        <div className='flex-item flex-2-col-main'>
          <div className='item card'>
            <h3>Chat</h3>
            <div className="chat-container" ref={chatBottomRef}>
              <ul className="ul-nostyle">
                {messages.map((message, key) =>
                  <li key={key} className={`pd-5-lr text-align-${message.align}`}>
                    <span className="bolder">{message.message}</span>
                    <div className="smallest-font">
                      <span>{message.time} - {message.player === player ? "Me" : player}</span>
                    </div>
                  </li>
                )}
              </ul>
            </div>
            <div>
              <form noValidate onSubmit={(e) => e.preventDefault()}>
                <div className="group">
                  <input
                    autoComplete="off"
                    name="chat-input"
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    onKeyPress={onKeyPress}
                  />
                  <span className="highlight"></span>
                  <span className="bar"></span>
                  <label>Send Message</label>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment >
  );
}

export default Chat;
