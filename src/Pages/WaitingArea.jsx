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
// import videodemo from '../Assets/video.mp4';
import MediaDevices from 'media-devices';
import { supportsMediaDevices } from 'media-devices';
import { showToast } from '../Utils/toast.js';

const WaitingArea = ({
	userAccepted,
	userNotAccepted,
	meetingInfo = {},
}) => {
	const [video, setVideo] = useState(true);
	const [audio, setAudio] = useState(true);

	const { meetingId, joinedUsers = 0 } =
		meetingInfo;

	const [isAudioAvailable, setIsAudioAvailable] =
		useState(false);
	const [isVideoAvailable, setIsVideoAvailable] =
		useState(false);

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

	const renderJoinees = () => {
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
	};

	return (
		<div className={styles.main}>
			<div className={styles.left}>
				<div className={styles.videoWrapper}>
					<video
						muted
						autoPlay
						loop
						src={videodemo}
					></video>
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
					<h2>Meeting Title</h2>
					<p>Meeting Created by Aditya</p>
					<div className={styles.meetingJoinees}>
						{<renderJoinees />}
					</div>
					<div className={styles.joinButton}>
						<p>Ask to Join</p>
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
	);
};

export default WaitingArea;
