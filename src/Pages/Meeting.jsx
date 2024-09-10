import React, {
	useEffect,
	useState,
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
import { GoPersonAdd } from 'react-icons/go';
import { BsCcCircle } from 'react-icons/bs';
import { AiOutlineLogout } from 'react-icons/ai';
import { BsTranslate } from 'react-icons/bs';
import { IoMdSettings } from 'react-icons/io';
import { showToast } from '../Utils/toast';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/zoom.css';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useConnections } from './SocketPeerContext.jsx';
import { createUserId } from '../Utils/helper.js';
import enterSound from '../Assets/enter.mp3';
import exitSound from '../Assets/leave.mp3';

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
		isMuted: false,
		isVideoCamOn: false,
		isCaptionsEnabled: false,
		isTranslationEnabled: false,
	});

	const [members, setMembers] = useState([]);

	const [audioStream, setAudioStream] =
		useState(null);
	const [videoStream, setVideoStream] =
		useState(null);

	const playSound = (sound) => {
		const audioData = new Audio(sound);
		audioData.play();
	};

	useEffect(() => {
		socket.on('add-to-room', (data) => {
			if (data.status === 'success') {
				setMembers(data.members);
			} else {
				console.error(data.message);
			}
		});

		socket.on('new-user', (data) => {
			if (data.status === 'success') {
				setMembers(data.members);
				showToast(`User joined the room!`, 'success');
				playSound(enterSound);
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
		if (Object.keys(MeetingData).length == 0) {
			navigate('/meeting');
		} else {
			console.log(MeetingData);
			socket.emit('add-to-room', {
				roomId: String(MeetingData.roomId),
				...MeetingData.user,
			});
		}
	}, []);

	// const addToCookies = () => {
	// 	Cookies.set('roomId', MeetingData.roomId);
	// 	Cookies.set(
	// 		'MeetingData',
	// 		JSON.stringify(MeetingData)
	// 	);
	// };

	// const verifyRejoin = () => {
	// 	const roomId = Cookies.get('roomId') ?? '';
	// 	if (roomId != '') {
	// 		navigate(`/meeting/${roomId}`, {
	// 			state: { isWaiting: false },
	// 		});
	// 	}
	// };

	// const isRoomValid = () => {
	// 	const roomId = id;
	// 	if (roomId == '') {
	// 		navigate('/meeting');
	// 	} else if (Cookies.get('roomId') != roomId) {
	// 		navigate('/meeting');
	// 	} else if (Cookies.get('roomId') == roomId) {
	// 		socket.emit('valid-room', { roomId });
	// 	}
	// };

	const toggleMic = () => {
		setControls((prevControls) => ({
			...prevControls,
			isMuted: !prevControls.isMuted,
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
			isVideoCamOn: !prevControls.isVideoCamOn,
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

	return (
		<div className={styles.main}>
			<div className={styles.titleBar}>
				<p className={styles.title}>Meeting Title</p>
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

				{controls.isVideoOff ? (
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
					onClick={leaveRoom}
				>
					<AiOutlineLogout />
				</div>
				<div className={styles.icon}>
					<GoPersonAdd />
				</div>

				<div className={styles.settings}>
					<IoMdSettings />
				</div>
			</div>
		</div>
	);
};

export default Meeting;
