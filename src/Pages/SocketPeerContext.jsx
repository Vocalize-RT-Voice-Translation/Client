import React, {
	createContext,
	useContext,
	useEffect,
	useState,
} from 'react';
import io from 'socket.io-client';
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

	useEffect(() => {
		const initializeConnections = async () => {
			const newSocket = io(SOCKET_URL);
			setSocket(newSocket);

			await new Promise((resolve) => {
				newSocket.on('connect', resolve);
			});
		};

		initializeConnections();

		return () => {
			if (socket) socket.close();
		};
	}, []);

	if (!socket) {
		return null;
	}

	return (
		<ConnectionContext.Provider value={{ socket }}>
			{children}
		</ConnectionContext.Provider>
	);
};
