import { useState, useEffect, useRef } from "react";
import axios from "axios";

const useTranslationQueue = (settingsConfig, TRANSLATION_ENDPOINT) => {
  const [queue, setQueue] = useState([]);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    if (queue.length > 0 && !isProcessingRef.current) {
      processQueue();
    }
  }, [queue]);

  const addToQueue = (caption) => {
    if (caption?.trim()) {
      setQueue((prevQueue) => [...prevQueue, caption]); // Add new caption to queue
    }
  };

  const processQueue = async () => {
    if (isProcessingRef.current || queue.length === 0) return;

    isProcessingRef.current = true;
    const currentCaption = queue[0];

    try {
      await fetchTranslation(currentCaption);
    } catch (error) {
      console.error("Error in translation process:", error);
    } finally {
      setQueue((prevQueue) => prevQueue.slice(1)); // Remove processed item
      isProcessingRef.current = false;
    }
  };

  const fetchTranslation = async (caption) => {
    try {
      const response = await axios.post(`${TRANSLATION_ENDPOINT}/translate`, {
        source: settingsConfig.speakerLanguage === "English" ? "en" : "hi",
        target: settingsConfig.speakerLanguage === "English" ? "hi" : "en",
        message: caption,
      });

      if (response.data?.translated_message) {
        console.log("Translated:", response.data.translated_message);
        await speakText(
          response.data.translated_message,
          settingsConfig.speakerLanguage
        );
      } else {
        console.warn("No translated message received!");
      }
    } catch (error) {
      console.error("Translation failed:", error);
    }
  };

  const speakText = (text, language) => {
    return new Promise((resolve) => {
      const voice = language === "English" ? "Hindi Male" : "UK English Male";
      window.responsiveVoice.speak(text, voice, { onend: resolve });
    });
  };

  return { addToQueue };
};

export default useTranslationQueue;
