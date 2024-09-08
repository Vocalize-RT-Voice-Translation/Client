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
import { IoMdMore } from 'react-icons/io';
import { IoMdSettings } from 'react-icons/io';
import mediaDevices from 'media-devices';
import { showToast } from '../Utils/toast';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/zoom.css';
import useConnections from '../Components/useConnections.jsx';
import { useLocation } from 'react-router-dom';
import enterRoom from '../Assets/enter.mp3';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const Meeting = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const location = useLocation();

	const [joinee, setJoinee] = useState(false);

	const [MeetingData, setMeetingData] = useState(
		location?.state?.data ?? {}
	);

	const { roomId, Host, Joinee, myId } =
		MeetingData;

	const [controls, setControls] = useState({
		isMicMuted: false,
		isVideoOff: false,
		isCaptionsEnabled: false,
		isTranslationEnabled: false,
	});

	const [members, setMembers] = useState([]);

	const [audioStream, setAudioStream] =
		useState(null);
	const [videoStream, setVideoStream] =
		useState(null);

	const [pinnedMember, setPinnedMember] =
		useState(null);

	const call = async () => {
		const mediaDevice =
			await mediaDevices.getUserMedia({
				video: true,
				audio: true,
			});
	};

	useEffect(() => {
		console.log(MeetingData);
		if (Object.keys(MeetingData).length != 0) {
			Cookies.set('roomId', MeetingData.roomId);
			Cookies.set(
				'MeetingData',
				JSON.stringify(MeetingData)
			);
		}

		const roomId = Cookies.get('roomId') ?? '';

		if (roomId != '' && roomId == id) {
			if (MeetingData == {}) {
				setIswaiting(false);
				setMeetingData(
					JSON.parse(Cookies.get('MeetingData'))
				);
				getMembers();
			}
		}
		// } else {
		// 	navigate('/meeting');
		// }
	}, []);

	useEffect(() => {
		onSocketEvent('join-meeting', (data) => {
			if (data.status == 'success') {
				playEnter();
				setIswaiting(false);
				showToast('Joined the meeting', 'success');
			}
		});

		onSocketEvent('get-members', (data) => {
			console.log(data);
		});

		return () => {
			socketOff('join-meeting');
			socketOff('get-members');
		};
	}, []);

	const {
		socketId,
		peerId,
		emitSocketEvent,
		onSocketEvent,
		onPeerEvent,
		emitPeerEvent,
		socketOff,
	} = useConnections();

	const toggleMic = () => {
		getMembers();
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

	const getMembers = () => {
		emitSocketEvent('get-members', {
			roomId,
		});
	};

	const RenderMembers = () => {
		return members?.map((member, index) => {
			return member.id == myId ? (
				<div
					key={member._id}
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
					key={member._id}
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

	const playEnter = () => {
		const audio = new Audio(enterRoom);
		audio.play();
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
				{controls.isMicMuted ? (
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
				<div className={styles.hangUp}>
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
