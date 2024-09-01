import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Styles/Navbar.module.scss';
import logo from '../Assets/vocalize-white.png';

const Navbar = () => {
	return (
		<div className={styles.parentWrapper}>
			<div className={styles.logo}>
				<img
					src={logo}
					alt=''
				/>
			</div>
			<div className={styles.main}>
				<Link to='/'>Home</Link>
				<Link to='/meeting'>New Meeting</Link>
				<Link to='/about'>About</Link>
				<Link to='/technology'>Technology</Link>
				<Link to='/developers'>Devs</Link>
			</div>
		</div>
	);
};

export default Navbar;
