import { patch } from '@rails/request.js';
import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
	// static targets = ['plan'];
	static values = {
		plan: Number,
		mealtype: String,
		meal: Number,
		day: String,
	};

	async update(event) {
		const planValue = this.planValue;
		const mealValue = this.mealValue;
		const mealtypeValue = this.mealtypeValue;
		const dayValue = this.dayValue;

		let body = {};
		body['plan_id'] = planValue;
		body['id'] = planValue;
		body['recipe_id'] = mealValue;
		body['meal_type'] = mealtypeValue;
		body['day'] = dayValue;

		let response = await patch(`/plans/meal_update/`, {
			body: body,
			responseKind: 'json',
		});

		console.log(response);

		if (response.ok) {
			response.text.then((result) => {
				const event = new CustomEvent('update-mealplan');

				const trigger = new CustomEvent('triggerModalClose');
				window.dispatchEvent(trigger, event);
			});
		}
	}
}
