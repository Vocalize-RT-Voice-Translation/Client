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
import useConnections from '../Components/useConnections.jsx';
import { useParams } from 'react-router-dom';
import Loader from './Loader.jsx';

const WaitingArea = () => {
	const { id: roomId = 99999 } = useParams();

	const {
		socketId,
		emitSocketEvent,
		onSocketEvent,
		socketOff,
		peerId,
	} = useConnections();

	const [isLoading, setIsLoading] = useState({
		loading: true,
		message: 'Fetching Room Details',
	});
	const [video, setVideo] = useState(true);
	const [audio, setAudio] = useState(true);
	const [joineeDetails, setJoineeDetails] =
		useState({});

	const [isAudioAvailable, setIsAudioAvailable] =
		useState(false);
	const [isVideoAvailable, setIsVideoAvailable] =
		useState(false);

	const [joinedUsers, setJoinedUsers] = useState(
		[]
	);

	const [roomDetails, setRoomDetails] = useState(
		{}
	);

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

	const getRoomData = () => {
		emitSocketEvent('fetch-room-data', {
			roomId: roomId,
		});
	};

	useEffect(() => {
		const queryParams = new URLSearchParams(
			location.search
		);
		setJoineeDetails(() => {
			return {
				joinee: queryParams.get('joinee') ?? false,
				name: queryParams.get('name') ?? 'Guest',
				peerId: peerId,
			};
		});

		getRoomData();
	}, []);

	useEffect(() => {
		onSocketEvent('room-data', (data) => {
			if (data.message == 'Room not found') {
				showToast('No Meeting Found!', 'error');
				setIsLoading({
					...isLoading,
					message: 'No Meeting Found',
				});
				setTimeout(() => {
					window.location.href = '/meeting';
				}, 2000);
			} else {
				setIsLoading({
					loading: false,
					message: 'Room Details Fetched',
				});
				setRoomDetails(data);
			}
		});

		return () => {
			socketOff('room-details');
		};
	}, []);

	useEffect(() => {
		if (roomDetails) {
			console.log(roomDetails);
			setJoinedUsers(roomDetails.joinees);
		}
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
		if (joinedUsers) {
			if (joinedUsers.length == 0 || !joinedUsers) {
				return <p>No one has joined yet!</p>;
			}
			if (
				joinedUsers.length > 1 &&
				joinedUsers.length < 3
			) {
				return (
					<p>
						{joinedUsers[0].name} and{' '}
						{joinedUsers[1].name} are in this call
					</p>
				);
			}
			if (joinedUsers.length == 1) {
				return (
					<p>{joinedUsers[0].name} is in this call</p>
				);
			}
		} else {
			return <p>Rendering Joined Users . . .</p>;
		}
	};

	useEffect(() => {
		onSocketEvent('join-room', (data) => {
			console.log(data);
		});

		return () => {
			socketOff('join-room');
		};
	});

	const joinIn = () => {
		emitSocketEvent('join-room', {
			roomId: roomId,
			joinee: joineeDetails,
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
