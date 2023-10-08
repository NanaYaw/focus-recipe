import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
	static targets = ['loading', 'link'];

	display(event) {
		this.loadingTarget.classList.remove('hidden');
		// this.contentTarget.classList.add('hidden');

		// let value = event.detail.url;

		// console.log('navgi', value);

		// this.updateLinks(value);
	}
	displayLoading() {
		this.loadingTarget.classList.remove('hidden');
	}
	removeLoading() {
		this.loadingTarget.classList.add('hidden');
	}

	displayContent() {
		this.loadingTarget.classList.add('hidden');
		this.contentTarget.classList.remove('hidden');
	}

	updateLinks(item) {
		this.linkTargets.forEach((link) => {
			link.classList.remove('selected');
			if (link.href === item) {
				link.classList.add('selected');
			}
		});
	}
}
