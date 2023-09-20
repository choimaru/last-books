import { useEffect, useState } from 'react';
import { createWorker } from 'tesseract.js';
import { ChoiceInput } from 'src/components/ChoiceInput';

export const ReadIsbn = (props) => {
  const [isbns, setIsbns] = useState([]);

  const returnIsbn = async (isbn) => {
    props.setIsbnInfo(isbn);
  };

  const findOrCreateCaptureCanvas = () => {
    let captureCanvas = document.getElementById('capture_canvas');
    if (!captureCanvas) {
      captureCanvas = document.createElement('canvas');
      captureCanvas.width = 250;
      captureCanvas.height = 250;
      captureCanvas.id = 'capture_canvas';
    }
    return captureCanvas;
  };

  const findOrCreateVideoTag = () => {
    let video = document.querySelector('video');
    if (!video) {
      video = document.createElement('video');
      video.setAttribute('contrals', '');
      video.setAttribute('autoplay', 'true');
      video.setAttribute('playsinline', '');
      document.getElementById('vc').appendChild(video);
    }
    return video;
  };

  const updateVideoCanvas = () => {
    requestAnimationFrame(updateVideoCanvas);

    const video = document.querySelector('video');
    if (!video) return;

    const videoCanvas = document.getElementById('video_canvas');
    if (!videoCanvas) return;

    const context = videoCanvas.getContext('2d');
    context.drawImage(video, 0, 0, videoCanvas.width, videoCanvas.height);
    context.strokeRect(10, 80, 230, 40);
  };

  const startCamera = async () => {
    const constraints = {
      audio: false,
      video: {
        width: 250,
        height: 250,
        facingMode: 'environment',
      },
    };

    const captureCanvas = document.getElementById('capture_canvas');
    if (captureCanvas) {
      captureCanvas.remove();
    }

    const video = findOrCreateVideoTag();

    const videoCanvas = document.createElement('canvas');
    videoCanvas.width = 250;
    videoCanvas.height = 250;
    videoCanvas.id = 'video_canvas';
    videoCanvas.setAttribute('style', 'display:none');
    document.getElementById('vc').appendChild(videoCanvas);

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = stream;
    } catch (err) {
      console.log(err);
    }
  };

  const captureCamera = async (worker) => {
    const video = document.querySelector('video');
    if (!video) return;

    const videoCanvas = document.getElementById('video_canvas');
    if (!videoCanvas) return;

    const captureCanvas = findOrCreateCaptureCanvas();
    const context = captureCanvas.getContext('2d');
    context.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
    const url = captureCanvas.toDataURL('image/png');

    // canvasから文字認識
    const {
      data: { text },
    } = await worker.recognize(url);

    const textIsbn = choiceIsbn(text);
    if (textIsbn.length) {
      setIsbns([...textIsbn]);
      videoCanvas.remove();
      props.clearData();
      props.setIsCamera(false);
    }
  };

  const choiceIsbn = (text) => {
    // 複数読み取った場合を考慮して分割
    const isbns = text.split('\n');

    // 桁数チェック
    const filterIsbn = isbns.filter((isbn) => {
      const trimIsbn = isbn.replaceAll(' ', '');
      if (trimIsbn.length === 10 || trimIsbn.length === 13) {
        return trimIsbn;
      }
    });

    return filterIsbn;
  };

  const initWorker = async () => {
    const worker = createWorker();
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789',
    });
    return worker;
  };

  useEffect(async () => {
    let interval = '';
    if (props.isCamera) {
      setIsbns([]);
      const worker = await initWorker();
      interval = setInterval(() => {
        captureCamera(worker);
      }, 2000);
      startCamera();
    } else {
      const videoCanvas = document.getElementById('video_canvas');
      if (videoCanvas) {
        videoCanvas.remove();
      }

      const video = document.querySelector('video');
      if (video) {
        video.remove();
      }
    }
    return () => clearInterval(interval);
  }, [props.isCamera]);

  return (
    <div id='vc' style={{ textAlign: 'center' }}>
      {isbns.length
        ? isbns.map((isbn, idx) => {
            return (
              <ChoiceInput key={idx} isbn={isbn} returnIsbn={returnIsbn} />
            );
          })
        : null}
    </div>
  );
};
