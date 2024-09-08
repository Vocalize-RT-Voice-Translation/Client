import peer from 'peerjs';

export class PeerConnection {
	constructor() {
		this.peer = new peer({
			host: 'localhost',
			port: 3002,
			path: '/peerjs/connections',
		});
	}

	on(event, callback) {
		this.peer.on(event, callback);
	}

	destroy() {
		this.peer.destroy();
	}

	getPeerId() {
		return this.peer.id;
	}

	getPeer() {
		return this.peer;
	}

	call(peerId, stream) {
		const call = this.peer.call(peerId, stream);
		return call;
	}

	acceptCall(stream) {
		this.peer.on('call', (call) => {
			call.answer(stream);
		});
	}
}
