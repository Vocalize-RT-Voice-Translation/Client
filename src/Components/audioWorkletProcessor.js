// audioWorkletProcessor.js
class VoiceProcessor extends AudioWorkletProcessor {
	constructor() {
		super();
		this.threshold = 10;
	}

	process(inputs) {
		const input = inputs[0];
		if (input && input.length > 0) {
			const channelData = input[0];
			const sum = channelData.reduce(
				(a, b) => a + Math.abs(b),
				0
			);
			const average = sum / channelData.length;

			if (average > this.threshold) {
				this.port.postMessage({ isTalking: true });
			} else {
				this.port.postMessage({ isTalking: false });
			}
		}
		return true; // Keep the processor alive
	}
}

registerProcessor(
	'voice-processor',
	VoiceProcessor
);
