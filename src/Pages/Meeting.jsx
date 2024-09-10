// React Essentials
import React, {
	useEffect,
	useState,
} from 'react';
import { useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

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
import { BsTranslate } from 'react-icons/bs';
import { IoMdSettings } from 'react-icons/io';
import { CiBoxList } from 'react-icons/ci';
import { BsStars } from 'react-icons/bs';
import { PiDevices } from 'react-icons/pi';

// Imports
import { showToast } from '../Utils/toast';
import { useConnections } from './SocketPeerContext.jsx';
import { createUserId } from '../Utils/helper.js';
import InitialsAvatar from 'react-initials-avatar';

// Assets
import enterSound from '../Assets/enter.mp3';
import exitSound from '../Assets/leave.mp3';

// Ant Design Component
import { Button, Modal, Switch } from 'antd';
import {
	CheckOutlined,
	CloseOutlined,
} from '@ant-design/icons';

const Meeting = () => {
	const { socket, peer } = useConnections();

	const userId = createUserId();

	const { id } = useParams();

	const navigate = useNavigate();
	const location = useLocation();

	const MeetingData = location.state.data;

	const [stream, setStream] = useState({
		localAudioStream: null,
		localVideoStream: null,
		remoteAudioStream: null,
		remoteVideoStream: null,
	});

	const { roomId, user } = MeetingData;

	const [controls, setControls] = useState({
		isTalking: false,
		isMuted: true,
		isVideoCamOn: false,
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

	const [audioStream, setAudioStream] =
		useState(null);
	const [videoStream, setVideoStream] =
		useState(null);

	const playSound = (sound) => {
		const audioData = new Audio(sound);
		audioData.play();
	};

	const makePeerCall = () => {
		const call = peer.call(
			'remote-peer-id',
			stream.localStream
		);
		call.on('stream', (remoteStream) => {
			setStream((prevStream) => ({
				...prevStream,
				remoteStream,
			}));
		});
	};

	const [audioDevices, setAudioDevices] = useState(
		[]
	);
	const [videoDevices, setVideoDevices] = useState(
		[]
	);

	const [
		audioOutputDevices,
		setAudioOutputDevices,
	] = useState([]);

	const [
		selectedAudioDevice,
		setSelectedAudioDevice,
	] = useState('');

	const [
		selectedAudioOutputDevice,
		setSelectedAudioOutputDevice,
	] = useState('');

	const [
		selectedVideoDevice,
		setSelectedVideoDevice,
	] = useState('');

	useEffect(() => {
		getVideoDevices();
		getAudioDevices();
		getAudioOutputDevices();
	}, []);

	const getAudioDevices = async () => {
		navigator.mediaDevices
			.enumerateDevices()
			.then((devices) => {
				const audioDevices = devices.filter(
					(device) => device.kind === 'audioinput'
				);
				console.log(audioDevices);
				const getLabels = audioDevices.map(
					(device) => device.label
				);
				setAudioDevices(getLabels);
				if (getLabels.length > 0) {
					setSelectedAudioDevice(getLabels[0]);
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
				console.log(audioOutputDevices);
				const getLabels = audioOutputDevices.map(
					(device) => device.label
				);
				setAudioOutputDevices(getLabels);
				if (getLabels.length > 0) {
					setSelectedAudioOutputDevice(getLabels[0]);
				}
			});
	};

	const getVideoDevices = async () => {
		navigator.mediaDevices
			.enumerateDevices()
			.then((devices) => {
				console.log(devices);
				const videoDevices = devices.filter(
					(device) => device.kind === 'videoinput'
				);
				const getLabels = videoDevices.map(
					(device) => device.label
				);
				setVideoDevices(getLabels);
				if (getLabels.length > 0) {
					setSelectedAudioDevice(getLabels[0]);
				}
			});
	};

	const getMediaStream = async (
		audioDeviceId,
		videoDeviceId
	) => {
		try {
			const constraints = {
				audio: audioDeviceId
					? { deviceId: { exact: audioDeviceId } }
					: true,
				video: videoDeviceId
					? { deviceId: { exact: videoDeviceId } }
					: true,
			};
			const stream =
				await navigator.mediaDevices.getUserMedia(
					constraints
				);
			setAudioStream(stream);
			setVideoStream(stream);
			console.log(stream);
		} catch (error) {
			if (error.name === 'OverconstrainedError') {
				console.error(
					'OverconstrainedError: The specified device constraints cannot be satisfied.',
					error
				);
				// Fallback to default devices
				try {
					const fallbackStream =
						await navigator.mediaDevices.getUserMedia({
							audio: true,
							video: true,
						});
					setAudioStream(fallbackStream);
					setVideoStream(fallbackStream);
					console.log(fallbackStream);
				} catch (fallbackError) {
					console.error(
						'Error accessing fallback media devices.',
						fallbackError
					);
				}
			} else {
				console.error(
					'Error accessing media devices.',
					error
				);
			}
		}
	};

	useEffect(() => {
		if (
			selectedAudioDevice &&
			selectedVideoDevice
		) {
			console.log('here');
			getMediaStream(
				selectedAudioDevice,
				selectedVideoDevice
			);
		}

		return () => {
			if (audioStream) {
				audioStream
					.getTracks()
					.forEach((track) => track.stop());
			}
			if (videoStream) {
				videoStream
					.getTracks()
					.forEach((track) => track.stop());
			}
		};
	}, [selectedAudioDevice, selectedVideoDevice]);

	useEffect(() => {
		socket.on('add-to-room', (data) => {
			if (data.status === 'success') {
				setMembers(data.members);
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

		if (audioStream) {
			audioStream
				.getAudioTracks()
				.forEach((track) => {
					track.enabled = !controls.isMuted;
				});
		}
	};

	const toggleVideo = () => {
		setControls((prevControls) => ({
			...prevControls,
			isVideoCamOn: prevControls.isVideoCamOn
				? false
				: true,
		}));

		if (videoStream) {
			videoStream
				.getVideoTracks()
				.forEach((track) => {
					track.enabled = !controls.isVideoCamOn;
				});
		}
	};

	const toggleCaptions = () => {
		setControls((prevControls) => ({
			...prevControls,
			isCaptionsEnabled:
				!prevControls.isCaptionsEnabled,
		}));

		if (controls.isCaptionsEnabled) {
			showToast('Captions disabled', 'blank');
		} else {
			showToast('Captions enabled', 'blank');
		}
	};

	const toggleTranslation = () => {
		setControls((prevControls) => ({
			...prevControls,
			isTranslationEnabled:
				!prevControls.isTranslationEnabled,
		}));

		if (controls.isTranslationEnabled) {
			showToast('Translation disabled', 'blank');
		} else {
			showToast('Translation enabled', 'blank');
		}
	};

	const leaveRoom = () => {
		socket.emit('leave-room', {
			roomId: String(MeetingData.roomId),
			userId: userId,
		});
		navigate('/meeting');
	};

	const RenderMembers = () => {
		if (!Array.isArray(members)) {
			return null;
		}

		return members.map((member, index) => {
			return member.id == userId ? (
				<div
					key={member.id}
					className={styles.card}
				>
					<div className={styles.actionButtons}>
						<div className={styles.button}>
							{controls.isMuted ? (
								<IoMicOffSharp />
							) : (
								<IoMicSharp />
							)}
						</div>
					</div>
					<InitialsAvatar
						className={styles.profile}
						name={member.name}
					/>
					<p>{member.name}</p>
				</div>
			) : (
				<div
					key={member.id}
					className={styles.card}
				>
					<div className={styles.actionButtons}>
						<div
							className={styles.button}
							data-disable-hover='true'
						>
							{member.isMuted ? (
								<IoMicOffSharp />
							) : (
								<IoMicSharp />
							)}
						</div>
					</div>
					<InitialsAvatar
						className={styles.profile}
						name={member.name}
					/>
					<p>{member.name}</p>
				</div>
			);
		});
	};

	const Settings = ({
		videoDevice,
		audioDevice,
		audioOutputDevice,
		audioDeviceList,
		videoDeviceList,
		audioOutputDeviceList,
		selectedAudioDevice,
		selectedVideoDevice,
		selectedAudioOutputDevice,
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

		const [languageConfig, setLanguageConfig] =
			useState({
				speaker: 'English',
				listener: 'Hindi',
			});

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
										audioDevice(e.target.value);
									}}
									value={selectedAudioDevice}
								>
									{audioDeviceList.map((device) => (
										<option
											key={device}
											value={device}
										>
											{device}
										</option>
									))}
								</select>
							</div>
							<div className={styles.audioWrapper}>
								<p>Speaker Devices</p>
								<select
									name=''
									id=''
									onChange={(e) => {
										console.log(e.target.value);
										audioOutputDevice(e.target.value);
									}}
									value={selectedAudioOutputDevice}
								>
									{audioOutputDeviceList.map((device) => (
										<option
											key={device}
											value={device}
										>
											{device}
										</option>
									))}
								</select>
							</div>
							<div className={styles.videoWrapper}>
								<p>Video Capture Devices</p>
								<select
									name=''
									id=''
									value={selectedVideoDevice}
									onChange={(e) => {
										console.log(e.target.value);
										videoDevice(e.target.value);
									}}
								>
									{videoDeviceList.map((device) => (
										<option
											key={device}
											value={device}
										>
											{device}
										</option>
									))}
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
									defaultChecked={false}
									onChange={(checked) => {
										console.log(checked);
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
										defaultChecked={false}
										onChange={(checked) => {
											console.log(checked);
										}}
									/>
								</div>
								<div className={styles.optionsWrapper}>
									<div className={styles.languageSelector}>
										<p>Speaker is talking in : </p>
										<select
											name=''
											id=''
											value={languageConfig.speaker}
											onChange={(e) => {
												if (e.target.value === 'Hindi') {
													setLanguageConfig({
														speaker: 'Hindi',
														listener: 'English',
													});
												} else {
													setLanguageConfig({
														speaker: 'English',
														listener: 'Hindi',
													});
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
											value={languageConfig.listener}
											onChange={(e) => {
												if (e.target.value === 'Hindi') {
													setLanguageConfig({
														speaker: 'English',
														listener: 'Hindi',
													});
												} else {
													setLanguageConfig({
														speaker: 'Hindi',
														listener: 'English',
													});
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
				width='50%'
			>
				<Settings
					audioDevice={(device) => {
						setSelectedAudioDevice(device);
					}}
					videoDevice={(device) => {
						setSelectedVideoDevice(device);
					}}
					audioDeviceList={audioDevices}
					videoDeviceList={videoDevices}
					selectedAudioDevice={selectedAudioDevice}
					selectedVideoDevice={selectedVideoDevice}
					audioOutputDevice={(device) => {
						setSelectedAudioOutputDevice(device);
					}}
					audioOutputDeviceList={audioOutputDevices}
					selectedAudioOutputDevice={
						selectedAudioOutputDevice
					}
				/>
			</Modal>

			<div className={styles.titleBar}>
				<p className={styles.title}>
					Video Call by {MeetingData.host}
				</p>
				<p className={styles.membersCount}>
					{members.length} Participants
				</p>
			</div>
			<div className={styles.cardWrapper}>
				<RenderMembers />
			</div>
			<div className={styles.bottomNavbar}>
				{controls.isMuted ? (
					<div
						className={styles.unfocus}
						onClick={toggleMic}
					>
						<IoMicOffSharp />
					</div>
				) : (
					<div
						className={styles.focus}
						onClick={toggleMic}
					>
						<IoMicSharp />
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

				<div className={styles.icon}>
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
