import { useState, useEffect } from 'react';
import { X, ArrowLeft, ArrowRight } from '@phosphor-icons/react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: Array<{ url: string; name: string; id: string }>;
  currentIndex: number;
  onNavigate?: (index: number) => void;
}

export function ImageModal({ isOpen, onClose, images, currentIndex, onNavigate }: ImageModalProps) {
  const [index, setIndex] = useState(currentIndex);
  
  useEffect(() => {
    setIndex(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && index > 0) {
        const newIndex = index - 1;
        setIndex(newIndex);
        onNavigate?.(newIndex);
      } else if (e.key === 'ArrowRight' && index < images.length - 1) {
        const newIndex = index + 1;
        setIndex(newIndex);
        onNavigate?.(newIndex);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, index, images.length, onClose, onNavigate]);

  if (!isOpen || !images[index]) return null;

  const currentImage = images[index];
  const hasPrevious = index > 0;
  const hasNext = index < images.length - 1;

  const handlePrevious = () => {
    if (hasPrevious) {
      const newIndex = index - 1;
      setIndex(newIndex);
      onNavigate?.(newIndex);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      const newIndex = index + 1;
      setIndex(newIndex);
      onNavigate?.(newIndex);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Close"
      >
        <X className="w-5 h-5" weight="bold" />
      </button>

      {images.length > 1 && (
        <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-black/50 text-white text-sm font-medium">
          {index + 1} / {images.length}
        </div>
      )}

      <div className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center animate-in zoom-in-95 duration-300">
        <img
          src={currentImage.url}
          alt={currentImage.name}
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
        
        {currentImage.name && (
          <div className="mt-4 px-4 py-2 rounded-lg bg-black/50 backdrop-blur-sm text-white text-sm max-w-full truncate">
            {currentImage.name}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            disabled={!hasPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Previous image"
          >
            <ArrowLeft className="w-6 h-6" weight="bold" />
          </button>
          <button
            onClick={handleNext}
            disabled={!hasNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Next image"
          >
            <ArrowRight className="w-6 h-6" weight="bold" />
          </button>
        </>
      )}
    </div>
  );
}
