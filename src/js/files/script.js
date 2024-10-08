// Підключення функціоналу "Чертоги Фрілансера"
import { isMobile } from './functions.js';
// Підключення списку активних модулів
import { flsModules } from './modules.js';

const masonryActiveClassName = 'masonryActive';

class Masonry {
	constructor(attr, options) {
		this.container = attr;
		this.children = this.container.querySelectorAll('[data-iso-item]');
		this.childrenData = Array.from(this.children).map((child) => ({
			child,
			origHight: Number(child.dataset.height),
			origWidth: Number(child.dataset.width),
		}));

		this.setSettings(options);

		this.setParameters();

		window.addEventListener('resize', () => {
			this.childrenData = Array.from(this.children).map((child) => ({
				child,
				origHight: Number(child.dataset.height),
				origWidth: Number(child.dataset.width),
			}));

			this.setSettings(options);

			this.setParameters();
		});
	}

	setSettings(options) {
		const windowWidth = document.documentElement.clientWidth;

		let gap = options.gap;
		let columns = options.columns;

		if (options.breakpoints) {
			let currentKey;
			for (const key in options.breakpoints) {
				if (Number(key) < windowWidth) currentKey = key;
			}

			if (currentKey) {
				gap = options.breakpoints[currentKey]?.gap || gap;
				columns = options.breakpoints[currentKey]?.columns || columns;
			}
		}

		this.settings = {
			gap: gap || 0,
			columns: columns || 3,
		};
	}

	setParameters() {
		const containerWidth = this.container.offsetWidth;

		const widthImage = (containerWidth - this.settings.gap * (this.settings.columns - 1)) / this.settings.columns;

		this.childrenData = this.childrenData.map((child) => ({
			...child,
			currentWidth: widthImage,
			currentHeight: Math.floor((widthImage * child.origHight) / child.origWidth),
		}));

		const heightColumns = new Array(this.settings.columns).fill(0);
		const sizeColumns = new Array(this.settings.columns).fill(0);
		this.childrenData.forEach((child, i) => {
			heightColumns[i % this.settings.columns] += child.currentHeight + this.settings.gap;

			sizeColumns[i % this.settings.columns] += 1;
		});

		const minHeightColumn = heightColumns.reduce((acc, size) => (size < acc ? size : acc));

		const diffImages = heightColumns.map((heightColumn, i) => (heightColumn - minHeightColumn) / sizeColumns[i]);

		this.container.style.height = `${minHeightColumn - this.settings.gap}px`;

		const topSets = new Array(this.settings.columns).fill(0);

		this.childrenData = this.childrenData.map((child, i) => {
			const indexColumn = i % this.settings.columns;
			const left = indexColumn * widthImage + this.settings.gap * indexColumn;
			const currentHeight = child.currentHeight - diffImages[indexColumn];
			const top = topSets[indexColumn];
			topSets[indexColumn] += currentHeight + this.settings.gap;

			return {
				...child,
				currentHeight,
				left,
				top,
			};
		});

		this.childrenData.forEach((child) => {
			child.child.style.top = `${child.top}px`;
			child.child.style.left = `${child.left}px`;
			child.child.style.width = `${child.currentWidth}px`;
			child.child.style.height = `${child.currentHeight}px`;
		});

		this.container.classList.add(masonryActiveClassName);
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const containers = document.querySelectorAll('[data-iso-items]');

	if (containers) {
		containers.forEach((container) => {
			new Masonry(container, {
				columns: 3,
				gap: 20,
				breakpoints: {
					0: {
						columns: 2,
						gap: 10,
					},
					768: {
						columns: 3,
						gap: 20,
					},
				},
			});
		});
	}
});
