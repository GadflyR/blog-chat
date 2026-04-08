import { useEffect, useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebase-config';

function CreatePost({ isAuth }) {
  const [imageItems, setImageItems] = useState([]);
  const [singleTitle, setSingleTitle] = useState('');
  const [singleCaption, setSingleCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuth) {
      navigate('/login');
    }
  }, [isAuth, navigate]);

  useEffect(() => {
    return () => {
      imageItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [imageItems]);

  const onFilesChange = (event) => {
    const files = Array.from(event.target.files || []);

    imageItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));

    const nextItems = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      title: '',
      caption: '',
    }));

    setImageItems(nextItems);
    setSingleTitle('');
    setSingleCaption('');
  };

  const removeImageAt = (indexToRemove) => {
    setImageItems((prev) => {
      const next = [...prev];
      const removed = next[indexToRemove];
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      next.splice(indexToRemove, 1);
      return next;
    });

    setError('');
  };

  const updateItemMeta = (index, field, value) => {
    setImageItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  };

  const uploadPhoto = async () => {
    if (!imageItems.length) {
      setError('Pick at least one image file first.');
      return;
    }

    setError('');
    setIsUploading(true);

    try {
      for (const item of imageItems) {
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${item.file.name.replace(/\s+/g, '-')}`;
        const storageRef = ref(storage, `gallery/${fileName}`);
        await uploadBytes(storageRef, item.file);
        const imageUrl = await getDownloadURL(storageRef);

        const isSingleUpload = imageItems.length === 1;

        await addDoc(collection(db, 'gallery'), {
          title: (isSingleUpload ? singleTitle : item.title).trim(),
          caption: (isSingleUpload ? singleCaption : item.caption).trim(),
          imageUrl,
          storagePath: storageRef.fullPath,
          authorId: auth.currentUser?.uid ?? '',
          authorName: auth.currentUser?.displayName ?? 'Sean',
          createdAt: serverTimestamp(),
        });
      }

      navigate('/');
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Upload failed. Check Firebase Storage bucket + rules, then try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className='uploadPage'>
      <div className='uploadCard'>
        <h1>Upload Photos</h1>
        <p>
          Upload one or many images at once.
          {imageItems.length > 1
            ? ' Add title/caption per image below.'
            : ' Title/caption are optional.'}
        </p>

        <label>
          Image files
          <input type='file' accept='image/*' multiple onChange={onFilesChange} />
        </label>

        {imageItems.length === 1 && (
          <>
            <label>
              Title (optional)
              <input
                value={singleTitle}
                placeholder='Golden Hour'
                onChange={(event) => setSingleTitle(event.target.value)}
              />
            </label>

            <label>
              Caption (optional)
              <textarea
                value={singleCaption}
                placeholder='A little note about this photo...'
                onChange={(event) => setSingleCaption(event.target.value)}
              />
            </label>
          </>
        )}

        {imageItems.length > 0 && (
          <div className='uploadPreviewWrap'>
            <p>{imageItems.length} file{imageItems.length > 1 ? 's' : ''} selected</p>

            <div className='uploadPreviewGrid'>
              {imageItems.map((item, index) => (
                <figure className='uploadPreviewCard' key={`${item.file.name}-${item.file.size}-${item.file.lastModified}`}>
                  <button
                    type='button'
                    className='removePreviewBtn'
                    onClick={() => removeImageAt(index)}
                    disabled={isUploading}
                    aria-label={`Remove ${item.file.name}`}
                    title='Remove image'
                  >
                    ×
                  </button>

                  <img src={item.previewUrl} alt={item.file.name} />

                  {imageItems.length > 1 && (
                    <div className='uploadPreviewMeta'>
                      <input
                        value={item.title}
                        placeholder='Title (optional)'
                        onChange={(event) => updateItemMeta(index, 'title', event.target.value)}
                      />
                      <textarea
                        value={item.caption}
                        placeholder='Caption (optional)'
                        onChange={(event) => updateItemMeta(index, 'caption', event.target.value)}
                      />
                    </div>
                  )}
                </figure>
              ))}
            </div>
          </div>
        )}

        {error && <p className='statusText error'>{error}</p>}

        <div className='uploadActions'>
          <button type='button' className='cancelUploadBtn' onClick={() => navigate('/')} disabled={isUploading}>
            Cancel & Go Home
          </button>

          <button onClick={uploadPhoto} disabled={isUploading || !imageItems.length}>
            {isUploading
              ? `Uploading ${imageItems.length} photo${imageItems.length > 1 ? 's' : ''}...`
              : `Publish ${imageItems.length || ''} ${imageItems.length === 1 ? 'Photo' : 'Photos'}`.trim()}
          </button>
        </div>
      </div>
    </main>
  );
}

export default CreatePost;
