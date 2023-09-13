import { Controller } from '@hotwired/stimulus';
import cash from 'cash-dom';

export default class extends Controller {
	static targets = ['modal'];
	connect() {
		console.log('Modal Connected');
		// this.modal = new bootstrap.Modal(this.element);
	}

	open(event) {
		console.log(event);
		const modal = cash(`#modal`);
		// if (!this.modal.isOpened) {
		// 	this.modal.show();
		// }
		modal.show();
		console.log('Modal Opened');
	}

	close(event) {
		console.log(event);
		const modal = cash(`#modal`);
		if (event.detail.success) {
			modal.hide();
		}
	}
}
