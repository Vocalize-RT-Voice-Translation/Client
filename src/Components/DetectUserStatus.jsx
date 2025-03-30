import { useState, useEffect } from "react";

const useDetectUserStatus = () => {
  const [micStatus, setMicStatus] = useState(false);
  const [camStatus, setCamStatus] = useState(false);

  useEffect(() => {
    const detectUserStatus = () => {
      const mic = document.querySelector("#ZegoRoomMicButton");
      const cam = document.querySelector("#ZegoRoomCameraButton");

      if (mic) {
        setMicStatus(mic.classList.contains("false"));
      }

      if (cam) {
        setCamStatus(cam.classList.contains("false"));
      }
    };

    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          detectUserStatus(); // Run whenever class changes
        }
      }
    });

    const observeElement = (element) => {
      if (element) {
        observer.observe(element, {
          attributes: true,
          attributeFilter: ["class"],
        });
      }
    };

    // Initial check
    detectUserStatus();

    let micElement = document.querySelector("#ZegoRoomMicButton");
    let camElement = document.querySelector("#ZegoRoomCameraButton");

    observeElement(micElement);
    observeElement(camElement);

    // Handle dynamic elements appearing later
    const checkElementsExist = setInterval(() => {
      micElement = document.querySelector("#ZegoRoomMicButton");
      camElement = document.querySelector("#ZegoRoomCameraButton");

      if (micElement && !micElement.dataset.observed) {
        observeElement(micElement);
        micElement.dataset.observed = "true";
      }

      if (camElement && !camElement.dataset.observed) {
        observeElement(camElement);
        camElement.dataset.observed = "true";
      }
    }, 1000); // Re-check every second if elements are missing

    return () => {
      observer.disconnect();
      clearInterval(checkElementsExist);
    };
  }, []);

  return { micStatus, camStatus };
};

export default useDetectUserStatus;
