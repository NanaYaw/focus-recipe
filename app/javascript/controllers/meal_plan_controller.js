import { patch } from '@rails/request.js';
import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static values = {
    plan: Number,
    mealtype: String,
    meal: Number,
    day: String,
  };

  async update(event) {
    const { planValue, mealValue, mealtypeValue, dayValue } = this;

    const body = {
      plan_id: planValue,
      id: planValue,
      recipe_id: mealValue,
      meal_type: mealtypeValue,
      day: dayValue,
    };

    try {
      const {response} = await patch('/api/plans/meal_update/', {
        body: body,
        responseKind: 'json',
      });
      if (response.ok) {
        const result = await response.text();
        this._dispatchMealPlanUpdate();
      } else {
      }
    } catch (error) {
    }
  }

  _dispatchMealPlanUpdate() {
    const closeModalEvent = new CustomEvent('triggerModalClose');
    window.dispatchEvent(closeModalEvent);

    const updateMealPlanEvent = new CustomEvent('update-mealplan');
    window.dispatchEvent(updateMealPlanEvent);
  }
}

