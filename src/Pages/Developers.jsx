import React, { useState } from 'react';
import styles from '../Styles/Developer.module.scss';
import { RiHomeSmileLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

const Developers = () => {
	const navigate = useNavigate();
	const [members, setMembers] = useState([
		{
			name: 'Aditya Singh',
			role: 'Full Stack Developer',
			img: 'https://via.placeholder.com/150',
		},
		{
			name: 'Ankit Pal',
			role: 'Python Expert',
			img: 'https://via.placeholder.com/150',
		},
		{
			name: 'Sonam Yadav',
			role: 'AI/ML Expert',
			img: 'https://via.placeholder.com/150',
		},
		{
			name: 'Greeshma Shetty',
			role: 'Python + Documentation',
			img: 'https://via.placeholder.com/150',
		},
	]);
	return (
		<div className={styles.main}>
			<div
				className={styles.backtoHome}
				onClick={() => {
					navigate('/');
				}}
			>
				<p>Back to Home</p>
				<RiHomeSmileLine />
			</div>
			<h1>OUR</h1>
			<h2>
				<span>CREATIVE</span> TEAM
			</h2>
			<p>
				Lorem ipsum dolor sit amet consectetur
				adipisicing elit. Reprehenderit placeat
				adipisci repellendus nihil impedit, quam
				repudiandae possimus pariatur ea autem at vero
				exercitationem expedita temporibus illum sequi
				dolorem. Debitis, excepturi.
			</p>
			<div className={styles.memberWrapper}>
				{members.map((member, index) => (
					<div
						className={styles.member}
						key={index}
					>
						<h3>{member.name}</h3>
						<p>{member.role}</p>
						<div className={styles.image}>
							<img
								src={member.img}
								alt={member.name}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default Developers;
