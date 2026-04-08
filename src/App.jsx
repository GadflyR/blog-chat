import './App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';
import { signOut } from 'firebase/auth';
import Home from './pages/Home';
import CreatePost from './pages/CreatePost';
import Login from './pages/Login';
import { auth } from './firebase-config';

function App() {
  const [isAuth, setIsAuth] = useState(localStorage.getItem('isAuth') === 'true');

  const signUserOut = async () => {
    await signOut(auth);
    localStorage.removeItem('isAuth');
    setIsAuth(false);
    window.location.pathname = '/';
  };

  return (
    <BrowserRouter>
      <div className='appShell'>
        <nav>
          <div className='brand'>
            <Link to='/'>sean's gallery</Link>
          </div>

          <div className='navLinks'>
            {isAuth ? (
              <>
                <Link to='/upload'>Upload</Link>
                <button onClick={signUserOut}>Log Out</button>
              </>
            ) : (
              <Link to='/login'>Login</Link>
            )}
          </div>
        </nav>

        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/upload' element={<CreatePost isAuth={isAuth} />} />
          <Route path='/login' element={<Login setIsAuth={setIsAuth} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
