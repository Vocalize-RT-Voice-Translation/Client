import React, { useEffect, useCallback } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const useSpeechHandler = (language = "en-IN") => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const startListening = useCallback(() => {
    SpeechRecognition.startListening({
      continuous: true,
      interimResults: true,
      language,
    });
  }, [language]);

  const stopListening = useCallback(() => {
    SpeechRecognition.stopListening();
  }, []);

  const reset = useCallback(() => {
    resetTranscript();
  }, [resetTranscript]);

  useEffect(() => {
    if (browserSupportsSpeechRecognition) {
      startListening();
    }

    return () => {
      SpeechRecognition.stopListening();
    };
  }, [language, startListening, browserSupportsSpeechRecognition]);

  return {
    transcript,
    listening,
    startListening,
    stopListening,
    reset,
    browserSupportsSpeechRecognition,
  };
};

export default useSpeechHandler;
