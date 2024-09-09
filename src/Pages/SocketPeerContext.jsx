import React, {
	createContext,
	useContext,
	useEffect,
	useState,
} from 'react';
import io from 'socket.io-client';
import Peer from 'peerjs';
import secrets from '../../secrets.js';

const { SOCKET_URL } = secrets;

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
			// Initialize socket connection
			const newSocket = io(SOCKET_URL);
			setSocket(newSocket);

			// Wait for socket connection to be ready
			await new Promise((resolve) => {
				newSocket.on('connect', resolve);
			});

			// Initialize PeerJS connection
			const newPeer = new Peer({
				host: 'localhost',
				port: 3002,
				path: '/peerjs/connections',
			});
			setPeer(newPeer);

			// Wait for PeerJS connection to open
			await new Promise((resolve) => {
				newPeer.on('open', resolve);
			});
		};

		initializeConnections();

		// Cleanup function to close connections on unmount
		return () => {
			if (socket) socket.close();
			if (peer) peer.destroy();
		};
	}, []); // Empty dependency array to ensure useEffect runs only once

	// Only render children if both socket and peer are initialized
	if (!socket || !peer) {
		return null; // Don't render anything until both are ready
	}

	return (
		<ConnectionContext.Provider
			value={{ socket, peer }}
		>
			{children}
		</ConnectionContext.Provider>
	);
};
