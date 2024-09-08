import { useEffect, useRef } from 'react';
import { useRecoilState } from 'recoil';
import {
	peerId,
	socketId,
} from '../Utils/GlobalStates.js';
import { PeerConnection } from '../Utils/PeerConnection.js';
import { SocketConnection } from '../Utils/SocketConnection.js';

const useConnections = () => {
	const peerRef = useRef(null);
	const socketRef = useRef(null);

	const [peerIdState, setPeerId] =
		useRecoilState(peerId);
	const [socketIdState, setSocketId] =
		useRecoilState(socketId);

	useEffect(() => {
		if (!socketRef.current) {
			const socket = new SocketConnection();
			socketRef.current = socket;

			socket.on('connect', () => {
				const id = socket.getId();
				setSocketId(id);
			});
		}

		if (!peerRef.current) {
			const peer = new PeerConnection();
			peerRef.current = peer;

			peer.on('open', (id) => {
				setPeerId(id);
			});
		}

		return () => {
			if (socketRef.current) {
				socketRef.current.disconnect();
			}
			if (peerRef.current) {
				peerRef.current.destroy();
			}
		};
	}, [setPeerId, setSocketId]);

	const emitSocketEvent = (event, data) => {
		if (socketRef.current) {
			socketRef.current.emit(event, data);
		}
	};

	const onSocketEvent = (event, callback) => {
		if (socketRef.current) {
			socketRef.current.on(event, callback);
		}
	};

	const emitPeerEvent = (event, data) => {
		if (peerRef.current) {
			peerRef.current.emit(event, data);
		}
	};

	const onPeerEvent = (event, callback) => {
		if (peerRef.current) {
			peerRef.current.on(event, callback);
		}
	};

	const makePeerCall = (peerId, stream) => {
		if (peerRef.current) {
			peerRef.current.call(peerId, stream);
		}
	};

	const socketOff = (event) => {
		if (socketRef.current) {
			socketRef.current.off(event);
		}
	};

	return {
		peerId: peerIdState,
		socketId: socketIdState,
		emitSocketEvent,
		onSocketEvent,
		emitPeerEvent,
		onPeerEvent,
		makePeerCall,
		socketOff,
	};
};

export default useConnections;
