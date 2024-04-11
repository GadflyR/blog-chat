import { useEffect, useState } from 'react';
import '../App.css';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase-config';
import { useNavigate } from 'react-router-dom';

function CreatePost(isAuth) {
  const [title, setTitle] = useState("");
  const [postText, setPostText] = useState("");

  const postsCollectionRef = collection(db, "posts");
  let navigate = useNavigate();
  const CreatePost = async () => {
    await addDoc(postsCollectionRef, {
      title, 
      postText, 
      author: {name: auth.currentUser.displayName, id: auth.currentUser.uid},
      createdAt: serverTimestamp(),
    });
    navigate("/");
  };

  useEffect(() => {
    if (!isAuth) {
      navigate("/login");
    }
  }, []);

  return (<div className='createPostPage'>
    <div className='cpContainer'>
      <h1>Create A Post</h1>
      <div className='inputGp'></div>
        <label>Title:</label>
        <input placeholder='Title...' onChange={(event) => {
          setTitle(event.target.value);
        }} />
      <div className='inputGp'>
        <label>Post:</label>
        <textarea placeholder='Post...' onChange={(event) => {
          setPostText(event.target.value);
        }} />
      </div>
      <button onClick={CreatePost}>Submit Post</button>
    </div>
  </div>);
};

export default CreatePost;
