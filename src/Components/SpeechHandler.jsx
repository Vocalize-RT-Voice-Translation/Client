import { useEffect, useRef } from "react";
import { useSpeechRecognition } from "react-speech-recognition";

export const SpeechHandler = ({ onTranscriptUpdate }) => {
  const { transcript, resetTranscript } = useSpeechRecognition();
  const transcriptRef = useRef("");

  useEffect(() => {
    if (!transcript || transcript === transcriptRef.current) return;
    transcriptRef.current = transcript;

    onTranscriptUpdate(transcript, resetTranscript);
  }, [transcript, onTranscriptUpdate]);

  return null; // No UI needed
};
