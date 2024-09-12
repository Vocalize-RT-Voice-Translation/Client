import React, {
	useState,
	useEffect,
	useMemo,
} from 'react';
import styles from '../Styles/WaitingArea.module.scss';
import {
	IoVideocam,
	IoVideocamOff,
	IoMicOffSharp,
	IoMicSharp,
} from 'react-icons/io5';
import { MdOutlineErrorOutline } from 'react-icons/md';
import { FaRegCircleCheck } from 'react-icons/fa6';
import MediaDevices from 'media-devices';
import { supportsMediaDevices } from 'media-devices';
import { showToast } from '../Utils/toast.js';
import person from '../Assets/person.jpg';
import { useParams } from 'react-router-dom';
import Loader from './Loader.jsx';
import { useConnections } from './SocketPeerContext.jsx';
import { useNavigate } from 'react-router-dom';
import { createUserId } from '../Utils/helper.js';
import {
	FiMicOff,
	FiVideoOff,
} from 'react-icons/fi';
import Webcam from 'react-webcam';

const WaitingArea = () => {
	const { socket, peer } = useConnections();
	const roomId = useParams().id ?? 746464;

	const [isLoading, setIsLoading] = useState({
		loading: false,
		message: 'Fetching Room Details',
	});

	const userId = createUserId();
	const navigate = useNavigate();
	const [video, setVideo] = useState(true);
	const [audio, setAudio] = useState(true);

	const [mediaConfigs, setMediaConfigs] = useState(
		{
			audio: true,
			video: true,
		}
	);

	const [roomDetails, setRoomDetails] = useState({
		host: '',
		memberList: [],
		membersCount: 0,
	});

	const [joineeDetails, setJoineeDetails] =
		useState({
			joinee: false,
			name: 'Guest',
			peerId: '',
		});

	const [channels, setChannels] = useState({
		video: [],
		audio: [],
	});

	const [selectedDevices, setSelectedDevices] =
		useState({
			video: '',
			audio: '',
		});

	const [devices, setDevices] = useState({
		audio: [],
		video: [],
	});

	const [
		isPermissionGranted,
		setIsPermissionGranted,
	] = useState(false);

	const [isAudioAvailable, setIsAudioAvailable] =
		useState(false);

	const [isVideoAvailable, setIsVideoAvailable] =
		useState(false);

	const getPermission = () => {
		navigator.mediaDevices
			.getUserMedia({
				video: true,
				audio: true,
			})
			.then((stream) => {
				stream.getTracks().forEach((track) => {
					track.stop();
				});
				setIsPermissionGranted(true);
			})
			.catch((err) => {
				setIsPermissionGranted(false);
			});

		navigator.mediaDevices
			.enumerateDevices()
			.then((devices) => {
				const audioDevices = devices.filter(
					(device) => device.kind === 'audioinput'
				);
				const videoDevices = devices.filter(
					(device) => device.kind === 'videoinput'
				);
				setDevices({
					audio: audioDevices,
					video: videoDevices,
				});
			});
	};

	useEffect(() => {
		getPermission();

		socket.on('get-room-data', (data) => {
			if (data.status == 'failed') {
				showToast('No Meeting Found!', 'error');
				setIsLoading({
					...isLoading,
					message: 'No Meeting Found',
				});
				// setTimeout(() => {
				// 	window.location.href = '/meeting';
				// }, 2000);
			} else {
				setIsLoading({
					loading: false,
					message: 'Room Details Fetched',
				});
				setRoomDetails({
					host: data.host,
					memberList: data.memberList,
					membersCount: data.membersCount,
				});
			}
		});

		return () => {
			socket.off('room-data');
		};
	}, []);

	useEffect(() => {
		const queryParams = new URLSearchParams(
			location.search
		);
		setJoineeDetails(() => {
			return {
				roomId: roomId,
				joinee: queryParams.get('joinee') ?? false,
				name: queryParams.get('name') ?? 'Guest',
				peerId: peer.id,
			};
		});
		getRoomData();
	}, []);

	const getRoomData = () => {
		socket.emit('get-room-data', {
			roomId,
		});
	};

	const checkPermission = async () => {
		try {
			const stream =
				await navigator.mediaDevices.getUserMedia({
					video: true,
					audio: true,
				});
			stream.getTracks().forEach((track) => {
				track.stop();
			});
			setIsPermissionGranted(true);
			getAudioDevices();
			getVideoDevices();
		} catch (error) {
			setIsPermissionGranted(false);
		}
	};

	const getAudioDevices = async () => {
		const devices =
			await MediaDevices.enumerateDevices();
		const audioDevices = devices.filter(
			(device) => device.kind === 'audioinput'
		);
		setDevices((devices) => ({
			...devices,
			audio: audioDevices,
		}));
		if (audioDevices.length > 0) {
			setIsAudioAvailable(true);
		}
	};

	const getVideoDevices = async () => {
		const devices =
			await MediaDevices.enumerateDevices();
		const videoDevices = devices.filter(
			(device) => device.kind === 'videoinput'
		);
		setDevices((devices) => ({
			...devices,
			video: videoDevices,
		}));
		if (videoDevices.length > 0) {
			setIsVideoAvailable(true);
		}
	};

	useEffect(() => {
		if (supportsMediaDevices()) {
			checkPermission();
		} else {
			showToast(
				'Your browser does not support Media Devices',
				'error'
			);
		}
	}, []);

	const RenderJoinees = () => {
		return (
			<p>
				{`${roomDetails.memberList.length}`} people
				have joined the call
			</p>
		);
	};

	const joinIn = () => {
		if (roomDetails.membersCount <= 1) {
			const data = {
				roomId: String(roomId),
				host: roomDetails.host,
				user: {
					id: userId,
					name: joineeDetails.name,
					roomId: String(roomId),
					socketId: socket.id,
					peerId: peer.id,
					isTalking: false,
					isMuted: !mediaConfigs.audio,
					isVideoCamOn: mediaConfigs.video,
					mediaDevices: selectedDevices,
					isHost: false,
				},
			};
			navigate(`/meeting/${roomId}`, {
				state: { isWaiting: false, data: data },
			});
		} else {
			showToast('Meeting is full', 'error');
		}
	};

	const getMemoizedVideo = () =>
		useMemo(() => {
			return mediaConfigs.video ? (
				<Webcam
					className={styles.webcam}
					audio={false}
					video={video}
					screenshotFormat='image/jpeg'
					videoConstraints={{
						deviceId: selectedDevices.video,
					}}
				></Webcam>
			) : (
				<div className={styles.noVideo}>
					<FiVideoOff />
					{!mediaConfigs.audio && <FiMicOff />}
				</div>
			);
		}, [selectedDevices.video, mediaConfigs]);

	const stopVideoTracks = () => {
		navigator.mediaDevices
			.getUserMedia({ video: true, audio: true })
			.then((stream) => {
				stream.getVideoTracks().forEach((track) => {
					track.stop();
				});
			})
			.catch((err) => {
				console.error(
					'Error stopping video tracks:',
					err
				);
			});
	};

	return (
		<>
			{isLoading.loading == true ? (
				<Loader message={isLoading.message} />
			) : (
				<div className={styles.main}>
					<div className={styles.left}>
						<div className={styles.videoWrapper}>
							{getMemoizedVideo()}
						</div>
						<p>This is how you will be appearing!</p>
						<div className={styles.videoControls}>
							{mediaConfigs.audio ? (
								<div
									error='false'
									className={styles.button}
									onClick={() =>
										setMediaConfigs({
											...mediaConfigs,
											audio: !mediaConfigs.audio,
										})
									}
								>
									<IoMicSharp />
								</div>
							) : (
								<div
									error='true'
									className={styles.button}
									onClick={() =>
										setMediaConfigs({
											...mediaConfigs,
											audio: !mediaConfigs.audio,
										})
									}
								>
									<IoMicOffSharp />
								</div>
							)}
							{mediaConfigs.video ? (
								<div
									error='false'
									className={styles.button}
									onClick={() => {
										setMediaConfigs({
											...mediaConfigs,
											video: !mediaConfigs.video,
										});
										stopVideoTracks();
									}}
								>
									<IoVideocam />
								</div>
							) : (
								<div
									error='true'
									className={styles.button}
									onClick={() =>
										setMediaConfigs({
											...mediaConfigs,
											video: !mediaConfigs.video,
										})
									}
								>
									<IoVideocamOff />
								</div>
							)}
						</div>
					</div>
					<div className={styles.right}>
						<div className={styles.meetingInfo}>
							<h2>
								{roomDetails.host} is inviting you for
								Video Chat
							</h2>
							<p>
								Meeting Created by {roomDetails.host}
							</p>
							<div className={styles.meetingJoinees}>
								<RenderJoinees />
							</div>
							<div
								className={styles.joinButton}
								onClick={joinIn}
							>
								<p>Join In</p>
								<FaRegCircleCheck />
							</div>
						</div>
						{isPermissionGranted ? (
							<div className={styles.channelsWrapper}>
								<p>Audio Input Device</p>
								<select
									name=''
									id=''
									onChange={(e) =>
										setSelectedDevices({
											...selectedDevices,
											audio: e.target.value,
										})
									}
								>
									{devices.audio.map((device) => (
										<option
											key={device.deviceId}
											value={device.deviceId}
										>
											{device.label}
										</option>
									))}
								</select>
								<p>Video Input Device</p>
								<select
									name=''
									id=''
									onChange={(e) =>
										setSelectedDevices({
											...selectedDevices,
											video: e.target.value,
										})
									}
								>
									{devices.video.map((device) => (
										<option
											key={device.deviceId}
											value={device.deviceId}
										>
											{device.label}
										</option>
									))}
								</select>
							</div>
						) : (
							<div className={styles.notPermitted}>
								<MdOutlineErrorOutline />
								<p>
									Please Allow Microphone and Camera
									Permissions to show Devices
								</p>
								<div
									className={styles.approvePermission}
									onClick={checkPermission}
								>
									<p>Grant Permission</p>
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</>
	);
};

export default WaitingArea;
