import { useEffect, useState } from 'react';
import '../App.css';
import { getDocs, collection, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { db, auth } from '../firebase-config';

function Home({isAuth}) {
  const [postLists, setPostList] = useState([]);
  const postsCollectionRef = collection(db, "posts");


  useEffect(() => {
    const getPosts = async() => {
      const q = query(postsCollectionRef, orderBy('createdAt', 'desc'));
      const data = await getDocs(q);
      setPostList(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };

    getPosts();
  }, []);

  const deletePost = async (id) => {
    const postDoc = doc(db, "posts", id);
    await deleteDoc(postDoc);
    setPostList(currentPosts => currentPosts.filter(post => post.id !== id));
  }
  return (
    <div className='homePage'>
      {postLists.map((post) => (
        <div className='post' key={post.id}>
          <div className='postHeader'>
            <div className='title'>
              <h1>{post.title}</h1>
            </div>
            <div className='deletePost'>
              {isAuth && post.author.id === auth.currentUser.uid && (
                <button onClick={() => {
                  deletePost(post.id)
                }}>x</button>)}
            </div>
          </div>
          <div className='postTextContainer'>{post.postText}</div>
          <h3>@{post.author.name}</h3>
        </div>
    ))}
    </div>
  );
}

export default Home;