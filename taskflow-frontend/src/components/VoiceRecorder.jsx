import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Trash2 } from 'lucide-react';

const VoiceRecorder = ({ onSend, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [permission, setPermission] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [isRecording, isPaused]);

  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermission('granted');
      streamRef.current = stream;
      return stream;
    } catch (err) {
      console.error('Microphone permission denied:', err);
      setPermission('denied');
      return null;
    }
  };

  const startRecording = async () => {
    if (disabled) return;
    
    let stream = streamRef.current;
    if (!stream) {
      stream = await requestPermission();
      if (!stream) return;
    }

    audioChunksRef.current = [];
    
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      const url = URL.createObjectURL(audioBlob);
      setAudioURL(url);
      setIsRecording(false);
      setRecordingTime(0);
    };

    mediaRecorder.start();
    setIsRecording(true);
    setIsPaused(false);
    setRecordingTime(0);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  const cancelRecording = () => {
    if (isRecording) {
      stopRecording();
    }
    setAudioURL('');
    setRecordingTime(0);
    audioChunksRef.current = [];
  };

  const sendVoiceNote = () => {
    if (audioURL && onSend) {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      onSend(audioBlob);
      setAudioURL('');
      audioChunksRef.current = [];
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (permission === 'denied') {
    return (
      <div className="voice-recorder voice-recorder--permission-denied">
        <MicOff size={16} />
        <span>Microphone access denied</span>
      </div>
    );
  }

  return (
    <div className="voice-recorder">
      {!isRecording && !audioURL && (
        <button
          type="button"
          className="voice-recorder-btn"
          onClick={startRecording}
          disabled={disabled}
          title="Record voice note"
        >
          <Mic size={16} />
        </button>
      )}

      {isRecording && (
        <div className="voice-recorder-recording">
          <button
            type="button"
            className="voice-recorder-btn voice-recorder-btn--recording"
            onClick={isPaused ? resumeRecording : pauseRecording}
            title={isPaused ? 'Resume recording' : 'Pause recording'}
          >
            <Mic size={16} />
          </button>
          
          <span className="voice-recorder-timer">
            {formatTime(recordingTime)}
            {isPaused && ' (paused)'}
          </span>
          
          <button
            type="button"
            className="voice-recorder-btn voice-recorder-btn--stop"
            onClick={stopRecording}
            title="Stop recording"
          >
            <div className="stop-icon" />
          </button>
          
          <button
            type="button"
            className="voice-recorder-btn voice-recorder-btn--cancel"
            onClick={cancelRecording}
            title="Cancel recording"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {audioURL && !isRecording && (
        <div className="voice-recorder-preview">
          <audio src={audioURL} controls className="voice-recorder-audio" />
          
          <div className="voice-recorder-actions">
            <button
              type="button"
              className="voice-recorder-btn voice-recorder-btn--send"
              onClick={sendVoiceNote}
              title="Send voice note"
            >
              <Send size={14} />
            </button>
            
            <button
              type="button"
              className="voice-recorder-btn voice-recorder-btn--cancel"
              onClick={cancelRecording}
              title="Delete voice note"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
