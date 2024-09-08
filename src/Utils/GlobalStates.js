import { atom } from 'recoil';

export const peerId = atom({
	key: 'peerid',
	default: '',
});

export const socketId = atom({
	key: 'socketid',
	default: '',
});
