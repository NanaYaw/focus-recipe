import { Controller } from '@hotwired/stimulus';

const imageTypes = ['image/gif', 'image/jpeg', 'image/png'];

export default class extends Controller {
	static targets = ['thumbnail', 'thumbnailInput'];
	static values = {
		imageWidth: String,
	};

	changeThumbnail(e) {
		e.preventDefault();

		this.thumbnailInputTarget.click();
	}

	attachThumbnail(e) {
		e.preventDefault();

		const file = e.target.files[0];

		if (!imageTypes.includes(file.type)) {
			alert('Please Attached must be an image');
		}

		this.thumbnailInputTarget.files = e.target.files;

		this.thumbnailTarget.src = URL.createObjectURL(file);

		if (this.imageWidthValues == '') {
			console.log('imageWidth not set');
		} else {
			this.thumbnailTarget.classList += ' w-96 h-96 object-cover object-top';
		}
	}
}
