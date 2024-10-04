import React, {
	createContext,
	useContext,
	useEffect,
	useState,
} from 'react';
import io from 'socket.io-client';
import Peer from 'peerjs';
import secrets from '../../secrets.js';

const { SOCKET_URL, PEER_HOST } = secrets;

const ConnectionContext = createContext();

export const useConnections = () => {
	return useContext(ConnectionContext);
};

export const ConnectionProvider = ({
	children,
}) => {
	const [socket, setSocket] = useState(null);
	const [peer, setPeer] = useState(null);

	useEffect(() => {
		const initializeConnections = async () => {
			const newSocket = io(SOCKET_URL);
			setSocket(newSocket);

			await new Promise((resolve) => {
				newSocket.on('connect', resolve);
			});

			const newPeer = new Peer({
				host: PEER_HOST,
				port: 3002,
				path: '/peerjs/connections',
			});
			setPeer(newPeer);

			await new Promise((resolve) => {
				newPeer.on('open', resolve);
			});
		};

		initializeConnections();

		return () => {
			if (socket) socket.close();
			if (peer) peer.destroy();
		};
	}, []);

	if (!socket || !peer) {
		return null;
	}

	return (
		<ConnectionContext.Provider
			value={{ socket, peer }}
		>
			{children}
		</ConnectionContext.Provider>
	);
};
