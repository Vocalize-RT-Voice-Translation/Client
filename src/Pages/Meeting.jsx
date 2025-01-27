import React, { useEffect, useState, useRef, useCallback } from "react";
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
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useConnections } from "./SocketPeerContext.jsx";
import { showToast } from "../Utils/toast.js";
import { createUserId } from "../Utils/helper.js";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const Meeting = () => {
  const { socket } = useConnections();
  const userId = createUserId();
  const { APP_ID, APP_SECRET } = secrets;
  const { id } = useParams();
  const location = useLocation();

  const [itemVisible, setItemVisible] = useState("Media Devices");

  const [roomState, setRoomState] = useState("pre-meeting");
  const [localSpeech, setLocalSpeech] = useState("");
  const [captions, setCaptions] = useState("");

  const streamRef = useRef(null);

  const [settingsConfig, setSettingsConfig] = useState({
    isCaptionsEnabled: false,
    isTranslationEnabled: false,
    speakerLanguage: "English",
  });

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

  useEffect(() => {
    socket.on("new-user", (data) => {
      console.log(data);
    });

    socket.on("push-captions", (data) => {
      console.log(data);
      setCaptions(data.caption);
    });

    socket.on("stop-captions", (data) => {
      console.log(data);
    });
  }, []);

  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isInRoom, setIsInRoom] = useState(false);
  const [audioStream, setAudioStream] = useState(new MediaStream());
  const zegoEngine = useRef(null);
  const name = location.state?.data?.user?.name ?? "Guest User";

  const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  const MeetingComp = useCallback(
    async (element) => {
      if (!element || isInRoom) return; // Prevent joining again if already in the room

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

      // Create ZegoUIKit instance
      const zc = ZegoUIKitPrebuilt.create(kitToken);
      zegoEngine.current = zc; // Store reference to the engine

      // Join the room
      zc.joinRoom({
        container: element,
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
      });

      // Set the flag to indicate you're in the room
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

  const leaveRoom = () => {
    if (zegoEngine.current) {
      zegoEngine.current.leaveRoom();
      setIsInRoom(false); // Reset the state to allow rejoining
    }
  };

  useEffect(() => {
    if (!isInRoom && streamRef.current) {
      MeetingComp(streamRef.current);
    }

    // Cleanup if the component is unmounted or leaves the room
    return () => {
      if (isInRoom && zegoEngine.current) {
        zegoEngine.current.leaveRoom();
        setIsInRoom(false); // Reset state when leaving the room
      }
    };
  }, [isInRoom, MeetingComp]);

  const muteOtherPerson = () => {
    if (zegoEngine.current) {
      const remoteUsers = zegoEngine.current.getRemoteUsers();
      if (remoteUsers.length > 0) {
        remoteUsers.forEach((user) => {
          if (user.stream && user.stream.getAudioTracks().length > 0) {
            user.stream.getAudioTracks().forEach((track) => {
              track.enabled = false; // Disable the audio track
            });
            console.log(`Muted audio for user: ${user.userID}`);
          }
        });
      } else {
        console.log("No remote users connected.");
      }
    }
  };

  SpeechRecognition.startListening({ continuous: true, language: "en-IN" });

  useEffect(() => {
    if (browserSupportsSpeechRecognition) {
      if (transcript) {
        console.log("RT Transcript: ", transcript);
        if (transcript.length > 100) {
          console.log("Transcript: ", transcript);
          socket.emit("push-captions", {
            roomId: id,
            userId: userId,
            caption: transcript,
          });
          resetTranscript();
        }
      }
    }
  }, [transcript]);

  useEffect(() => {
    if (MeetingComp.current) {
      initializeMeeting(MeetingComp.current);
    }
  }, []);

  useEffect(() => {
    if (settingsConfig.isCaptionsEnabled) {
      socket.emit("push-captions", {
        roomId: id,
        userId: userId,
      });
    }

    if (settingsConfig.isTranslationEnabled) {
      socket.emit("start-translation", {
        roomId: id,
        isTranslationEnabled: true,
        speakerLanguage: settingsConfig.speakerLanguage,
      });
    }
  }, [settingsConfig]);

  const Settings = ({
    settingsConfig,
    isCaptionsEnabled,
    isTranslationEnabled,
    speakerLanguage,
  }) => {
    const leftItems = [
      {
        title: "Captions",
        icon: <BsCcCircle />,
      },
      {
        title: "Translation",
        icon: <BsTranslate />,
      },
    ];

    return (
      <div className={styles.modalSettings}>
        <div className={styles.left}>
          <h2>Settings</h2>
          <div className={styles.itemWrapper}>
            {leftItems.map((item, index) => {
              return (
                <div
                  key={index}
                  className={`${styles.item} ${
                    itemVisible === item.title ? styles.focused : ""
                  }`}
                  onClick={() => {
                    setItemVisible(item.title);
                  }}
                >
                  {item.icon}
                  <p>{item.title}</p>
                  {item.title == "Translation" && <BsStars />}
                </div>
              );
            })}
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
                    Realtime captions are generated by identifying the speech in
                    the audio stream and converting it to text
                    <br /> <b>(Supports English & Hindi Languages only).</b>
                  </p>
                </div>
                <Switch
                  className={styles.switch}
                  checkedChildren={<CheckOutlined />}
                  unCheckedChildren={<CloseOutlined />}
                  defaultChecked={settingsConfig.isCaptionsEnabled}
                  onChange={(checked) => {
                    if (checked) {
                      showToast("Captions Enabled", "success");
                      isCaptionsEnabled(true);
                    } else {
                      showToast("Captions Disabled", "success");
                      isCaptionsEnabled(false);
                    }
                  }}
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
                      Live translation is powered by Vocalize Powerful Machine
                      Learning Model that translates the speech in real-time to
                      the selected language.
                    </p>
                  </div>
                  <Switch
                    className={styles.switch}
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    defaultChecked={settingsConfig.isTranslationEnabled}
                    onChange={(checked) => {
                      console.log(checked);
                      if (checked) {
                        showToast("Translation Enabled", "success");
                        isTranslationEnabled(true);
                      } else {
                        showToast("Translation Disabled", "success");
                        isTranslationEnabled(false);
                      }
                    }}
                  />
                </div>
                <div className={styles.optionsWrapper}>
                  <div className={styles.languageSelector}>
                    <p>Speaker is talking in : </p>
                    <select
                      name=""
                      id=""
                      value={settingsConfig.speakerLanguage}
                      onChange={(e) => {
                        if (e.target.value === "Hindi") {
                          speakerLanguage("Hindi");
                        } else {
                          speakerLanguage("English");
                        }
                      }}
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                    </select>
                  </div>
                  <div className={styles.languageSelector}>
                    <p>I want to listen in : </p>
                    <select
                      name=""
                      id=""
                      value={
                        settingsConfig.speakerLanguage == "English"
                          ? "Hindi"
                          : "English"
                      }
                      onChange={(e) => {
                        if (e.target.value === "Hindi") {
                          speakerLanguage("English");
                        } else {
                          speakerLanguage("Hindi");
                        }
                      }}
                    >
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
  };

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
          settingsConfig={settingsConfig}
          selectMic={(data) => {
            setSettingsConfig((prevConfig) => ({
              ...prevConfig,
              selectedAudioDevice: data,
            }));
          }}
          selectVideo={(data) => {
            setSettingsConfig((prevConfig) => ({
              ...prevConfig,
              selectedVideoDevice: data,
            }));
          }}
          selectSpeaker={(data) => {
            setSettingsConfig((prevConfig) => ({
              ...prevConfig,
              selectedAudioOutputDevice: data,
            }));
          }}
          isCaptionsEnabled={(data) => {
            setSettingsConfig((prevConfig) => ({
              ...prevConfig,
              isCaptionsEnabled: data,
            }));
          }}
          isTranslationEnabled={(data) => {
            setSettingsConfig((prevConfig) => ({
              ...prevConfig,
              isTranslationEnabled: data,
            }));
          }}
          speakerLanguage={(data) => {
            setSettingsConfig((prevConfig) => ({
              ...prevConfig,
              speakerLanguage: data,
            }));
          }}
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
      {settingsConfig.isCaptionsEnabled && (
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
          {settingsConfig.isTranslationEnabled && (
            <div className={styles.dot}></div>
          )}
        </div>
        <div
          className={styles.button}
          onClick={() => {
            setIsSettingsVisible(true);
            setItemVisible("Captions");
          }}
        >
          <BiCaptions />
          {settingsConfig.isCaptionsEnabled && (
            <div className={styles.dot}></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Meeting;
