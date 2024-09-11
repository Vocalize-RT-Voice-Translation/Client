import React from 'react';
import styles from './Styles/Animation.module.scss';
import english from '../Assets/hello.png';
import hindi from '../Assets/namaste.jpg';
import vocalize from '../Assets/vocalize-white.png';
import logoBlack from '../Assets/vocalize-black.png';
import { IoIosArrowDropright } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';

const Animation = () => {
	const navigate = useNavigate();
	return (
		<div className={styles.main}>
			<div className={styles.heading}>
				<h2>WAITING FOR WHAT!</h2>
				<p>Try Vocalize Now</p>
			</div>
			<div className={styles.animation}>
				<div className={styles.linearWrapper}>
					<div className={styles.linear}></div>
					<div className={styles.linear}></div>
					<div className={styles.linear}></div>
				</div>
				<div className={styles.language}>
					<img
						src={hindi}
						alt=''
					/>
				</div>
				<div className={styles.linearWrapper}>
					<div className={styles.linear}></div>
				</div>
				<div className={styles.vocalize}>
					<img
						src={vocalize}
						alt=''
					/>
				</div>
				<div className={styles.linearWrapper}>
					<div className={styles.linear}></div>
				</div>
				<div className={styles.language}>
					<img
						src={english}
						alt=''
					/>
				</div>
				<div className={styles.linearWrapper}>
					<div className={styles.linear}></div>
					<div className={styles.linear}></div>
					<div className={styles.linear}></div>
				</div>
			</div>
			<div className={styles.newMeetingButton}>
				<img
					src={logoBlack}
					alt=''
				/>
				<div
					className={styles.button}
					onClick={() => {
						navigate('/meeting');
					}}
				>
					<p>Try Vocalize Now</p>
					<IoIosArrowDropright />
				</div>
			</div>
		</div>
	);
};

export default Animation;
