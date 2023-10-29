import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
	static targets = ['modal'];

	open() {
		console.log('turbo modal targeting frame load');
		const closeSpinner = new CustomEvent('close-spinner');
		window.dispatchEvent(closeSpinner);
	}

	// hide modal
	// action: "turbo-modal#hideModal"
	hideModal() {
		console.log('modal closed');
		const closeSpinner = new CustomEvent('close-spinner');
		window.dispatchEvent(closeSpinner);

		this.element.parentElement.removeAttribute('src');
		// Remove src reference from parent frame element
		// Without this, turbo won't re-open the modal on subsequent click
		this.modalTarget.remove();
	}

	// hide modal on successful form submission
	// action: "turbo:submit-end->turbo-modal#submitEnd"
	submitEnd(e) {
		e.preventDefault();
		console.log(e.detail);
		if (e.detail.success) {
			this.hideModal();
		}
	}

	// hide modal when clicking ESC
	// action: "keyup@window->turbo-modal#closeWithKeyboard"
	closeWithKeyboard(e) {
		if (e.code == 'Escape') {
			this.hideModal();
		}
	}

	// hide modal when clicking outside of modal
	// action: "click@window->turbo-modal#closeBackground"
	closeBackground(e) {
		if (e && this.modalTarget.contains(e.target)) {
			console.log(this.modalTarget.contains(e.target));
			return;
		}
		this.hideModal();
	}
}
