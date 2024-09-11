import React, {
	useEffect,
	useState,
} from 'react';
import styles from '../Styles/Technology.module.scss';
import LocomotiveScroll from 'locomotive-scroll';
import node from '../Assets/Technology/node.svg';
import express from '../Assets/Technology/express.svg';
import mongodb from '../Assets/Technology/mongo.svg';
import react from '../Assets/Technology/react.svg';
import socket from '../Assets/Technology/socket.png';
import peer from '../Assets/Technology/peerjs.png';
import transformer from '../Assets/Technology/transformer.png';
import neuralNetwork from '../Assets/Technology/nn.png';
import { FaArrowRightLong } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';

const Technology = () => {
	const navigate = useNavigate();
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

	const [technology] = useState([
		{
			title: 'Front-End Framework/Library',
			items: [
				{
					title: 'React',
					image: react,
				},
			],
			description: `React, a popular JavaScript library, forms the foundation of Vocalize's user interface. Its component-based architecture ensures a dynamic, responsive, and user-friendly experience for participants in video meetings.`,
		},
		{
			title: 'Back-End Server',
			items: [
				{
					title: 'Node.js',
					image: node,
				},
				{
					title: 'Express.js',
					image: express,
				},
			],
			description: `Node.js and Express.js, two powerful JavaScript frameworks, are used to create Vocalize's back-end server. These technologies facilitate the handling of real-time translation requests and the management of user data.`,
		},
		{
			title: 'Database',
			items: [
				{
					title: 'MongoDB',
					image: mongodb,
				},
			],
			description: `MongoDB, a NoSQL database, is utilized to store user information and meeting data. This document-oriented database provides a flexible and scalable solution for managing large volumes of data.`,
		},
		{
			title:
				'Speech Recognition & Machine Translation',
			items: [
				{
					title: 'Transformer-based Models',
					image: transformer,
				},
				{
					title: 'Neural Networks',
					image: neuralNetwork,
				},
			],
			description: `Transformer-based models and neural networks are employed to perform speech recognition and machine translation in Vocalize. These advanced technologies enable the application to accurately transcribe and translate spoken language in real-time.`,
		},
		{
			title: 'Real-time Communication',
			items: [
				{
					title: 'Socket.io',
					image: socket,
				},
				{
					title: 'PeerJs',
					image: peer,
				},
			],
			description: `Socket.io and PeerJs are used to establish real-time communication between participants in video meetings. These libraries enable Vocalize to deliver seamless audio and video streaming, as well as instant translation services.`,
		},
	]);

	return (
		<div className={styles.main}>
			<div className={styles.titleWrapper}>
				<div className={styles.titleContent}>
					<h2>TECHNOLOGY</h2>
					<p>
						Technology involved in making Vocalize
						Possible!
					</p>
					<p>
						Vocalize is a cutting-edge application
						designed to revolutionize communication in
						video meetings by providing real-time
						translation services. This innovative
						project, undertaken as a major final year
						project by a team of four, aims to bridge
						language barriers and facilitate effective
						global collaboration.
					</p>
				</div>
				<div
					className={styles.homeButton}
					onClick={() => {
						navigate('/home');
					}}
				>
					<p>Back To Home</p>
					<FaArrowRightLong />
				</div>
			</div>

			<div className={styles.itemsWrapper}>
				{technology.map((item, index) => {
					return (
						<div
							key={index}
							className={styles.itemCard}
						>
							<div className={styles.titleDescription}>
								<h3>{item.title}</h3>
								<p>{item.description}</p>
							</div>
							<div className={styles.imageWrapper}>
								{item.items.map((item, index) => {
									return (
										<div
											className={styles.image}
											key={index}
										>
											<div className={styles.overlayImage}>
												<p>{item.title}</p>
											</div>
											<img
												key={index}
												src={item.image}
												alt=''
											/>
										</div>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default Technology;
