import React, { useState, usEffect } from 'react';
import styles from '../Styles/WaitingArea.module.scss';
import {
	IoVideocam,
	IoVideocamOff,
	IoMicOffSharp,
	IoMicSharp,
} from 'react-icons/io5';
import videodemo from '../Assets/video.mp4';

const WaitingArea = ({
	userAccepted,
	userNotAccepted,
}) => {
	const [video, setVideo] = useState(true);
	const [audio, setAudio] = useState(true);

	const [channels, setChannels] = useState({
		video: '',
		audio: '',
	});

	const isAudioPermitted = () => {
		if (audio) {
			setAudio(false);
		} else {
			setAudio(true);
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
				<div className={styles.videoControls}>
					<div className={styles.button}></div>
				</div>
			</div>
			<div className={styles.right}></div>
		</div>
	);
};

export default WaitingArea;
