import { io } from 'socket.io-client';
import secrets from '../../secrets.js';
const url = secrets.SOCKET_URL;

const socket = io(url);

export class SocketConnection {
	constructor() {
		this.socket = socket;
	}

	getSocket() {
		return this.socket;
	}

	emit(event, data) {
		this.socket.emit(event, data);
	}

	on(event, callback) {
		this.socket.on(event, callback);
	}

	off(event, callback) {
		this.socket.off(event, callback);
	}

	close() {
		this.socket.close();
	}

	connect() {
		this.socket.connect();
	}

	disconnect() {
		this.socket.disconnect();
	}

	getId() {
		return this.socket.id;
	}

	getConnected() {
		return this.socket.connected;
	}

	getDisconnected() {
		return this.socket.disconnected;
	}
}
