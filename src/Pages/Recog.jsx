import React, { useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const SpeechTranscription = () => {
  const isBrave = navigator.brave;

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  if (!browserSupportsSpeechRecognition) {
    return <p>Browser doesn't support speech recognition.</p>;
  }
  return isBrave ? (
    <div>
      <h1>Brave Browser Not Supported</h1>
      <p>Brave browser is not supported for speech recognition.</p>
    </div>
  ) : (
    <div>
      <h1>Real-Time Speech Transcription</h1>
      <button
        onClick={() =>
          SpeechRecognition.startListening({
            continuous: true,
            language: "en-US",
          })
        }
      >
        Start Listening
      </button>
      <button onClick={SpeechRecognition.stopListening}>Stop Listening</button>
      <button onClick={resetTranscript}>Reset Transcript</button>
      <p>
        <strong>Listening:</strong> {listening ? "Yes" : "No"}
      </p>
      <p>
        <strong>Transcript:</strong> {transcript}
      </p>
    </div>
  );
};

export default SpeechTranscription;
