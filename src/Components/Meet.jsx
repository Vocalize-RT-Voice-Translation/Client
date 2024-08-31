import React from 'react';
import styles from './Styles/Meet.module.scss';
import meet from '../Assets/meet.png';
import { BsTranslate } from 'react-icons/bs';

const Meet = () => {
	return (
		<div className={styles.main}>
			<div className={styles.left}>
				<h2>Your another regular Meet</h2>
				<p>
					Vocalize is a video meeting platform, where
					you can meet with your friends, family or
					colleagues but with a newer experience.
				</p>
				<div className={styles.button}>
					<p>AI VOICE TRANSLATION</p>
					<BsTranslate />
				</div>
			</div>
			<div className={styles.right}>
				<div className={styles.imageWrapper}>
					<img
						src={meet}
						alt=''
					/>
				</div>
			</div>
		</div>
	);
};

export default Meet;
