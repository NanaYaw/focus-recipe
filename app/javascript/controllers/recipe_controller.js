import { patch, post, destroy } from '@rails/request.js';
import { Controller } from '@hotwired/stimulus';
import cash from 'cash-dom';
export default class extends Controller {
	static targets = ['title', 'dynamic', 'original', 'addDirection'];
	static values = {
		title: String,
		ingredients: Array,
		directions: Array,
		description: String,
		id: Number,
		ingredientId: Number,
	};

	connect() {
		console.log('recipe controller');
	}

	async createTitle(event) {
		let body = {};
		body['title'] = this.titleTarget.value;

		// console.log(body);

		let response = await post(`/recipes/title`, {
			body: body,
			responseKind: 'json',
		});

		if (response.ok) {
			response.text.then((result) => {
				const { edit_url } = JSON.parse(result);
				window.location = edit_url;

				// console.log(result.text.edit_url);
			});
		} else {
			// console.log(response);
		}
	}
	async editTitle(event) {
		let body = {};
		body['title'] = this.titleTarget.value;
		body['id'] = this.idValue;
		body['edit'] = 'edit';

		console.log('Iam editing the title');
		console.log(this.idValue);

		let response = await post(`/recipes/title`, {
			body: body,
			responseKind: 'json',
		});

		if (response.ok) {
			response.text.then((result) => {
				const { edit_url } = JSON.parse(result);
				window.location = edit_url;
			});
		} else {
			// console.log(response);
		}
	}

	async create_ingredient(event) {
		event.preventDefault();
		const modal = cash('#recipeModal');

		const form = cash('#_recipe_ingredient_form')[0];
		const formData = new FormData(form);

		formData.append('id', this.idValue);

		if (form.checkValidity()) {
			const response = await patch('/recipes/create_ingredient', {
				body: formData,
				responseKind: 'turbo-stream',
			});
			// console.log(response);
			// if (response.ok) {
			// 	modal.hide();
			// } else {
			// 	response.json.then(function (errors) {
			// 		// console.log(errors);
			// 		// me.dispatch('error', {
			// 		// 	detail: { resourceName: resourceName, errors: errors },
			// 		// });
			// 	});
			// }
		}
	}

	async update_ingredient(event) {
		const form = cash('#ingredient')[0];
		const formData = new FormData(form);

		// for (const result of formData.entries()) {
		// 	// console.log(result);
		// }

		if (form.checkVisibility()) {
			const response = await patch(`/ingredients/${this.ingredientIdValue}`, {
				body: formData,
				responseKind: 'turbo-stream',
			});
			if (response.ok) {
				// console.log(response);
			} else {
				console.log('server response', response);
			}
		}
	}

	async delete() {
		const response = await destroy(`/ingredients/${this.ingredientIdValue}`, {
			responseKind: 'turbo-stream',
		});
		if (response.ok) {
			console.log(response);
		} else {
			console.log('server response', response);
		}
	}

	add_direction_fields() {
		const form = cash('#recipe-direction')[0];
		const submitDirectionButton = cash('#submit-direction-button')[0];

		const cloneElement = this.originalTarget.cloneNode(true);
		const formInputElementSize = form.getElementsByTagName('input').length - 1;

		cloneElement.getElementsByTagName('input')[0].name = `direction[${
			formInputElementSize + 1
		}]`;

		if (formInputElementSize > 0) {
			submitDirectionButton.removeAttribute('hidden');
		}

		cloneElement.removeAttribute('hidden');
		this.addDirectionTarget.removeAttribute('hidden');

		this.dynamicTarget.append(cloneElement);
	}

	async submitDirection() {
		const form = cash('#recipe-direction')[0];
		const formData = new FormData(form);

		for (const result of formData.entries()) {
			console.log(result);
		}

		if (form.checkVisibility()) {
			const response = await patch(`/recipes/create_directions`, {
				body: formData,
				responseKind: 'turbo-stream',
			});
			if (response.ok) {
				console.log(response);
			} else {
				console.log('server response', response);
			}
		}
	}

	edit_direction(event) {
		const form = cash('#recipe-direction')[0];
		// console.log(form);
	}

	async update_direction(event) {
		const form = cash('#recipe-direction-edit')[0];

		const formData = new FormData(form);

		if (form.checkVisibility()) {
			const response = await patch(`/recipes/update_direction`, {
				body: formData,
				responseKind: 'turbo-stream',
			});
			if (response.ok) {
				console.log(response);
			} else {
				console.log('server response', response);
			}
		}
	}

	async delete_direction(event) {
		console.log(this.idValue);
		console.log(this.ingredientIdValue);
		const recipe_id = '';
		const ingredient_id = '';

		const response = await patch(`/recipes/delete_direction`, {
			body: { id: this.ingredientIdValue, recipe_id: this.idValue },
			responseKind: 'turbo-stream',
		});
		if (response.ok) {
			console.log(response);
		} else {
			console.log('server response', response);
		}
	}
}
