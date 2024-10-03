import React, {
	useEffect,
	useState,
	useRef,
} from 'react';
import {
	useParams,
	useLocation,
} from 'react-router-dom';
import secrets from '../../secrets.js';
import styles from '../Styles/Meeting.module.scss';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { v4 as uuidv4 } from 'uuid';
import { BsTranslate } from 'react-icons/bs';
import { BiCaptions } from 'react-icons/bi';

const Meeting = () => {
	const { APP_ID, APP_SECRET } = secrets;
	const { id } = useParams();
	const location = useLocation();

	const name =
		location.state?.data?.user?.name ??
		'Guest User';

	// Meeting function to initialize Zegocloud and capture audio
	const Meeting = async (element) => {
		const appId = Number(APP_ID);
		const server = APP_SECRET.toString();
		const kitToken =
			ZegoUIKitPrebuilt.generateKitTokenForTest(
				appId,
				server,
				id,
				uuidv4(),
				name
			);
		const zc = ZegoUIKitPrebuilt.create(kitToken);

		zc.joinRoom({
			container: element,
			scenario: {
				mode: ZegoUIKitPrebuilt.OneONoneCall,
			},
		});
	};

	return (
		<div className={styles.main}>
			<div ref={Meeting} />
			<div className={styles.transcription}>
				<h2>Live Transcription</h2>
			</div>
			<div className={styles.settingsOverlay}>
				<div className={styles.button}>
					<BsTranslate />
				</div>
				<div className={styles.button}>
					<BiCaptions />
				</div>
			</div>
		</div>
	);
};

export default Meeting;
