import React from 'react';
import styles from '../Styles/Loader.module.scss';

const Loader = ({ message = 'Loading' }) => {
	return (
		<div className={styles.main}>
			<div className={styles.loader}></div>
			<p>{message}</p>
		</div>
	);
};

export default Loader;
