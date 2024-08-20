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
import videodemo from '../Assets/video.mp4';
import MediaDevices from 'media-devices';
import { supportsMediaDevices } from 'media-devices';
import { showToast } from '../Utils/toast.js';

const WaitingArea = ({
	userAccepted,
	userNotAccepted,
}) => {
	const [video, setVideo] = useState(true);
	const [audio, setAudio] = useState(true);

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
					<div
						error='true'
						className={styles.button}
					>
						<IoMicOffSharp />
					</div>
					<div
						error='true'
						className={styles.button}
					>
						<IoVideocamOff />
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
			<div className={styles.right}></div>
		</div>
	);
};

export default WaitingArea;
