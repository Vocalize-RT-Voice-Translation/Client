import React, {
	createContext,
	useContext,
} from 'react';
import useConnections from '../Components/useConnections.jsx'; // Adjust the import path as needed

const SocketContext = createContext();

export const useSocket = () => {
	return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
	const { ...data } = useConnections();

	return (
		<SocketContext.Provider value={data}>
			{children}
		</SocketContext.Provider>
	);
};
