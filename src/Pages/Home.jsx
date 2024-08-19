import React, { useEffect } from 'react';
import styles from '../Styles/Home.module.scss';
import Navbar from '../Components/Navbar.jsx';
import { BsSoundwave } from 'react-icons/bs';
import hero from '../Assets/hero-img.svg';

const Home = () => {
	return (
		<div className={styles.main}>
			<Navbar />
			<div className={styles.hero}>
				<div className={styles.left}>
					<h2>Meet without worrying about language</h2>
					<p>
						Use Vocalize to get a new experience in
						doing video meet, don't care about language,
						you can set it in Settings section.
					</p>
					<div className={styles.buttonWrapper}>
						<div className={styles.button}>
							Try Vocalize
						</div>
						<p>Watch the Demo</p>
					</div>
				</div>
				<div className={styles.right}>
					<img
						src={hero}
						alt=''
					/>
				</div>
			</div>
		</div>
	);
};

export default Home;
