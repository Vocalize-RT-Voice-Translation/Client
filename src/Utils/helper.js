import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';

export const createUserId = () => {
	if (Cookies.get('userId')) {
		return Cookies.get('userId');
	} else {
		const userId = uuidv4();
		Cookies.set('userId', userId);
		return userId;
	}
};
