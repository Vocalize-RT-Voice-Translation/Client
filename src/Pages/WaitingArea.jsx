import React, {
	useState,
	useEffect,
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

const WaitingArea = () => {
	const { socket, peer } = useConnections();
	const roomId = useParams().id ?? 746464;

	console.log(roomId);

	const [isLoading, setIsLoading] = useState({
		loading: false,
		message: 'Fetching Room Details',
	});

	const userId = createUserId();

	const navigate = useNavigate();
	const [video, setVideo] = useState(true);
	const [audio, setAudio] = useState(true);

	const [isAudioAvailable, setIsAudioAvailable] =
		useState(false);
	const [isVideoAvailable, setIsVideoAvailable] =
		useState(false);

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

	const [devices, setDevices] = useState({
		audio: [],
		video: [],
	});

	const [
		isPermissionGranted,
		setIsPermissionGranted,
	] = useState(false);

	useEffect(() => {
		console.log(joineeDetails);
	}, [joineeDetails]);

	useEffect(() => {
		console.log(socket.id);
		socket.on('get-room-data', (data) => {
			console.log(data);
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

	useEffect(() => {
		console.log(roomDetails);
	}, [roomDetails]);

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
					isMuted: true,
					isVideoCamOn: false,
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

	return (
		<>
			{isLoading.loading == true ? (
				<Loader message={isLoading.message} />
			) : (
				<div className={styles.main}>
					<div className={styles.left}>
						<div className={styles.videoWrapper}>
							<img
								muted
								autoPlay
								loop
								src={person}
							></img>
						</div>
						<p>This is how you will be appearing!</p>
						<div className={styles.videoControls}>
							{audio ? (
								<div
									error='false'
									className={styles.button}
									onClick={() => setAudio(false)}
								>
									<IoMicSharp />
								</div>
							) : (
								<div
									error='true'
									className={styles.button}
									onClick={() => setAudio(true)}
								>
									<IoMicOffSharp />
								</div>
							)}
							{video ? (
								<div
									error='false'
									className={styles.button}
									onClick={() => setVideo(false)}
								>
									<IoVideocam />
								</div>
							) : (
								<div
									error='true'
									className={styles.button}
									onClick={() => setVideo(true)}
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
										setChannels({
											...channels,
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
										setChannels({
											...channels,
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
