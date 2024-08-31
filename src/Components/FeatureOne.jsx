import React from 'react';
import translate from '../Assets/translate.png';
import styles from './Styles/Feature1.module.scss';

const FeatureOne = () => {
	return (
		<div className={styles.main}>
			<div className={styles.left}>
				<div className={styles.imageWrapper}>
					<img
						src={translate}
						alt=''
					/>
				</div>
			</div>
			<div className={styles.right}>
				<h2>2 Widely Speaking Languages Supported</h2>
				<p>
					Vocalize supports 2 languages in India, Hindi
					and English. You can switch between these
					languages in the Settings section or directly
					in a call. <br />
					<span>
						We are working on adding more regional
						languages (INDIA)
					</span>
				</p>
				<div className={styles.languageCardWrapper}>
					<div className={styles.card}>
						<p>Hindi</p>
					</div>
					<div className={styles.card}>
						<p>English</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default FeatureOne;
