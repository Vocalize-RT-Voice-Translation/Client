import React, { useEffect, useState, useRef, useCallback, memo } from "react";
import { useParams, useLocation } from "react-router-dom";
import secrets from "../../secrets.js";
import styles from "../Styles/Meeting.module.scss";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { v4 as uuidv4 } from "uuid";
import { BsTranslate } from "react-icons/bs";
import { BiCaptions } from "react-icons/bi";
import { BsCcCircle } from "react-icons/bs";
import { BsStars } from "react-icons/bs";
import { Modal, Switch } from "antd";
import { useConnections } from "./SocketPeerContext.jsx";
import { showToast } from "../Utils/toast.js";
import { createUserId } from "../Utils/helper.js";
import axios from "axios";
import { IoMdClose } from "react-icons/io";
import useDetectUserStatus from "../Components/DetectUserStatus.jsx";
import useSpeechHandler from "../Components/SpeechHandler.jsx";

const captionThreshold = 100;

const Settings = memo(
  ({
    isCaptionsEnabled,
    isTranslationEnabled,
    myLanguage,
    setCaptionsEnabled,
    setTranslationEnabled,
    setLanguage,
    roomId,
    socket,
  }) => {
    const [itemVisible, setItemVisible] = useState("Captions");

    useEffect(() => {
      if (isTranslationEnabled) {
        socket.emit("start-translation", {
          roomId,
          isTranslationEnabled: true,
        });
      } else {
        socket.emit("stop-translation", {
          roomId,
          isTranslationEnabled: false,
        });
      }
      if (isCaptionsEnabled) {
        socket.emit("start-captions", {
          roomId,
          isCaptionsEnabled: true,
        });
      } else {
        socket.emit("stop-captions", {
          roomId,
          isCaptionsEnabled: false,
        });
      }
    }, [isTranslationEnabled, isCaptionsEnabled, roomId, socket]);

    const handleCaptionsToggle = useCallback(
      (checked) => {
        setCaptionsEnabled(checked);
      },
      [setCaptionsEnabled]
    );

    const handleTranslationToggle = useCallback(
      (checked) => {
        setTranslationEnabled(checked);
      },
      [setTranslationEnabled]
    );

    const handleLanguageChange = useCallback(
      (e) => {
        setLanguage(e.target.value);
      },
      [setLanguage]
    );

    const leftItems = [
      { title: "Captions", icon: <BsCcCircle /> },
      { title: "Translation", icon: <BsTranslate /> },
    ];

    return (
      <div className={styles.modalSettings}>
        <div className={styles.left}>
          <h2>Settings</h2>
          <div className={styles.itemWrapper}>
            {leftItems.map((item, index) => (
              <div
                key={index}
                className={`${styles.item} ${
                  itemVisible === item.title ? styles.focused : ""
                }`}
                onClick={() => setItemVisible(item.title)}
              >
                {item.icon}
                <p>{item.title}</p>
                {item.title === "Translation" && <BsStars />}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.right}>
          <h2>{itemVisible}</h2>
          {itemVisible === "Captions" ? (
            <div className={styles.rightItem}>
              <div className={styles.capitonWrapper}>
                <div className={styles.info}>
                  <h3>Enable Realtime Captions</h3>
                  <p>
                    Realtime captions identify speech and convert it to text.{" "}
                    <b>(Supports English & Hindi only)</b>.
                  </p>
                </div>
                <Switch
                  className={styles.switch}
                  checked={isCaptionsEnabled}
                  onChange={handleCaptionsToggle}
                />
              </div>
            </div>
          ) : itemVisible === "Translation" ? (
            <div className={styles.rightItem}>
              <div className={styles.translationWrapper}>
                <div className={styles.headingWrapper}>
                  <div className={styles.heading}>
                    <h3>Enable Live Translation</h3>
                    <p>
                      Powered by Vocalize's AI Model for near real-time speech
                      translation.
                    </p>
                  </div>
                  <Switch
                    className={styles.switch}
                    checked={isTranslationEnabled}
                    onChange={handleTranslationToggle}
                  />
                </div>
                <div className={styles.optionsWrapper}>
                  <div className={styles.languageSelector}>
                    <p>I will be talking in: </p>
                    <select value={myLanguage} onChange={handleLanguageChange}>
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
);

const Meeting = () => {
  const { socket } = useConnections();
  const userId = createUserId();
  const { APP_ID, APP_SECRET, TRANSLATION_ENDPOINT } = secrets;
  const { id } = useParams();
  const location = useLocation();
  const { micStatus, camStatus } = useDetectUserStatus();

  const [settings, setSettings] = useState({
    isCaptionsEnabled: false,
    isTranslationEnabled: false,
    myLanguage: "Hindi",
  });
  const { transcript, startListening, stopListening, reset } = useSpeechHandler(
    settings?.myLanguage === "Hindi" ? "hi-IN" : "en-US"
  );

  const [lastCaptionTime, setLastCaptionTime] = useState(Date.now());
  const [itemVisible, setItemVisible] = useState("Media Devices");

  const [captions, setCaptions] = useState("");

  const [showCaptions, setShowCaptions] = useState(true);

  const streamRef = useRef(null);

  const handleCaptionsChange = useCallback((checked) => {
    setSettings((prev) => ({ ...prev, isCaptionsEnabled: checked }));
  }, []);

  const handleTranslationChange = useCallback((checked) => {
    setSettings((prev) => ({ ...prev, isTranslationEnabled: checked }));
  }, []);

  const handleLanguageChange = useCallback(
    (language) => {
      setSettings((prev) => ({ ...prev, myLanguage: language }));
      reset();
    },
    [reset]
  );

  const [showTranslationNotification, setShowTranslationNotification] =
    useState(false);

  const [modalWidth, setModalWidth] = useState("50%");

  const handleOk = () => {
    setIsModalOpen(false);
    audioStream.getTracks().forEach((track) => track.stop());
  };

  useEffect(() => {
    const getWindowWidth = () => {
      setModalWidth(window.innerWidth < 768 ? "100%" : "50%");
    };
    getWindowWidth();
    window.addEventListener("resize", getWindowWidth);
    return () => {
      window.removeEventListener("resize", getWindowWidth);
    };
  }, []);

  const speakText = (text, language) => {
    if (language === "English") {
      window.responsiveVoice.speak(text, "Hindi Male");
    } else {
      window.responsiveVoice.speak(text, "UK English Male");
    }
  };

  const fetchTranslation = async (captions, srcLanguage) => {
    const options = {
      method: "POST",
      url: `${TRANSLATION_ENDPOINT}/translate`,
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        source: srcLanguage === "English" ? "en" : "hi",
        target: srcLanguage === "English" ? "hi" : "en",
        message: captions,
      }),
    };

    try {
      console.log("Translation Request Initiated: ", options);
      const response = await axios(options);
      console.log("Translation Response: ", response);
      console.log(response);
      speakText(response.data.translated_message, srcLanguage);
    } catch (error) {
      console.log("Translation Error: ", error);
      console.log(error);
      showToast("Failed to translate", "error");
    }
  };

  const mute = () => {
    const micBtn = document.querySelector("#ZegoRoomMicButton");
    if (micBtn.classList.contains("false")) {
      micBtn.click();
    }
  };

  const unmute = () => {
    const micBtn = document.querySelector("#ZegoRoomMicButton");
    if (!micBtn.classList.contains("false")) {
      micBtn.click();
    }
  };

  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    const handleNewUser = (data) => {
      console.log(data);
    };

    const handleUserStatus = (data) => {
      if (data.isMicOn == false) {
        setShowCaptions(false);
      } else {
        setShowCaptions(true);
      }
    };

    const handleStartTranslation = (data) => {
      if (data.isTranslationEnabledForRemoteUser) {
        setShowTranslationNotification(true);
        showToast(
          "Your Voice is now being translated for other user",
          "success"
        );
        mute();
      }
    };

    const handleStopTranslation = (data) => {
      if (!data.isTranslationEnabledForRemoteUser) {
        setShowTranslationNotification(false);
        unmute();
      }
    };

    const handlePushCaptions = (data) => {
      setCaptions(data.caption);
      if (captions.length === captionThreshold) {
        setCaptions("");
      }
    };

    const handlePushTranslation = (data) => {
      console.log("Translation Caption Received! : ", data.caption);
      if (settingsRef.current.isTranslationEnabled) {
        console.log("Enabled");
        fetchTranslation(data.caption, data.speakerLanguage);
      } else {
        console.log("Disabled");
      }
    };

    socket.on("new-user", handleNewUser);
    socket.on("user-status", handleUserStatus);
    socket.on("start-translation", handleStartTranslation);
    socket.on("stop-translation", handleStopTranslation);
    socket.on("push-captions", handlePushCaptions);
    socket.on("push-translation", handlePushTranslation);

    // Cleanup function to remove all event listeners
    return () => {
      socket.off("new-user", handleNewUser);
      socket.off("user-status", handleUserStatus);
      socket.off("start-translation", handleStartTranslation);
      socket.off("stop-translation", handleStopTranslation);
      socket.off("push-captions", handlePushCaptions);
      socket.off("push-translation", handlePushTranslation);
    };
  }, []);

  useEffect(() => {
    console.log("showTranslationNotification", showTranslationNotification);
  }, [showTranslationNotification]);

  useEffect(() => {
    setLastCaptionTime(Date.now());
  }, [captions]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastCaptionTime >= 3000) {
        setCaptions("");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastCaptionTime]);

  useEffect(() => {
    socket.emit("user-status", {
      roomId: id,
      userId: userId,
      isMicOn: micStatus,
      isCameraOn: camStatus,
    });
  }, [micStatus, camStatus]);

  useEffect(() => {
    if (settings.myLanguage) {
      const langCode = settings.myLanguage === "Hindi" ? "hi-IN" : "en-IN";
      stopListening();
      setTimeout(() => {
        startListening({
          continuous: true,
          language: langCode,
        });
      }, 100);
    }
  }, [settings.myLanguage]);

  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isInRoom, setIsInRoom] = useState(false);
  const [audioStream, setAudioStream] = useState(new MediaStream());
  const zegoUIKit = useRef(null);
  const name = location.state?.data?.user?.name ?? "Guest User";

  const MeetingComp = useCallback(
    async (element) => {
      if (!element || isInRoom) return;

      const appId = Number(APP_ID);
      const server = APP_SECRET.toString();
      const userID = uuidv4();

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appId,
        server,
        id,
        userID,
        name
      );

      const zc = ZegoUIKitPrebuilt.create(kitToken);
      zegoUIKit.current = zc;

      zc.joinRoom({
        container: element,
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
      });

      setIsInRoom(true);
      socket.emit("add-to-room", {
        roomId: id,
        id: userId,
        name: name,
        socketId: socket.id,
      });
    },
    [APP_ID, APP_SECRET, id, name, isInRoom]
  );

  useEffect(() => {
    if (!isInRoom && streamRef.current) {
      MeetingComp(streamRef.current);
    }
  }, [isInRoom, MeetingComp]);

  useEffect(() => {
    if (transcript) {
      console.log("RT Transcript: ", transcript);
      if (transcript.split(" ").length > 20) {
        console.log("Transcript: ", transcript);
        socket.emit("push-translation", {
          roomId: id,
          userId: userId,
          caption: transcript,
          speakerLanguage: settingsRef.current.myLanguage,
        });
        reset();
      }
      socket.emit("push-captions", {
        roomId: id,
        userId: userId,
        caption: transcript,
      });
    } else {
      console.log("No Transcript");
    }
  }, [transcript]);

  useEffect(() => {
    if (MeetingComp.current) {
      initializeMeeting(MeetingComp.current);
    }
  }, []);

  return (
    <div className={styles.main}>
      <Modal
        title={null}
        open={isSettingsVisible}
        onOk={handleOk}
        onCancel={() => {
          setIsSettingsVisible(false);
        }}
        closable={true}
        centered
        footer={null}
        width={modalWidth}
      >
        <Settings
          isCaptionsEnabled={settings.isCaptionsEnabled}
          isTranslationEnabled={settings.isTranslationEnabled}
          myLanguage={settings.myLanguage}
          setCaptionsEnabled={handleCaptionsChange}
          setTranslationEnabled={handleTranslationChange}
          setLanguage={handleLanguageChange}
          roomId={id}
          socket={socket}
        />
      </Modal>
      <div
        ref={(element) => {
          MeetingComp(element);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
        }}
      />
      {showTranslationNotification && (
        <div className={styles.notification}>
          <p>Your Voice is now being translated for other user</p>
          <IoMdClose
            onClick={() => {
              setShowTranslationNotification(false);
            }}
            size={20}
          />
        </div>
      )}
      {settings.isCaptionsEnabled && showCaptions && (
        <div className={styles.captions}>
          <p>{captions}</p>
        </div>
      )}
      <div className={styles.settingsOverlay}>
        <div
          className={styles.button}
          onClick={() => {
            setIsSettingsVisible(true);
            setItemVisible("Translation");
          }}
        >
          <BsTranslate />
          {settings.isTranslationEnabled && <div className={styles.dot}></div>}
        </div>
        <div
          className={styles.button}
          onClick={() => {
            setIsSettingsVisible(true);
            setItemVisible("Captions");
          }}
        >
          <BiCaptions />
          {settings.isCaptionsEnabled && <div className={styles.dot}></div>}
        </div>
      </div>
    </div>
  );
};

export default Meeting;
