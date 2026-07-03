import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export type Slide = {
  /**
   * A unique identifier for the slide.
   */
  id: string;
  /**
   * The title of the slide
   */
  title: string;
  /**
   * A short description of the content or purpose of the slide.
   */
  description: string;
  /**
   * The duration for which the slide should be displayed, in seconds.
   */
  duration: number;
}

export type SlideWithMedia = Slide & {
  /**
   * The type of media associated with the slide (e.g., 'video', 'img').
   */
  mediaType: 'video' | 'img',
  /**
   * The URL to the media resource if a mediaType is specified.
   */
  url: string;
}

type HelperModalProps = {
  title: string;
  slides: (Slide | SlideWithMedia)[];
  handleClose: () => void;
}

type SlideProps = {
  slides: (Slide | SlideWithMedia)[];
}

export const HelperModal = (props: HelperModalProps) => {
  const { title, slides, handleClose } = props;

  useEffect(() => {
    const keyUpClose = (event: { key: string }) => {
      if (event.key === 'Escape') {
        return handleClose();
      }
    };

    window.addEventListener('keyup', keyUpClose);
    return () => window.removeEventListener('keyup', keyUpClose);
  }, []);


  return createPortal(
    <div className={'helper-modal-backdrop'} onClick={handleClose}>
      <div className={'helper-modal'} onClick={event => event.stopPropagation()}>
        <div className={'helper-modal-header'}>
          <h4 className={'helper-modal-header__title'}>{title}</h4>
        </div>
        <Slider slides={slides} />
        <button onClick={handleClose} className={'helper-modal-button'}>Done</button>
      </div>
    </div>,
    document.body
  );
};

/**
 * Slider component that displays a slide-based multimedia presentation.
 * It supports both video and image slides with accompanying titles and descriptions.
 * Users can navigate between slides using buttons that indicate progress visually.
 *
 * @param props - The properties object containing slide data.
 * @param props.slides - The array of slides to display. Each slide object should include:
 */
const Slider = (props: SlideProps) => {
  const { slides } = props;

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleSlideClick = (index: number) => {
    if (index === currentSlideIndex) return;
    setProgress(0);
    setCurrentSlideIndex(index);
  };

  const currentSlide = slides[currentSlideIndex];

  useEffect(() => {
    if (!currentSlide || ('mediaType' in currentSlide && currentSlide.mediaType === 'video')) {
      return;
    }
    setProgress(0);
    const interval = 50;
    const totalSteps = (currentSlide.duration * 1000) / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newProgress = (currentStep / totalSteps) * 100;

      if (newProgress >= 100) {
        clearInterval(timer);
        if (currentSlideIndex < slides.length - 1) {
          setProgress(0);
          setCurrentSlideIndex(prev => prev + 1);
        } else {
          setProgress(100);
        }
      } else {
        setProgress(newProgress);
      }
    }, interval);

    return () => {
      clearInterval(timer);
    };
  }, [currentSlide, currentSlideIndex]);

  useEffect(() => {
    if (!currentSlide || !('mediaType' in currentSlide && currentSlide.mediaType === 'video')) {
      return;
    }

    setProgress(0);
    const video = videoRef.current;
    if (!video) return;

    let animationFrameId: number;
    let lastUpdateTime = 0;
    const updateInterval = 50;

    // TODO: refactor how animation is done (it should move line between two points, instead of setting up currentTime as an active point)
    const updateProgress = (timestamp: number) => {
      if (video.duration && !video.paused && !video.ended) {
        if (timestamp - lastUpdateTime >= updateInterval) {
          const newProgress = (video.currentTime / video.duration) * 100;
          setProgress(newProgress);
          lastUpdateTime = timestamp;
        }
        animationFrameId = requestAnimationFrame(updateProgress);
      }
    };

    const handlePlay = () => {
      lastUpdateTime = 0;
      animationFrameId = requestAnimationFrame(updateProgress);
    };

    const handleVideoEnded = () => {
      if (currentSlideIndex < slides.length - 1) {
        setProgress(0);
        setCurrentSlideIndex(prev => prev + 1);
      } else {
        setProgress(100);
      }
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('ended', handleVideoEnded);

    if (!video.paused) {
      handlePlay();
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('ended', handleVideoEnded);
    };
  }, [currentSlide, currentSlideIndex]);

  const getSlideProgressStyle = (index: number) => {
    if (index < currentSlideIndex) {
      return 'var(--slider-bg-green)';
    }

    if (index === currentSlideIndex) {
      return `linear-gradient(to right, var(--slider-bg-green) ${progress}%, var(--slider-bg) ${progress}%)`;
    }

    return 'var(--slider-bg)';
  };

  return (
    <>
      <div>
        {('mediaType' in currentSlide && currentSlide.url && currentSlide?.mediaType === 'video') && (
          <div className="helper-modal-slide__content-container">
            <video
              ref={videoRef}
              key={currentSlide.id}
              muted
              autoPlay={true}
            >
              <source src={currentSlide.url} type="video/mp4" />
              <source src={currentSlide.url} type="video/av1" />
              <source src={currentSlide.url} type="video/webm" />
            </video>
          </div>
        )}

        {(('mediaType' in currentSlide && currentSlide.url && currentSlide.mediaType === 'img') && (
          <div className="helper-modal-slide__content-container helper-modal-slide__content-container--img">
            <img
              src={currentSlide.url}
              alt={currentSlide.title}
            />
          </div>
        ))}

        <h6 className="helper-modal-slide__title">{currentSlide.title}</h6>
        <p className="helper-modal-slide__description">{currentSlide.description}</p>
      </div>
      <div className="helper-modal__slider">
        {slides.map((slide, index) => (
          <button
            key={`${slide.id}`}
            onClick={() => handleSlideClick(index)}
            className="helper-modal__slider-button"
            style={{ background: getSlideProgressStyle(index) }}
          ></button>
        ))}
      </div>
    </>
  );
};
