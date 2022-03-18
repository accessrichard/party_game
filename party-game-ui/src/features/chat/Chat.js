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

      <div className='flex-container card center-65'>
        <div className='flex-row scroll-flex'>
          <div className='flex-column portrait card-30h sidebar card-light margin-port-land'>
            <h3>Players</h3>
            <Players />
          </div>

          <div className='flex-column portrait card-light card-30h scroll-flex hidden-overflow'>
            <div className="chat-container" ref={chatBottomRef}>
              <h3>Chat</h3>
              <ul className="ul-nostyle">
                {messages.map((message, key) =>
                  <li key={key} className={`text-align-${message.align}`}>
                    <span className={message.player === player ? "" : "bolder"}>{message.message}</span>
                    <div className="smallest-font">
                      <span>{message.time} - {message.player === player ? "Me" : player}</span>
                    </div>
                  </li>
                )}
              </ul>

              <form className="medium-width pd-0 md-0" noValidate onSubmit={(e) => e.preventDefault()}>
                <div className="chat-group">
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
    </React.Fragment>
  );
}

export default Chat;
