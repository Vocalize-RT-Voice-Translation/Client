import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './Styles/CustomCursor.module.scss';

const CustomCursor = () => {
	const cursorRef = useRef(null);

	useEffect(() => {
		const onMouseMove = (e) => {
			gsap.to(cursorRef.current, {
				x: e.clientX,
				y: e.clientY,
				duration: 0.5,
				ease: 'power2.out',
			});

			const elementUnderCursor =
				document.elementFromPoint(
					e.clientX,
					e.clientY
				);
			if (
				elementUnderCursor &&
				(elementUnderCursor.tagName === 'P' ||
					elementUnderCursor.tagName === 'SPAN' ||
					elementUnderCursor.tagName === 'A' ||
					elementUnderCursor.tagName === 'H1' ||
					elementUnderCursor.tagName === 'H2' ||
					elementUnderCursor.tagName === 'H3' ||
					elementUnderCursor.tagName === 'H4' ||
					elementUnderCursor.tagName === 'H5' ||
					elementUnderCursor.tagName === 'H6')
			) {
				cursorRef.current.classList.add(
					styles.transparentCursor
				);
			} else {
				cursorRef.current.classList.remove(
					styles.transparentCursor
				);
			}
		};

		const mouseLeave = () => {
			gsap.to(cursorRef.current, {
				scale: 0,
				opacity: 0,
				duration: 0.2,
				ease: 'power2.out',
			});
		};

		const mouseEnter = () => {
			gsap.to(cursorRef.current, {
				scale: 1,
				opacity: 1,
				duration: 0.5,
				ease: 'power2.out',
			});
		};

		document.addEventListener(
			'mouseenter',
			mouseEnter
		);

		document.addEventListener(
			'mousemove',
			onMouseMove
		);

		document.addEventListener(
			'mouseleave',
			mouseLeave
		);

		// return () => {
		// 	document.removeEventListener(
		// 		'mousemove',
		// 		onMouseMove
		// 	);
		// 	document.removeEventListener(
		// 		'mouseleave',
		// 		mouseLeave
		// 	);
		// };
	}, []);

	return (
		<div
			className={styles.cursor}
			ref={cursorRef}
		></div>
	);
};

export default CustomCursor;
