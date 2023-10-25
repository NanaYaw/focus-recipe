import { Controller } from '@hotwired/stimulus';
import cash from 'cash-dom';

export default class extends Controller {
	static targets = ['modal'];

	open(event) {
		const modal = cash(`#modal`);
		// if (!this.modal.isOpened) {
		// 	this.modal.show();
		// }
		console.log('Modal');

		const closeSpinner = new CustomEvent('close-spinner');
		window.dispatchEvent(closeSpinner);

		modal.show();
	}

	close(event) {
		const closeSpinner = new CustomEvent('close-spinner');
		window.dispatchEvent(closeSpinner);

		// console.log(event);
		const modal = cash(`#modal`);
		if (event.detail.success) {
			modal.hide();
		}
	}
}
