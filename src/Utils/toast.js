import toast from 'react-hot-toast';

export const showToast = (message, type) => {
	if (type === 'error') {
		toast.error(message, {
			duration: 3000,
			position: 'bottom-right',
			style: {
				backgroundColor: '#333',
				color: '#fff',
			},
		});
	} else if (type === 'success') {
		toast.success(message, {
			duration: 3000,
			position: 'bottom-right',
			style: {
				backgroundColor: '#333',
				color: '#fff',
			},
		});
	} else if (type === 'loading') {
		toast.loading(message, {
			duration: 3000,
			position: 'bottom-right',
			style: {
				backgroundColor: '#333',
				color: '#fff',
			},
		});
	} else if (type === 'blank') {
		toast(message, {
			duration: 3000,
			position: 'bottom-right',
			style: {
				backgroundColor: '#333',
				color: '#fff',
			},
		});
	} else {
		toast(message, {
			duration: 3000,
			position: 'bottom-right',
			style: {
				backgroundColor: '#333',
				color: '#fff',
			},
		});
	}
};
