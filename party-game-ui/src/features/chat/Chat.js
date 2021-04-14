import React, { useEffect, useRef, useState } from 'react';
import {
  channelJoin,
  channelLeave,
  channelOff,
  channelOn,
  channelPush,
} from '../phoenix/phoenixMiddleware';
import { useDispatch, useSelector } from 'react-redux';

import Emphasize from '../common/EmphasizeDark';
import SmallText from '../common/SmallText';
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
      <div className="card card-50vh flex-container scroll-flex">
        <div className="flex-1 chat-container hidden-overflow" ref={chatBottomRef}>
          <ul className="ul-nostyle">
            {messages.map((message, key) =>
              <li key={key} className={`align-${message.align} pd-5`}>
                <span className="typography-darker typography-md-text">{message.message}</span>
                <SmallText>
                  {message.player === player ?
                    <Emphasize>
                      {message.time} - {message.player}
                    </Emphasize>
                    : <span>{message.time} -{message.player}</span>}
                </SmallText>
              </li>
            )}
          </ul>
          <form className="pd-0 md-0 lg-12 " onSubmit={(e) => e.preventDefault()}>
            <input type="text"
              className="lg-12 chat-input"
              label="Type Something"
              autoComplete="off"
              placeholder="Send message"
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyPress={submitOnEnter}
            />
          </form>
        </div>
      </div>
    </React.Fragment>
  );
}

export default Chat;
