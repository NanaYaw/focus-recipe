import { Controller } from '@hotwired/stimulus';

// Connects to data-controller="flash"
export default class extends Controller {
	connect() {
		this.element.style.animation = 'fade-in-and-out 4s';
		setTimeout(() => {
			console.log('flash fired');
			this.element.remove();
		}, 4000);
	}
}
