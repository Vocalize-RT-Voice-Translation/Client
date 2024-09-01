import React, {
	useState,
	useEffect,
} from 'react';
import styles from '../Styles/NewMeeting.module.scss';
import Newmeeting from '../Assets/Newmeeting.jpg';
import { MdOutlineBolt } from 'react-icons/md';

const NewMeeting = () => {
	const [words, setWords] = useState([
		'Meeting',
		'Flexibility',
		'Collaboration',
		'Communication',
	]);

	const [index, setIndex] = useState(0);
	const [code, setCode] = useState('');

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
				.querySelectorAll('input')
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
			document.querySelectorAll('input');
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
					<div className={styles.codeBoxWrapper}>
						<input type='text' />
						<input type='text' />
						<input type='text' />
						<input type='text' />
					</div>
				</div>
				<div className={styles.bisection}>
					<div className={styles.line}></div>
					<p>OR</p>
					<div className={styles.line}></div>
				</div>
				<div className={styles.newMeetingCard}>
					<p>Create Instant Meeting</p>
					<MdOutlineBolt />
				</div>
			</div>
		</div>
	);
};

export default NewMeeting;
