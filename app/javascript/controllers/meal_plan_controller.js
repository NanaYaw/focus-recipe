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

	connect() {
		console.log('hello connected');
	}

	update(event) {
		// console.log(this.planValue);
		// console.log(this.mealValue);
		// console.log(this.mealtypeValue);

		const planValue = this.planValue;
		const mealValue = this.mealValue;
		const mealtypeValue = this.mealtypeValue;
		const dayValue = this.dayValue;

		// console.log(mealtypeValue);

		let body = {};
		body['plan_id'] = planValue;
		body['id'] = planValue;
		body['recipe_id'] = mealValue;
		body['meal_type'] = mealtypeValue;
		body['day'] = dayValue;
		patch(`/plans/meal_update/`, { body: body, responseKind: 'turbo-stream' });
	}
}
