import { useState, useEffect } from 'react';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

import secrets from '../../secrets.js';

const { APP_ID, APP_SECRET } = secrets;
const subscriptionKey = APP_SECRET;
const region = 'centralindia';

const useTranscription = (audioStream) => {
	const [transcript, setTranscript] = useState('');
	const [isListening, setIsListening] =
		useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!subscriptionKey || !region) {
			setError(
				'Missing required audio stream, subscription key, or region.'
			);
			return;
		}

		// Initialize Azure Speech SDK
		const audioConfig =
			sdk.AudioConfig.fromDefaultMicrophoneInput();
		const speechConfig =
			sdk.SpeechConfig.fromSubscription(
				subscriptionKey,
				region
			);
		speechConfig.speechRecognitionLanguage =
			'en-US'; // Modify as needed

		let recognizer;
		let audioContext;

		if (audioStream && isListening) {
			audioContext = new (window.AudioContext ||
				window.webkitAudioContext)();
			const mediaStreamSource =
				audioContext.createMediaStreamSource(
					audioStream
				);

			// Custom audio configuration from stream
			const pushStream =
				sdk.AudioInputStream.createPushStream();
			const audioConfig =
				sdk.AudioConfig.fromStreamInput(pushStream);

			recognizer = new sdk.SpeechRecognizer(
				speechConfig,
				audioConfig
			);

			// Listen to transcription results
			recognizer.recognizing = (sender, event) => {
				const interimResult = event.result.text;
				setTranscript(interimResult); // For interim results
			};

			recognizer.recognized = (sender, event) => {
				const finalResult = event.result.text;
				if (
					event.result.reason ===
					sdk.ResultReason.RecognizedSpeech
				) {
					setTranscript(
						(prevTranscript) =>
							prevTranscript + ' ' + finalResult
					);
				} else if (
					event.result.reason ===
					sdk.ResultReason.NoMatch
				) {
					setError('No speech could be recognized.');
				}
			};

			recognizer.startContinuousRecognitionAsync(
				() => console.log('Recognition started'),
				(err) => {
					setError(err);
					recognizer.close();
				}
			);

			// Feed audio data to Azure
			const audioInputStream =
				sdk.AudioInputStream.createPushStream();
			const audioConfigFromStream =
				sdk.AudioConfig.fromStreamInput(
					audioInputStream
				);
			mediaStreamSource.connect(
				audioContext.destination
			);

			const onAudioProcess = (audioEvent) => {
				const audioBuffer = audioEvent.inputBuffer;
				const audioData =
					audioBuffer.getChannelData(0); // Get channel data
				const byteArray = new Float32Array(audioData); // Convert to byteArray
				audioInputStream.write(byteArray);
			};

			mediaStreamSource.onaudioprocess =
				onAudioProcess;
		}

		return () => {
			if (recognizer) {
				recognizer.stopContinuousRecognitionAsync();
				recognizer.close();
			}
			if (audioContext) {
				audioContext.close();
			}
		};
	}, [
		audioStream,
		isListening,
		subscriptionKey,
		region,
	]);

	const toggleListening = () => {
		setIsListening((prev) => !prev);
	};

	return {
		transcript,
		isListening,
		toggleListening,
		error,
	};
};

export default useTranscription;
