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

  connect() {}

  async handleApiRequest(url, method, body = null, formData = null) {
    let options = {
      method: method,
      responseKind: 'json',
      headers: {},
    };

    if (body) {
      options.body = JSON.stringify(body);
      options.headers['Content-Type'] = 'application/json';
    }

    if (formData) {
      options.body = formData;
    }

    console.log(options)

    const response = await fetch(url, options);
    
    if (response.ok) {
      const result = await response.json();
      return result;
    } else {
      console.error('API Request Failed:', response);
      return null;
    }
  }

  async createTitle(event) {
    const body = { title: this.titleTarget.value };
    const result = await this.handleApiRequest('/api/v1/admins/recipes/create_title', 'POST', body);

    if (result && result.edit_url) {
      window.location = result.edit_url;
    }
  }

  async editTitle(event) {
    const body = {
      title: this.titleTarget.value,
      id: this.idValue,
      edit: 'edit',
    };
    const result = await this.handleApiRequest('/recipes/title', 'POST', body);

    if (result && result.edit_url) {
      window.location = result.edit_url;
    }
  }

  async createIngredient(event) {
    event.preventDefault();
    const form = cash('#_recipe_ingredient_form')[0];
    const formData = new FormData(form);
    formData.append('id', this.idValue);

    if (form.checkValidity()) {
      await this.handleApiRequest('/recipes/create_ingredient', 'PATCH', null, formData);
    }
  }

  async updateIngredient(event) {
    const form = cash('#ingredient')[0];
    const formData = new FormData(form);

    if (form.checkValidity()) {
      await this.handleApiRequest(`/ingredients/${this.ingredientIdValue}`, 'PATCH', null, formData);
    }
  }

  async delete() {
    await this.handleApiRequest(`/ingredients/${this.ingredientIdValue}`, 'DELETE');
  }

  addDirectionFields() {
    const form = cash('#recipe-direction')[0];
    const submitDirectionButton = cash('#submit-direction-button')[0];
    const cloneElement = this.originalTarget.cloneNode(true);
    const formInputElementSize = form.getElementsByTagName('input').length - 1;

    cloneElement.getElementsByTagName('input')[0].name = `direction[${formInputElementSize + 1}]`;

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

    if (form.checkValidity()) {
      await this.handleApiRequest('/recipes/create_directions', 'PATCH', null, formData);
    }
  }

  async updateDirection(event) {
    const form = cash('#recipe-direction-edit')[0];
    const formData = new FormData(form);

    if (form.checkValidity()) {
      await this.handleApiRequest('/recipes/update_direction', 'PATCH', null, formData);
    }
  }

  async deleteDirection(event) {
    const response = await this.handleApiRequest('/recipes/delete_direction', 'PATCH', { id: this.ingredientIdValue, recipe_id: this.idValue });
  }
}

