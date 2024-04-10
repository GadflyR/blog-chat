import './ChatRoom.css';
import React, { useState, useRef } from 'react';

import { collection, query, orderBy, serverTimestamp, addDoc  } from 'firebase/firestore';

import { db as firestore, auth } from '../firebase-config'

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import { useNavigate } from 'react-router-dom';


function App() {
  const [user] = useAuthState(auth);
  let navigate = useNavigate();

  return (
    <>
      <div>
        <header>
          <h1>ChatRoom</h1>
        </header>

        <section>
          {user ? <ChatRoom /> : navigate("/login")}
        </section>
      </div>
    </>
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = collection(firestore, 'messages');
  const q = query(messagesRef, orderBy('createdAt'));
  const [messages] = useCollectionData(q, { idField: 'id' });
  const [formValue, setFormValue] = useState('');
  const sendMessage = async(e) => {
    e.preventDefault();
    
    if (!formValue.trim()) {
      alert('Can not send empty message!');
      return;
    }
      
    const {uid, photoURL} = auth.currentUser;

    await addDoc(messagesRef, {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue('');

    dummy.current.scrollIntoView({behavior: 'smooth'});
  }

  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy}></div>
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder='your message...' />
        <button type="submit">Send</button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt="User avatar" />
      <p>{text}</p>
    </div>
  )
}

export default App;
