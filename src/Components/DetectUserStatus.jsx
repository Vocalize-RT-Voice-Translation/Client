import { useEffect, useRef } from "react";

const useDetectUserStatus = () => {
  const micStatus = useRef(false);
  const camStatus = useRef(false);

  useEffect(() => {
    const detectUserStatus = () => {
      const mic = document.querySelector("#ZegoRoomMicButton");
      const cam = document.querySelector("#ZegoRoomCameraButton");

      if (mic) {
        micStatus.current = mic.classList.contains("false");
      }

      if (cam) {
        camStatus.current = cam.classList.contains("false");
      }

      console.log("Mic Status: ", micStatus.current);
      console.log("Cam Status: ", camStatus.current);
    };

    const observer = new MutationObserver(() => detectUserStatus());

    const micElement = document.querySelector("#ZegoRoomMicButton");
    const camElement = document.querySelector("#ZegoRoomCameraButton");

    if (micElement) {
      observer.observe(micElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }

    if (camElement) {
      observer.observe(camElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }

    return () => observer.disconnect();
  }, []);

  return { micStatus, camStatus };
};

export default useDetectUserStatus;
