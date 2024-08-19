import React, {
	useEffect,
	useState,
	useRef,
} from 'react';
import { useParams } from 'react-router-dom';
import styles from '../Styles/Meeting.module.scss';
import InitialsAvatar from 'react-initials-avatar';
import 'react-initials-avatar/lib/ReactInitialsAvatar.css';
import {
	IoMicSharp,
	IoMicOffSharp,
} from 'react-icons/io5';
import {
	MdVideocam,
	MdVideocamOff,
} from 'react-icons/md';
import { BsCcCircle } from 'react-icons/bs';
import { AiOutlineLogout } from 'react-icons/ai';
import { BsTranslate } from 'react-icons/bs';
import { IoMdMore } from 'react-icons/io';
import { IoMdSettings } from 'react-icons/io';
import mediaDevices from 'media-devices';
import { showToast } from '../Utils/toast';

import {
	ControlledMenu,
	MenuItem,
	useClick,
	useMenuState,
} from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/zoom.css';

import WaitingArea from './WaitingArea.jsx';

const Meeting = () => {
	const { id } = useParams();
	const MenuRef = useRef(null);
	const [menuState, toggleMenu] = useMenuState({
		transition: true,
	});
	const anchorProps = useClick(
		menuState.state,
		toggleMenu
	);
	const mYid = 1234;
	const [controls, setControls] = useState({
		isMicMuted: false,
		isVideoOff: false,
		isCaptionsEnabled: false,
		isTranslationEnabled: false,
	});
	const [members, setMembers] = useState([
		{
			id: 1234,
			name: 'Aditya Singh',
			isTalking: false,
			isVideoAvailable: false,
			isMuted: false,
		},
		{
			id: 2,
			name: 'Sonam Yadav',
			isTalking: false,
			isVideoAvailable: false,
			isMuted: true,
		},
	]);
	const [audioStream, setAudioStream] =
		useState(null);
	const [videoStream, setVideoStream] =
		useState(null);
	const [peerId, setPeerId] = useState(null);
	const [connections, setConnections] = useState(
		[]
	);

	const [pinnedMember, setPinnedMember] =
		useState(null);

	const call = async () => {
		const mediaDevice =
			await mediaDevices.getUserMedia({
				video: true,
				audio: true,
			});
	};

	const [isWaiting, setIsWaiting] = useState(true);

	// useEffect(() => {
	// 	// Initialize PeerJS
	// 	const peerInstance = new Peer();

	// 	peerInstance.on('open', (id) => {
	// 		setPeerId(id);
	// 	});

	// 	peerInstance.on('connection', (conn) => {
	// 		conn.on('data', (data) => {
	// 			console.log('Received', data);
	// 		});
	// 		setConnections((prevConnections) => [
	// 			...prevConnections,
	// 			conn,
	// 		]);
	// 	});

	// 	return () => {
	// 		peerInstance.destroy();
	// 	};
	// }, []);

	// useEffect(() => {
	// 	// Request microphone access
	// 	mediaDevices
	// 		.getUserMedia({ audio: true })
	// 		.then((stream) => {
	// 			setAudioStream(stream);
	// 			// You can process the audio stream here
	// 		})
	// 		.catch((err) => {
	// 			console.error(
	// 				'Error accessing microphone:',
	// 				err
	// 			);
	// 		});

	// 	// Request video access
	// 	mediaDevices
	// 		.getUserMedia({ video: true, audio: true })
	// 		.then((stream) => {
	// 			setVideoStream(stream);
	// 		})
	// 		.catch((err) => {
	// 			console.error('Error accessing camera:', err);
	// 		});

	// 	return () => {
	// 		if (audioStream) {
	// 			audioStream
	// 				.getTracks()
	// 				.forEach((track) => track.stop());
	// 		}
	// 		if (videoStream) {
	// 			videoStream
	// 				.getTracks()
	// 				.forEach((track) => track.stop());
	// 		}
	// 	};
	// }, []);

	const toggleMic = () => {
		setControls((prevControls) => ({
			...prevControls,
			isMicMuted: !prevControls.isMicMuted,
		}));

		if (audioStream) {
			audioStream
				.getAudioTracks()
				.forEach((track) => {
					track.enabled = !controls.isMicMuted;
				});
		}
	};

	const toggleVideo = () => {
		setControls((prevControls) => ({
			...prevControls,
			isVideoOff: !prevControls.isVideoOff,
		}));

		if (videoStream) {
			videoStream
				.getVideoTracks()
				.forEach((track) => {
					track.enabled = !controls.isVideoOff;
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

	const connectToPeer = (peerId) => {
		const conn = peer.connect(peerId);
		conn.on('open', () => {
			conn.send('Hello from ' + peer.id);
		});
		setConnections((prevConnections) => [
			...prevConnections,
			conn,
		]);
	};

	const showCardMenu = () => {
		return (
			<ControlledMenu
				{...menuState}
				anchorRef={MenuRef}
				onClose={() => toggleMenu(false)}
			>
				<MenuItem
					onClick={(e) => {
						setPinnedMember(e.member.id);
					}}
				>
					Pin
				</MenuItem>
			</ControlledMenu>
		);
	};

	const renderMembers = () => {
		return members.map((member, index) => {
			return member.id == mYid ? (
				<div
					key={index}
					className={styles.card}
				>
					<div className={styles.actionButtons}>
						<div className={styles.button}>
							{controls.isMicMuted ? (
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
					key={index}
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
						<div
							className={styles.button}
							ref={MenuRef}
							{...anchorProps}
						>
							<IoMdMore />
							{showCardMenu()}
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

	return isWaiting ? (
		<WaitingArea />
	) : (
		<div className={styles.main}>
			<div className={styles.titleBar}>
				<p className={styles.title}>Meeting Title</p>
				<p className={styles.membersCount}>
					{members.length} Participants
				</p>
			</div>
			<div className={styles.cardWrapper}>
				{renderMembers()}
			</div>
			<div className={styles.bottomNavbar}>
				{controls.isMicMuted ? (
					<div
						className={styles.micOff}
						onClick={toggleMic}
					>
						<IoMicOffSharp />
					</div>
				) : (
					<div
						className={styles.micOn}
						onClick={toggleMic}
					>
						<IoMicSharp />
					</div>
				)}

				{controls.isVideoOff ? (
					<div
						className={styles.micOff}
						onClick={toggleVideo}
					>
						<MdVideocamOff />
					</div>
				) : (
					<div
						className={styles.micOn}
						onClick={toggleVideo}
					>
						<MdVideocam />
					</div>
				)}

				{controls.isCaptionsEnabled ? (
					<div
						className={styles.micOn}
						onClick={toggleCaptions}
					>
						<BsCcCircle />
					</div>
				) : (
					<div
						className={styles.micOff}
						onClick={toggleCaptions}
					>
						<BsCcCircle />
					</div>
				)}
				{controls.isTranslationEnabled ? (
					<div
						className={styles.micOn}
						onClick={toggleTranslation}
					>
						<BsTranslate />
					</div>
				) : (
					<div
						className={styles.micOff}
						onClick={toggleTranslation}
					>
						<BsTranslate />
					</div>
				)}
				<div className={styles.hangUp}>
					<AiOutlineLogout />
				</div>

				<div className={styles.settings}>
					<IoMdSettings />
				</div>
			</div>
		</div>
	);
};

export default Meeting;
