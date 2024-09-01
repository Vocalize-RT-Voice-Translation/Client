import React, {
	useEffect,
	useRef,
	useState,
} from 'react';
import Peer from 'peerjs';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

function App() {
	const [translatedText, setTranslatedText] =
		useState('');
	const peerInstance = useRef(null);
	const audioContextRef = useRef(null);
	const mediaRecorderRef = useRef(null);

	useEffect(() => {
		const peer = new Peer(undefined, {
			host: 'localhost',
			port: 9000,
			path: '/peerjs',
		});

		peer.on('open', (id) => {
			console.log('Peer ID:', id);
		});

		peerInstance.current = peer;

		return () => {
			peer.destroy();
		};
	}, []);

	const startCall = (remotePeerId) => {
		if (!remotePeerId) {
			console.error('No remote peer ID available');
			return;
		}

		navigator.mediaDevices
			.getUserMedia({ audio: true })
			.then((stream) => {
				const call = peerInstance.current.call(
					remotePeerId,
					stream
				);

				call.on('stream', (remoteStream) => {
					setupAudioStream(remoteStream);
				});

				call.on('error', (err) => {
					console.error('Call error:', err);
				});

				// Capture and send local audio stream
				setupAudioStream(stream);
			})
			.catch((error) => {
				console.error(
					'Error accessing media devices.',
					error
				);
			});
	};

	const setupAudioStream = (stream) => {
		audioContextRef.current =
			new (window.AudioContext ||
				window.webkitAudioContext)();
		const source =
			audioContextRef.current.createMediaStreamSource(
				stream
			);

		mediaRecorderRef.current = new MediaRecorder(
			stream
		);
		mediaRecorderRef.current.ondataavailable = (
			event
		) => {
			if (event.data.size > 0) {
				const reader = new FileReader();
				reader.readAsArrayBuffer(event.data);
				reader.onloadend = () => {
					socket.emit('audioData', reader.result);
				};
			}
		};

		mediaRecorderRef.current.start(1000); // Sends data every 1 second
	};

	socket.on('translatedText', (text) => {
		setTranslatedText(text);
	});

	return (
		<div>
			<h1>Real-Time Translation</h1>
			<input
				type='text'
				placeholder='Remote Peer ID'
				onKeyDown={(e) => {
					if (e.key === 'Enter')
						startCall(e.target.value);
				}}
			/>
			<p>Translated Text: {translatedText}</p>
		</div>
	);
}

export default App;
