import React, { useRef, useState } from 'react';
import { Button, Spinner } from 'reactstrap';
import { useUploadImage } from '../../data/imageData';
import { compressImage } from '../../helpers/compressImage';
import { Chore } from '../../Types';

interface ImageUploaderProps {
  choreInfo: Chore;
  onUpdate?: () => void;
  toggle?: () => void;
}

interface SelectedImage {
  id: string;
  file: File;
  previewUrl: string;
}

export default function ImageUploader({ choreInfo, onUpdate, toggle }: ImageUploaderProps) {
  const [selected, setSelected] = useState<SelectedImage[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadImage = useUploadImage();

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const next = Array.from(fileList)
      .filter((file) => file.type.startsWith('image/'))
      .map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }));
    setSelected((prev) => [...prev, ...next]);
  };

  const removeImage = (id: string) => {
    setSelected((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const handleSubmit = async () => {
    if (!selected.length || !choreInfo.id) return;
    setUploading(true);
    setError(null);

    try {
      await Promise.all(
        selected.map(async ({ file }) => {
          const compressed = await compressImage(file);
          const formData = new FormData();
          formData.append('file', compressed);
          formData.append('choreId', String(choreInfo.id));
          await uploadImage.mutateAsync(formData);
        }),
      );

      selected.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      setSelected([]);
      onUpdate?.();
      toggle?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className='image-uploader'>
      <div
        className={`image-uploader__dropzone${dragging ? ' is-dragging' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        role='button'
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
      >
        <p className='image-uploader__prompt'>📷 Tap to choose photos or drag them here</p>
        <p className='image-uploader__hint'>Photos are resized automatically before upload</p>
        <input
          ref={inputRef}
          type='file'
          multiple
          accept='image/*'
          capture='environment'
          hidden
          onChange={(e) => { addFiles(e.currentTarget.files); e.currentTarget.value = ''; }}
        />
      </div>

      {selected.length > 0 && (
        <div className='image-uploader__grid'>
          {selected.map((img) => (
            <div key={img.id} className='image-uploader__thumb'>
              <img src={img.previewUrl} alt='preview' />
              <button
                type='button'
                className='image-uploader__remove'
                aria-label='Remove photo'
                onClick={() => removeImage(img.id)}
                disabled={uploading}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className='image-uploader__error'>{error}</p>}

      <div className='image-uploader__actions'>
        <Button color='primary' onClick={handleSubmit} disabled={uploading || selected.length === 0}>
          {uploading
            ? <><Spinner size='sm' /> Uploading…</>
            : `Upload ${selected.length || ''} photo${selected.length === 1 ? '' : 's'}`.trim()}
        </Button>
      </div>
    </div>
  );
}
