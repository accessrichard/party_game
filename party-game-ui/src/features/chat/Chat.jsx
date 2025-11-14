import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Players from './Players';
import { channelPush } from '../phoenix/phoenixMiddleware';

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
  const player = useSelector(state => state.lobby.playerName);
  const gameCode = useSelector(state => state.lobby.gameCode);
  const [text, setText] = useState("");
  const [isUserTyping, setIsUserTyping] = useState(false);

  const topic = `lobby:${gameCode}`  

  useEffect(() => {
    chatBottomRef.current.scrollTop = chatBottomRef.current.scrollHeight + window.innerHeight;
  });

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

  function onChange(e) {
    setText(e.target.value);

    if (isUserTyping) {
      return;
    }
    
    setIsUserTyping(true);
    dispatch(channelPush(typingEvent(topic, true)));

    setTimeout(() => {
      dispatch(channelPush(typingEvent(topic, false)));
      setIsUserTyping(false);
    }, 1000 * 2);
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && text.trim() !== '') {
      send();
      setIsUserTyping(false);
    }
  }

  return (
    <>
      <div className='flex-grid center-65'>
        <div className='flex-item flex-2-col-sidebar '>
          <div className='item card '>
            <h3>Players</h3>
            <div className='height-275 auto-scroll'>
              <Players />
            </div>
          </div>
        </div>
        <div className='flex-item flex-2-col-main'>
          <div className='item card'>
            <h3>Chat</h3>
            <div className="height-200 auto-scroll" ref={chatBottomRef}>
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
              <form className='form' noValidate onSubmit={(e) => e.preventDefault()}>
                <div className="group">
                  <input
                    autoComplete="off"
                    name="chat-input"
                    value={text}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
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
    </>
  );
}

export default Chat;
