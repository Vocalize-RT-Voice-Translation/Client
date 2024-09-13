// React Essentials
import React, {
	useCallback,
	useEffect,
	useState,
	useRef,
	useMemo,
} from 'react';
import {
	useParams,
	useLocation,
	useNavigate,
} from 'react-router-dom';

// SCSS
import styles from '../Styles/Meeting.module.scss';
import 'react-initials-avatar/lib/ReactInitialsAvatar.css';

// Icons
import {
	IoMicSharp,
	IoMicOffSharp,
} from 'react-icons/io5';
import {
	MdVideocam,
	MdVideocamOff,
} from 'react-icons/md';
import { GoPersonAdd } from 'react-icons/go';
import { BsCcCircle } from 'react-icons/bs';
import { AiOutlineLogout } from 'react-icons/ai';
import {
	BsTranslate,
	BsStars,
} from 'react-icons/bs';
import { IoMdSettings } from 'react-icons/io';
import { PiDevices } from 'react-icons/pi';

// Imports
import { showToast } from '../Utils/toast';
import { useConnections } from './SocketPeerContext.jsx';
import { createUserId } from '../Utils/helper.js';
import InitialsAvatar from 'react-initials-avatar';
import Webcam from 'react-webcam';

// Assets
import enterSound from '../Assets/enter.mp3';
import exitSound from '../Assets/leave.mp3';

// Ant Design Component
import { Modal, Switch } from 'antd';
import {
	CheckOutlined,
	CloseOutlined,
} from '@ant-design/icons';

const Meeting = () => {
	const { socket, peer } = useConnections();
	const webcamRef = useRef(null);
	const audioRef = useRef(null);

	const userId = createUserId();

	const { id } = useParams();

	const navigate = useNavigate();
	const location = useLocation();

	const MeetingData = location.state.data;

	const [stream, setStream] = useState({
		remoteStream: null,
	});

	const { roomId, user } = MeetingData;

	const { mediaDevices, isMuted, isVideoCamOn } =
		user;

	const [modalWidth, setModalWidth] =
		useState('50%');

	useEffect(() => {
		const getWindowWidth = () => {
			setModalWidth(
				window.innerWidth < 768 ? '100%' : '50%'
			);
		};
		getWindowWidth();
		window.addEventListener(
			'resize',
			getWindowWidth
		);
		return () => {
			window.removeEventListener(
				'resize',
				getWindowWidth
			);
		};
	}, []);

	const [controls, setControls] = useState({
		isTalking: false,
		isMuted: isMuted,
		isVideoCamOn: isVideoCamOn,
		isCaptionsEnabled: false,
		isTranslationEnabled: false,
	});

	const [isModalOpen, setIsModalOpen] =
		useState(false);

	const [isSettingsVisible, setIsSettingsVisible] =
		useState(false);

	const [itemVisible, setItemVisible] = useState(
		'Media Devices'
	);

	const showModal = () => {
		setIsModalOpen(true);
	};
	const handleOk = () => {
		setIsModalOpen(false);
		leaveRoom();
	};
	const handleCancel = () => {
		setIsModalOpen(false);
	};

	const [isMounted, setIsMounted] =
		useState(false);

	const [members, setMembers] = useState([]);

	const playSound = useCallback((sound) => {
		const audioData = new Audio(sound);
		audioData.play();
	}, []);

	const [settingsConfig, setSettingsConfig] =
		useState({
			audioDeviceList: [],
			videoDeviceList: [],
			audioOutputDeviceList: [],
			selectedAudioDevice: '',
			selectedVideoDevice: null,
			selectedAudioOutputDevice: '',
			isCaptionsEnabled: false,
			isTranslationEnabled: false,
			speakerLanguage: 'English',
			unselectVideo: null,
		});

	const getAudioDevices = async () => {
		navigator.mediaDevices
			.enumerateDevices()
			.then((devices) => {
				const audioDevices = devices.filter(
					(device) => device.kind === 'audioinput'
				);
				const getLabels = audioDevices.map(
					(device) => ({
						label: device.label,
						deviceId: device.deviceId,
					})
				);
				setSettingsConfig((prevConfig) => ({
					...prevConfig,
					audioDeviceList: getLabels,
				}));
				if (getLabels.length > 0) {
					if (mediaDevices.audio == '') {
						setSettingsConfig((prevConfig) => ({
							...prevConfig,
							selectedAudioDevice: getLabels[0].deviceId,
						}));
					} else {
						setSettingsConfig((prevConfig) => ({
							...prevConfig,
							selectedAudioDevice: mediaDevices.audio,
						}));
					}
				}
			});
	};

	const getAudioOutputDevices = async () => {
		navigator.mediaDevices
			.enumerateDevices()
			.then((devices) => {
				const audioOutputDevices = devices.filter(
					(device) => device.kind === 'audiooutput'
				);
				const getLabels = audioOutputDevices.map(
					(device) => ({
						label: device.label,
						deviceId: device.deviceId,
					})
				);
				setSettingsConfig((prevConfig) => ({
					...prevConfig,
					audioOutputDeviceList: getLabels,
				}));
				if (getLabels.length > 0) {
					setSettingsConfig((prevConfig) => ({
						...prevConfig,
						selectedAudioOutputDevice:
							getLabels[0].deviceId,
					}));
				}
			});
	};

	const getVideoDevices = async () => {
		navigator.mediaDevices
			.enumerateDevices()
			.then((devices) => {
				const videoDevices = devices.filter(
					(device) => device.kind === 'videoinput'
				);

				const getLabels = videoDevices.map(
					(device) => ({
						label: device.label,
						deviceId: device.deviceId,
					})
				);

				setSettingsConfig((prevConfig) => ({
					...prevConfig,
					videoDeviceList: getLabels,
				}));
				if (getLabels.length > 0) {
					if (mediaDevices.video == '') {
						setSettingsConfig((prevConfig) => ({
							...prevConfig,
							selectedVideoDevice: getLabels[0].deviceId,
						}));
					} else {
						setSettingsConfig((prevConfig) => ({
							...prevConfig,
							selectedVideoDevice: mediaDevices.video,
						}));
					}
				}
			});
	};

	useEffect(() => {
		getVideoDevices();
		getAudioDevices();
		getAudioOutputDevices();
	}, []);

	useEffect(() => {
		acceptPeerCall();
		socket.on('add-to-room', (data) => {
			if (data.status === 'success') {
				console.log(data);
				setMembers(data.members);
				if (data.members.length > 1) {
					makePeerCall(data.members);
				}
			} else {
				console.error(data.message);
			}
		});

		socket.on('new-user', (data) => {
			const { newMember, members } = data;
			if (data.status === 'success') {
				setMembers(members);
				if (newMember.id != userId) {
					showToast(
						`${newMember.name} joined the room!`,
						'success'
					);
					playSound(enterSound);
				}
			} else {
				console.error(data.message);
			}
		});

		socket.on('update-user-state', (data) => {
			if (data.status === 'success') {
				setMembers(data.members);
			} else {
				console.error(data.message);
			}
		});

		socket.on('leave-room', (data) => {
			if (data.status === 'success') {
				setMembers((prevMembers) =>
					prevMembers.filter(
						(member) => member.id !== data.userId
					)
				);
				showToast(data.message, 'blank');
				playSound(exitSound);
			} else {
				console.error(data.message);
			}
		});

		return () => {
			socket.off('leave-room');
			socket.off('new-user');
			socket.off('add-to-room');
		};
	}, [socket]);

	useEffect(() => {
		if (isMounted) {
			const user = {
				userId: userId,
				roomId: String(MeetingData.roomId),
				isTalking: controls.isTalking,
				isMuted: controls.isMuted,
				isVideoCamOn: controls.isVideoCamOn,
				isCaptionsEnabled: controls.isCaptionsEnabled,
				isTranslationEnabled:
					controls.isTranslationEnabled,
			};
			socket.emit('update-user-state', user);
		}
	}, [controls]);

	const getCombinedStream =
		useCallback(async () => {
			const audioStream =
				await navigator.mediaDevices.getUserMedia({
					audio: {
						deviceId:
							settingsConfig.selectedAudioDevice,
					},
				});
			const videoStream =
				await navigator.mediaDevices.getUserMedia({
					video: {
						deviceId:
							settingsConfig.selectedVideoDevice,
					},
				});

			const combinedStream = new MediaStream([
				...audioStream.getAudioTracks(),
				...videoStream.getVideoTracks(),
			]);

			return combinedStream;
		}, [
			settingsConfig.selectedAudioDevice,
			settingsConfig.selectedVideoDevice,
		]);

	useEffect(() => {
		if (webcamRef.current && stream.remoteStream) {
			const videoTrack =
				stream.remoteStream.getVideoTracks()[0];
			const audioTrack =
				stream.remoteStream.getAudioTracks()[0];

			console.log(videoTrack, audioTrack);

			if (webcamRef.current) {
				const mediaStream = new MediaStream([
					videoTrack,
					audioTrack,
				]);

				webcamRef.current.srcObject = mediaStream;
			}
		}
	}, [stream, members]);

	const makePeerCall = async (members) => {
		const peerId = members.find(
			(member) => member.id !== userId
		).peerId;

		if (!peer) {
			console.error('Peer is not initialized');
			return;
		}

		const stream = await getCombinedStream();

		const call = peer.call(peerId, stream);
		if (!call) {
			console.error('Failed to make a call');
			return;
		}

		call.on('stream', (remoteStream) => {
			// Handle the remote stream
			console.log(
				'Received Acceptor remote stream',
				remoteStream
			);
			setStream((prevStream) => ({
				...prevStream,
				remoteStream: remoteStream,
			}));
		});

		call.on('error', (err) => {
			console.error('Call error:', err);
		});
	};

	const acceptPeerCall = async () => {
		const stream = await getCombinedStream();
		peer.on('call', (call) => {
			call.answer(stream);
			call.on('stream', (remoteStream) => {
				// Handle the remote stream
				console.log(
					'Received Caller remote stream',
					remoteStream
				);
				setStream((prevStream) => ({
					...prevStream,
					remoteStream: remoteStream,
				}));
			});
		});
	};

	useEffect(() => {
		if (Object.keys(MeetingData).length == 0) {
			navigate('/meeting');
		} else {
			console.log(MeetingData);
			socket.emit('add-to-room', {
				roomId: String(MeetingData.roomId),
				...MeetingData.user,
			});
			setIsMounted(true);
		}
	}, []);

	const toggleMic = () => {
		setControls((prevControls) => ({
			...prevControls,
			isMuted: prevControls.isMuted ? false : true,
		}));
	};

	const toggleVideo = () => {
		setControls((prevControls) => ({
			...prevControls,
			isVideoCamOn: prevControls.isVideoCamOn
				? false
				: true,
		}));

		if (controls.isVideoCamOn) {
			showToast('Video Disabled', 'success');
		} else {
			showToast('Video Enabled', 'success');
		}
	};

	const toggleCaptions = () => {
		setControls((prevControls) => ({
			...prevControls,
			isCaptionsEnabled:
				!prevControls.isCaptionsEnabled,
		}));

		setSettingsConfig((prevConfig) => ({
			...prevConfig,
			isCaptionsEnabled:
				!prevConfig.isCaptionsEnabled,
		}));

		if (controls.isCaptionsEnabled) {
			showToast('Captions disabled', 'success');
		} else {
			showToast('Captions enabled', 'success');
		}
	};

	const toggleTranslation = () => {
		setControls((prevControls) => ({
			...prevControls,
			isTranslationEnabled:
				!prevControls.isTranslationEnabled,
		}));
		setSettingsConfig((prevConfig) => ({
			...prevConfig,
			isTranslationEnabled:
				!prevConfig.isTranslationEnabled,
		}));

		if (controls.isTranslationEnabled) {
			showToast('Translation disabled', 'success');
		} else {
			showToast('Translation enabled', 'success');
		}
	};

	const leaveRoom = () => {
		socket.emit('leave-room', {
			roomId: String(MeetingData.roomId),
			userId: userId,
		});
		navigate('/meeting');
	};

	const shareRoom = async () => {
		const fallbackShare = () => {
			const message = `${MeetingData.host} has invited you to join the meeting. Use ${MeetingData.roomId} as the code to join the meeting. http://localhost:5173/meeting`;
			navigator.clipboard.writeText(message);
			showToast(
				'Invite copied to clipboard',
				'success'
			);
		};
		if (navigator.share) {
			const shareData = {
				title: 'Video Meeting Invite',
				text: `${MeetingData.host} has invited you to join the meeting. Use ${MeetingData.roomId} as the code to join the meeting.`,
				url: `http://localhost:5173/meeting`,
			};

			try {
				await navigator.share(shareData);
				showToast(
					'Invite Message Generated',
					'success'
				);
			} catch (err) {
				showToast('Error Sharing Invite', 'error');
			}
		} else {
			fallbackShare();
		}
	};

	const MemoizedWebcam = useMemo(() => {
		return (
			<Webcam
				className={styles.video}
				audio={false}
				mirrored={true}
				videoConstraints={
					controls.isVideoCamOn
						? {
								deviceId:
									settingsConfig.selectedVideoDevice,
						  }
						: false
				}
			/>
		);
	}, [
		settingsConfig.selectedVideoDevice,
		controls.isVideoCamOn,
	]);

	const RemoteVideo = (isMuted) => {
		return (
			<Webcam
				ref={webcamRef}
				className={styles.video}
				audio={!isMuted}
				mirrored={true}
			/>
		);
	};

	const RenderMembers = useCallback(() => {
		if (!Array.isArray(members)) {
			return null;
		}

		return members.map((member) => {
			return member.id == userId ? (
				<div
					key={member.id}
					className={styles.card}
				>
					<div className={styles.overlay}>
						<div className={styles.actionButtons}>
							<div className={styles.button}>
								{controls.isMuted ? (
									<IoMicOffSharp title='Muted' />
								) : (
									<IoMicSharp title='Unmuted' />
								)}
							</div>
							<div className={styles.button}>
								{controls.isVideoCamOn ? (
									<MdVideocam title='Video Camera On' />
								) : (
									<MdVideocamOff title='Video Camera Off' />
								)}
							</div>
							<div className={styles.talkingIndicator}>
								<div
									className={
										controls.isMuted
											? `${styles.iconWrapper} ${styles.stopAnimate}`
											: `${styles.iconWrapper} ${styles.animate}`
									}
								>
									<span></span>
									<span></span>
									<span></span>
								</div>
							</div>
						</div>
						<p>{member.name}</p>
					</div>
					{controls.isVideoCamOn && (
						<div className={styles.videoWrapper}>
							{MemoizedWebcam}
						</div>
					)}
					{!controls.isVideoCamOn && (
						<div className={styles.videoOff}>
							<InitialsAvatar
								className={styles.profile}
								name={member.name}
							/>
						</div>
					)}
				</div>
			) : (
				<div
					key={member.id}
					className={styles.card}
				>
					<div className={styles.overlay}>
						<div className={styles.actionButtons}>
							<div className={styles.button}>
								{member.isMuted ? (
									<IoMicOffSharp />
								) : (
									<IoMicSharp />
								)}
							</div>
							<div className={styles.button}>
								{member.isVideoCamOn ? (
									<MdVideocam />
								) : (
									<MdVideocamOff />
								)}
							</div>
							<div className={styles.talkingIndicator}>
								<div
									className={
										member.isMuted
											? `${styles.iconWrapper} ${styles.stopAnimate}`
											: `${styles.iconWrapper} ${styles.animate}`
									}
								>
									<span></span>
									<span></span>
									<span></span>
								</div>
							</div>
						</div>
						<p>{member.name}</p>
					</div>
					<div
						className={
							member.isVideoCamOn
								? `${styles.videoWrapper}`
								: `${styles.videoWrapper} ${styles.videoOff}
				`
						}
					>
						{RemoteVideo(member.isMuted)}
					</div>
					{!member.isVideoCamOn && (
						<div className={styles.videoOff}>
							<InitialsAvatar
								className={styles.profile}
								name={member.name}
							/>
						</div>
					)}
				</div>
			);
		});
	}, [members, controls, MemoizedWebcam, userId]);

	const Settings = ({
		settingsConfig,
		selectMic,
		selectVideo,
		selectSpeaker,
		isCaptionsEnabled,
		isTranslationEnabled,
		speakerLanguage,
	}) => {
		const leftItems = [
			{
				title: 'Media Devices',
				icon: <PiDevices />,
			},
			{
				title: 'Captions',
				icon: <BsCcCircle />,
			},
			{
				title: 'Translation',
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
										itemVisible === item.title
											? styles.focused
											: ''
									}`}
									onClick={() => {
										setItemVisible(item.title);
									}}
								>
									{item.icon}
									<p>{item.title}</p>
									{item.title == 'Translation' && (
										<BsStars />
									)}
								</div>
							);
						})}
					</div>
				</div>
				<div className={styles.right}>
					<h2>{itemVisible}</h2>
					{itemVisible === 'Media Devices' ? (
						<div className={styles.rightItem}>
							<div className={styles.audioWrapper}>
								<p>Microphone Devices</p>
								<select
									name=''
									id=''
									onChange={(e) => {
										console.log(e.target.value);
										selectMic(e.target.value);
									}}
									value={
										settingsConfig.selectedAudioDevice
									}
								>
									{settingsConfig.audioDeviceList.map(
										(device) => (
											<option
												key={device.deviceId}
												value={device.deviceId}
											>
												{device.label}
											</option>
										)
									)}
								</select>
							</div>
							<div className={styles.audioWrapper}>
								<p>Speaker Devices</p>
								<select
									name=''
									id=''
									onChange={(e) => {
										e.preventDefault();
										selectSpeaker(e.target.value);
									}}
									value={
										settingsConfig.selectedAudioOutputDevice
									}
								>
									{settingsConfig.audioOutputDeviceList.map(
										(device) => (
											<option
												key={device.deviceId}
												value={device.deviceId}
											>
												{device.label}
											</option>
										)
									)}
								</select>
							</div>
							<div className={styles.videoWrapper}>
								<p>Video Capture Devices</p>
								<select
									name=''
									id=''
									value={
										settingsConfig.selectedVideoDevice
									}
									onChange={(e) => {
										e.preventDefault();
										selectVideo(e.target.value);
									}}
								>
									{settingsConfig.videoDeviceList.map(
										(device, index) => (
											<option
												key={index}
												value={device.deviceId}
											>
												{device.label}
											</option>
										)
									)}
								</select>
							</div>
						</div>
					) : itemVisible === 'Captions' ? (
						<div className={styles.rightItem}>
							<div className={styles.capitonWrapper}>
								<div className={styles.info}>
									<h3>Enable Realtime Captions</h3>
									<p>
										Realtime captions are generated by
										identifying the speech in the audio
										stream and converting it to text
										<br />{' '}
										<b>
											(Supports English & Hindi Languages
											only).
										</b>
									</p>
								</div>
								<Switch
									className={styles.switch}
									checkedChildren={<CheckOutlined />}
									unCheckedChildren={<CloseOutlined />}
									defaultChecked={
										settingsConfig.isCaptionsEnabled
									}
									onChange={(checked) => {
										console.log(checked);
										if (checked) {
											showToast(
												'Captions Enabled',
												'success'
											);
											isCaptionsEnabled(true);
										} else {
											showToast(
												'Captions Disabled',
												'success'
											);
											isCaptionsEnabled(false);
										}
									}}
								/>
							</div>
						</div>
					) : itemVisible === 'Translation' ? (
						<div className={styles.rightItem}>
							<div className={styles.translationWrapper}>
								<div className={styles.headingWrapper}>
									<div className={styles.heading}>
										<h3>Enable Live Translation</h3>
										<p>
											Live translation is powered by Vocalize
											Powerful Machine Learning Model that
											translates the speech in real-time to
											the selected language.
										</p>
									</div>
									<Switch
										className={styles.switch}
										checkedChildren={<CheckOutlined />}
										unCheckedChildren={<CloseOutlined />}
										defaultChecked={
											settingsConfig.isTranslationEnabled
										}
										onChange={(checked) => {
											console.log(checked);
											if (checked) {
												showToast(
													'Translation Enabled',
													'success'
												);
												isTranslationEnabled(true);
											} else {
												showToast(
													'Translation Disabled',
													'success'
												);
												isTranslationEnabled(false);
											}
										}}
									/>
								</div>
								<div className={styles.optionsWrapper}>
									<div className={styles.languageSelector}>
										<p>Speaker is talking in : </p>
										<select
											name=''
											id=''
											value={settingsConfig.speakerLanguage}
											onChange={(e) => {
												if (e.target.value === 'Hindi') {
													speakerLanguage('Hindi');
												} else {
													speakerLanguage('English');
												}
											}}
										>
											<option value='English'>
												English
											</option>
											<option value='Hindi'>Hindi</option>
										</select>
									</div>
									<div className={styles.languageSelector}>
										<p>I want to listen in : </p>
										<select
											name=''
											id=''
											value={
												settingsConfig.speakerLanguage ==
												'English'
													? 'Hindi'
													: 'English'
											}
											onChange={(e) => {
												if (e.target.value === 'Hindi') {
													speakerLanguage('English');
												} else {
													speakerLanguage('Hindi');
												}
											}}
										>
											<option value='English'>
												English
											</option>
											<option value='Hindi'>Hindi</option>
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
				title='Leave Meeting?'
				open={isModalOpen}
				onOk={handleOk}
				onCancel={handleCancel}
				closable={true}
				centered
			>
				<p>Do You Really Want to Exit?</p>
			</Modal>
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
						setControls((prevControls) => ({
							...prevControls,
							isCaptionsEnabled: data,
						}));
					}}
					isTranslationEnabled={(data) => {
						setSettingsConfig((prevConfig) => ({
							...prevConfig,
							isTranslationEnabled: data,
						}));
						setControls((prevControls) => ({
							...prevControls,
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

			<div className={styles.titleBar}>
				<p className={styles.title}>
					Video Call by {MeetingData.host}
				</p>
				<p className={styles.membersCount}>
					{members.length}{' '}
					{members.length > 1 ? 'Members' : 'Member'}
				</p>
			</div>
			<div className={styles.cardWrapper}>
				{RenderMembers()}
			</div>
			{settingsConfig.isCaptionsEnabled && (
				<div className={styles.captionsWrapper}>
					<p>Generating . . .</p>
				</div>
			)}
			<div className={styles.bottomNavbar}>
				{controls.isMuted ? (
					<div
						className={styles.unfocus}
						onClick={toggleMic}
					>
						<IoMicOffSharp title='Muted' />
					</div>
				) : (
					<div
						className={styles.focus}
						onClick={toggleMic}
					>
						<IoMicSharp title='Unmuted' />
					</div>
				)}

				{!controls.isVideoCamOn ? (
					<div
						className={styles.unfocus}
						onClick={toggleVideo}
					>
						<MdVideocamOff />
					</div>
				) : (
					<div
						className={styles.focus}
						onClick={toggleVideo}
					>
						<MdVideocam />
					</div>
				)}

				{controls.isCaptionsEnabled ? (
					<div
						className={styles.focus}
						onClick={toggleCaptions}
					>
						<BsCcCircle />
					</div>
				) : (
					<div
						className={styles.unfocus}
						onClick={toggleCaptions}
					>
						<BsCcCircle />
					</div>
				)}
				{controls.isTranslationEnabled ? (
					<div
						className={styles.focus}
						onClick={toggleTranslation}
					>
						<BsTranslate />
					</div>
				) : (
					<div
						className={styles.unfocus}
						onClick={toggleTranslation}
					>
						<BsTranslate />
					</div>
				)}
				<div
					className={styles.hangUp}
					onClick={showModal}
				>
					<AiOutlineLogout />
				</div>

				<div
					className={styles.icon}
					onClick={shareRoom}
				>
					<GoPersonAdd />
				</div>

				<div
					className={styles.settings}
					onClick={() => {
						setIsSettingsVisible(true);
					}}
				>
					<IoMdSettings />
				</div>
			</div>
		</div>
	);
};

export default Meeting;
