import React, { useEffect, useRef, useState } from 'react';
import {
  channelJoin,
  channelLeave,
  channelOff,
  channelOn,
  channelPush,
} from '../phoenix/phoenixMiddleware';
import { useDispatch, useSelector } from 'react-redux';

import Players from '../game/Players';
import { message } from './chatSlice';

const onEvents = (topic) => [
  {
    event: 'chat',
    dispatcher: message(),
    topic,
  }
]

const Chat = () => {
  const dispatch = useDispatch();
  const messages = useSelector(state => state.chat.messages);


  const chatBottomRef = useRef(null);
  const player = useSelector(state => state.game.playerName);
  const gameCode = useSelector(state => state.game.gameCode);
  const socketStatus = useSelector(state => state.phoenix.socket.status);
  const [text, setText] = useState("");
  const topic = `chat:${gameCode}`

  useEffect(() => {
    chatBottomRef.current.scrollTop = chatBottomRef.current.scrollHeight + window.innerHeight;
  });

  useEffect(() => {
    if (socketStatus === "SOCKET_CONNECTED") {
      dispatch(channelJoin({ topic, data: { playerName: player } }));
    }
    return () => dispatch(channelLeave({ topic }));
  }, [socketStatus, dispatch, topic, player]);

  useEffect(() => {
    if (socketStatus === "SOCKET_CONNECTED") {
      onEvents(topic).forEach((e) => dispatch(channelOn(e)));
    }

    return () => onEvents(topic).forEach((e) => dispatch(channelOff(e)));
  }, [socketStatus, dispatch, topic]);

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

  function submitOnEnter(e) {
    if (e.key === 'Enter' && text.trim() !== '') {
      send();
    }
  }

  return (
    <React.Fragment>

      <div className='flex-grid border-box center-65'>
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
                  <li key={key} className={`text-align-${message.align}`}>
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
                    onKeyPress={submitOnEnter}
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
