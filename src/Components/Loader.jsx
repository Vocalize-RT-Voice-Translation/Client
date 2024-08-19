import React from 'react';
import styles from './Styles/Loader.module.scss';

const Loader = () => {
	return (
		<div className={styles.main}>
			<div className>
				<div
					className={`${styles.box} ${styles.box1}`}
				></div>
				<div
					className={`${styles.box} ${styles.box2}`}
				></div>
				<div
					className={`${styles.box} ${styles.box3}`}
				></div>
				<div
					className={`${styles.box} ${styles.box4}`}
				></div>
				<div
					className={`${styles.box} ${styles.box5}`}
				></div>
			</div>
		</div>
	);
};

export default Loader;
