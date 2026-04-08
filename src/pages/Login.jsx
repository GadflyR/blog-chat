import { signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, provider } from '../firebase-config';

function Login({ setIsAuth }) {
  const navigate = useNavigate();

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, provider);
    localStorage.setItem('isAuth', 'true');
    setIsAuth(true);
    navigate('/upload');
  };

  return (
    <main className='loginPage'>
      <div className='loginCard'>
        <h1>Creator Login</h1>
        <p>Viewers can browse freely. Sign in only when you want to upload.</p>
        <button className='googleBtn' onClick={signInWithGoogle}>
          Sign in with Google
        </button>
      </div>
    </main>
  );
}

export default Login;
