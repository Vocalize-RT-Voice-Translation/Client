import React, { useState } from 'react';
import {
	useSpeechRecognition,
	isSpeechRecognitionSupported,
} from 'react-voice-to-text';

const Test = () => {
	const [transcript, setTranscript] = useState('');
	const [history, setHistory] = useState([]);

	if (!isSpeechRecognitionSupported()) {
		return (
			<div>
				Sorry, your browser does not support speech
				recognition.
			</div>
		);
	}

	const { startRecording, stopRecording } =
		useSpeechRecognition({
			onStart: () =>
				console.log('Started recording'),
			onEnd: (lastText, transcriptHistory) => {
				setTranscript(lastText);
				setHistory(transcriptHistory);
			},
			onStop: () => console.log('Stopped recording'),
			onError: (error) => console.error(error),
			lang: 'en-US',
			interimResults: true,
			maxAlternatives: 1,
		});

	return (
		<div>
			<button onClick={startRecording}>
				Start Recording
			</button>
			<button onClick={stopRecording}>
				Stop Recording
			</button>
			<div>
				<h3>Transcript</h3>
				<p>{transcript}</p>
			</div>
			<div>
				<h3>History</h3>
				<ul>
					{history.map((text, index) => (
						<li key={index}>{text}</li>
					))}
				</ul>
			</div>
		</div>
	);
};

export default Test;
