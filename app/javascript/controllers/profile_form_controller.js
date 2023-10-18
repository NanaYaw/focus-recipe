import { Controller } from '@hotwired/stimulus';

const imageTypes = ['image/gif', 'image/jpeg', 'image/png'];

export default class extends Controller {
	static targets = ['thumbnail', 'thumbnailInput'];

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
		console.log(this.thumbnailTarget);
	}
}
