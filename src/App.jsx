import './App.css';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import ChatRoom from "./pages/ChatRoom"
import CreatePost from "./pages/CreatePost"
import Home from "./pages/Home"
import Login from "./pages/Login"
import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from './firebase-config';

function App() {
  const [isAuth, setIsAuth] = useState(localStorage.getItem("isAuth") === "true");

  const signUserOut = () => {
    signOut(auth).then(() => {
      localStorage.clear();
      setIsAuth(false);
      window.location.pathname = "/login";
    });
  };

  return (
    <BrowserRouter>
      <nav>
        <Link to="/"> Home </Link>
        {!isAuth ? (
          <Link to="/login"> Login </Link>
        ) : (
          <>
            <Link to="/createpost">Create Post</Link>
            <Link to="/chat"> Chat Room </Link>
            <button onClick={signUserOut}>Log Out</button>
          </>
        )}
      </nav>
      <Routes>
        <Route path='/' element={<Home isAuth={isAuth} />} />
        <Route path='/chat' element={<ChatRoom />} />
        <Route path='/createpost' element={<CreatePost isAuth={isAuth} />} />
        <Route path='/login' element={<Login setIsAuth={setIsAuth} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;