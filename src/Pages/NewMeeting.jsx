import React, {
	useState,
	useEffect,
	useRef,
} from 'react';
import styles from '../Styles/NewMeeting.module.scss';
import Newmeeting from '../Assets/Newmeeting.jpg';
import { MdOutlineBolt } from 'react-icons/md';
import { CiCircleCheck } from 'react-icons/ci';
import Farzi from 'farzi.js';
import { showToast } from '../Utils/toast.js';
import { useNavigate } from 'react-router-dom';
import enterSound from '../Assets/enter.mp3';
import { useConnections } from './SocketPeerContext.jsx';
import { createUserId } from '../Utils/helper.js';

const NewMeeting = () => {
	const { socket, peer } = useConnections();

	const navigate = useNavigate();
	const [index, setIndex] = useState(0);
	const [code, setCode] = useState('');
	const [joineeName, setJoineeName] = useState('');

	const [words, setWords] = useState([
		'Meeting',
		'Flexibility',
		'Collaboration',
		'Communication',
	]);

	const userId = createUserId();

	useEffect(() => {
		socket.on('fetch-room-data', (data) => {
			if (data.message == 'Room not found') {
				resetInputs();
				setCode('');
				showToast('No Meeting Found!', 'error');
			} else {
				navigate(`/meeting/${data.roomId}`, {
					state: {
						isWaiting: false,
						data: {
							user: {
								name: joineeName,
							},
						},
					},
				});
			}
		});

		socket.on('new-meeting', (data) => {
			console.log(data);
			if (data.status == 'success') {
				// playMp3Sound();
				navigate(`/meeting/${data.roomId}`, {
					state: { isWaiting: false, data: data },
				});
			} else {
				showToast(
					'Error in creating meeting',
					'error'
				);
			}
		});

		return () => {
			socket.off('fetch-room-data');
			socket.off('new-meeting');
		};
	}, [joineeName]);

	const resetInputs = () => {
		document
			.querySelectorAll('#code')
			.forEach((input) => {
				input.value = '';
			});
	};

	const playMp3Sound = () => {
		var audio = new Audio(enterSound);
		audio.play();
	};

	useEffect(() => {
		const interval = setInterval(() => {
			setIndex((prev) =>
				prev === words.length - 1 ? 0 : prev + 1
			);
		}, 2000);
		return () => clearInterval(interval);
	}, [words]);

	const handleCodeChange = (e) => {
		if (e.target.value.length === 1) {
			const nextInput = e.target.nextElementSibling;
			if (nextInput) {
				nextInput.focus();
			}
		}

		setCode((prev) => {
			let newCode = '';
			document
				.querySelectorAll('#code')
				.forEach((input) => {
					newCode += input.value;
				});
			return newCode;
		});
	};

	const handleCodeDelete = (e) => {
		if (
			e.key === 'Backspace' &&
			e.target.value === ''
		) {
			const prevInput =
				e.target.previousElementSibling;
			if (prevInput) {
				prevInput.focus();
			}
		}
	};

	useEffect(() => {
		const inputs =
			document.querySelectorAll('#code');
		inputs.forEach((input) => {
			input.maxLength = 1;
			input.addEventListener(
				'input',
				handleCodeChange
			);
			input.addEventListener(
				'keydown',
				handleCodeDelete
			);
		});

		return () => {
			inputs.forEach((input) => {
				input.removeEventListener(
					'input',
					handleCodeChange
				);
				input.removeEventListener(
					'keydown',
					handleCodeDelete
				);
			});
		};
	}, []);

	const handleCodeSubmit = () => {
		if (joineeName) {
			if (code.length == 4) {
				socket.emit('fetch-room-data', {
					roomId: code,
				});
			} else {
				showToast('Invalid Meeting Code', 'error');
			}
		} else {
			showToast('Please enter your name', 'error');
		}
	};

	const createNewMeeting = () => {
		const user = {
			userId: userId,
			name: joineeName,
			roomId: String(Farzi.number.getNumber(4)),
			socketId: socket.id,
			peerId: peer.id,
			isTalking: false,
			isMuted: true,
			isVideoCamOn: false,
			isHost: true,
		};

		if (joineeName) {
			socket.emit('create-new-meeting', user);
		} else {
			showToast('Please enter your name', 'error');
		}
	};

	return (
		<div className={styles.main}>
			<div className={styles.left}>
				<div className={styles.imageWrapper}>
					<img
						src={Newmeeting}
						alt=''
					/>
				</div>
				<h3>{words[index]}</h3>
				<p>For Everyone</p>
			</div>
			<div className={styles.right}>
				<div className={styles.joinMeetingCard}>
					<h2>JOIN A MEETING</h2>
					<p>Using Meeting Code</p>
					<input
						className={styles.nameInput}
						type='text'
						placeholder='Your Name'
						onChange={(e) =>
							setJoineeName(e.target.value)
						}
					/>
					<div className={styles.codeBoxWrapper}>
						<input
							id='code'
							type='text'
							autoComplete='off'
						/>
						<input
							id='code'
							type='text'
							autoComplete='off'
						/>
						<input
							id='code'
							type='text'
							autoComplete='off'
						/>
						<input
							id='code'
							type='text'
							autoComplete='off'
						/>
					</div>
					<div
						className={styles.joinMeetingButton}
						onClick={handleCodeSubmit}
					>
						<p>JOIN</p>
						<CiCircleCheck />
					</div>
				</div>
				<div className={styles.bisection}>
					<div className={styles.line}></div>
					<p>OR</p>
					<div className={styles.line}></div>
				</div>
				<div
					className={styles.newMeetingCard}
					onClick={createNewMeeting}
				>
					<p>Create Instant Meeting</p>
					<MdOutlineBolt />
				</div>
			</div>
		</div>
	);
};

export default NewMeeting;
