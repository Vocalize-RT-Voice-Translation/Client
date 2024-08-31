import React, { useEffect } from 'react';
import styles from '../Styles/Home.module.scss';
import Navbar from '../Components/Navbar.jsx';
import hero from '../Assets/hero-img.svg';
import FeatureOne from '../Components/FeatureOne.jsx';
import LocomotiveScroll from 'locomotive-scroll';
import Meet from '../Components/Meet.jsx';
import Animation from '../Components/Animation.jsx';

const Home = () => {
	useEffect(() => {
		const locomotiveScroll = new LocomotiveScroll({
			smooth: true,
			smoothMobile: true,
			getDirection: true,
			getSpeed: true,
			easing: [0.25, 0.0, 0.35, 1.0],
		});

		return () => {
			if (locomotiveScroll)
				locomotiveScroll.destroy();
		};
	}, []);

	const disableImageDrag = (e) => {
		e.preventDefault();
	};

	useEffect(() => {
		const images = document.querySelectorAll('img');
		images.forEach((image) => {
			image.addEventListener(
				'dragstart',
				disableImageDrag
			);
		});

		return () => {
			images.forEach((image) => {
				image.removeEventListener(
					'dragstart',
					disableImageDrag
				);
			});
		};
	}, []);

	return (
		<>
			<div className={styles.main}>
				<Navbar />
				<div className={styles.hero}>
					<div className={styles.left}>
						<h2>
							Meet without worrying about language
						</h2>
						<p>
							Use Vocalize to get a new experience in
							doing video meet, don't care about
							language, you can set it in Settings
							section.
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
			<FeatureOne />
			<Meet />
			<Animation />
		</>
	);
};

export default Home;
