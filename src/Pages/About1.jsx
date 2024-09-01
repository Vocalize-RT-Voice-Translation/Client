import React from 'react';
import styles from '../Styles/About.module.css';

const teamMembers = [
	{
		name: 'Aditya singh',
		role: 'Lead Developer',
		description:
			'aditya is an expert in full-stack development with over 10 years of experience in creating scalable web applications.',
		imageUrl: 'path/to/member1.jpg',
	},
	{
		name: 'sonam yadav',
		role: 'managing director',
		description:
			'sonam oversees project execution and ensures that all deliverables meet client expectations and deadlines.',
		imageUrl: 'path/to/member2.jpg',
	},
	{
		name: 'ankit pal',
		role: 'frontend developer',
		description:
			'ankit oversees project execution and ensures that all deliverables meet client expectations and deadlines.',
		imageUrl: 'path/to/member2.jpg',
	},
	{
		name: 'greeshma shetty',
		role: 'Project Manager',
		description:
			'greeshma oversees project execution and ensures that all deliverables meet client expectations and deadlines.',
		imageUrl: 'path/to/member2.jpg',
	},
];

const About = () => {
	return (
		<div className={styles.main}>
			<header className={styles.aboutHeader}>
				<h1>About Our Team</h1>
			</header>

			<main className={styles.aboutMain}>
				<section className={styles.descriptionBox}>
					<h2>Who We Are</h2>
					<p>
						Our team consists of highly skilled
						professionals passionate about delivering
						excellence. With a diverse range of
						expertise and backgrounds, we collaborate to
						tackle challenges from multiple perspectives
						and drive innovation.
					</p>
				</section>

				<section className={styles.teamSection}>
					{teamMembers.map((member, index) => (
						<div
							className={styles.teamMember}
							key={index}
						>
							<img
								src={member.imageUrl}
								alt={`Portrait of ${member.name}`}
							/>
							<div className={styles.memberInfo}>
								<h3>{member.name}</h3>
								<h4>{member.role}</h4>
								<p>{member.description}</p>
							</div>
						</div>
					))}
				</section>
			</main>
		</div>
	);
};

export default About;
