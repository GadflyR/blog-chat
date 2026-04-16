import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { auth, db, storage } from '../firebase-config';
import { profileSeedPhotos } from '../profileSeed';

const adminEmailsFromEnv = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const ADMIN_EMAILS = adminEmailsFromEnv.length
  ? adminEmailsFromEnv
  : ['ottomanhabsburg@gmail.com'];

function Home() {
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [deletingId, setDeletingId] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = useMemo(() => {
    if (!currentUser?.email) return false;
    return ADMIN_EMAILS.includes(currentUser.email.toLowerCase());
  }, [currentUser]);

  useEffect(() => {
    const ensureSeedPhotosInBackend = async () => {
      await Promise.all(
        profileSeedPhotos.map(async (seed) => {
          const seedRef = doc(db, 'gallery', seed.id);
          const existing = await getDoc(seedRef);

          if (!existing.exists()) {
            await setDoc(seedRef, {
              title: seed.title || '',
              caption: seed.caption || '',
              imageUrl: seed.imageUrl,
              isSeed: true,
              createdAt: Timestamp.fromDate(new Date('2026-01-01T00:00:00Z')),
            });
          }
        })
      );
    };

    const getPhotos = async () => {
      try {
        await ensureSeedPhotosInBackend();

        const photosCollectionRef = collection(db, 'gallery');
        const q = query(photosCollectionRef, orderBy('createdAt', 'desc'));
        const data = await getDocs(q);
        setPhotos(data.docs.map((item) => ({ id: item.id, ...item.data() })));
      } catch (err) {
        setError('Could not load photos right now.');
      } finally {
        setIsLoading(false);
      }
    };

    getPhotos();
  }, []);

  const deletePhoto = async (photo) => {
    const shouldDelete = window.confirm('Delete this photo? This cannot be undone.');
    if (!shouldDelete) return;

    try {
      setDeletingId(photo.id);

      if (photo.storagePath) {
        try {
          await deleteObject(ref(storage, photo.storagePath));
        } catch (_) {
          // File may already be missing; still remove Firestore doc.
        }
      }

      await deleteDoc(doc(db, 'gallery', photo.id));
      setPhotos((prev) => prev.filter((item) => item.id !== photo.id));
    } catch (err) {
      setError('Could not delete this photo. Try again.');
    } finally {
      setDeletingId('');
    }
  };

  const editPhoto = async (photo) => {
    const nextTitle = window.prompt('Edit title (optional):', photo.title || '');
    if (nextTitle === null) return;

    const nextCaption = window.prompt('Edit caption (optional):', photo.caption || '');
    if (nextCaption === null) return;

    try {
      await updateDoc(doc(db, 'gallery', photo.id), {
        title: nextTitle.trim(),
        caption: nextCaption.trim(),
      });

      setPhotos((prev) =>
        prev.map((item) =>
          item.id === photo.id ? { ...item, title: nextTitle.trim(), caption: nextCaption.trim() } : item
        )
      );
    } catch (err) {
      setError('Could not edit this photo. Try again.');
    }
  };

  return (
    <main className='galleryPage'>
      <section className='hero'>
        <h1>An Archive</h1>
      </section>

      {isLoading && <p className='statusText'>Loading gallery...</p>}
      {error && <p className='statusText error'>{error}</p>}

      {!isLoading && !error && photos.length === 0 && (
        <p className='statusText'>No photos yet. Upload your first one.</p>
      )}

      <section className='galleryGrid'>
        {photos.map((photo) => {
          const hasMeta = Boolean(photo.title || photo.caption);

          return (
            <article className='photoCard' key={photo.id}>
              {currentUser && isAdmin && (
                <div className='photoCardActions'>
                  <button className='editPhotoBtn' onClick={() => editPhoto(photo)}>
                    Edit
                  </button>
                  <button
                    className='deletePhotoBtn'
                    onClick={() => deletePhoto(photo)}
                    disabled={deletingId === photo.id}
                  >
                    {deletingId === photo.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              )}

              <img src={photo.imageUrl} alt={photo.title || 'Gallery photo'} loading='lazy' />

              {hasMeta && (
                <div className='photoMeta'>
                  {photo.title && <h2>{photo.title}</h2>}
                  {photo.caption && <p>{photo.caption}</p>}
                </div>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}

export default Home;
