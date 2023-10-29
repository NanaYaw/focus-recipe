const activeSelector = "[aria-selected='true']";

import { Controller } from '@hotwired/stimulus';

export default class Multiselect extends Controller {
	static targets = [
		'hidden',
		'list',
		'search',
		'preview',
		'dropdown',
		'item',
		'inputContainer',
	];

	static values = {
		items: Array,
		selected: Array,
		searchUrl: String,
		searchRemote: { type: Boolean, default: false },
		preloadUrl: String,
		disabled: { type: Boolean, default: false },
		selectedVariant: { type: String, default: 'single' },
	};

	connect() {
		this.hiddenTarget.insertAdjacentHTML('afterend', this.template);
		if (this.selectedValue.length) this.selectedValueChanged();
		this.search = debounce(this.search.bind(this), 300);
		this.enhanceHiddenSelect();
		if (this.preloadUrlValue) this.preload();

		console.log('selected values', this.selectedValue);
	}

	// Allows selecting the hidden select field from html and extracting selected id values:
	// document.getElementById("selectId").values - [2, 4, 23]
	enhanceHiddenSelect() {
		Object.defineProperty(this.hiddenTarget, 'values', {
			get: () => {
				if (this.selectedValue.length <= 0) return [];

				return this.selectedValue.map((item) => item.value);
			},
		});
	}

	/** ------ SEARCH --------------- */
	search() {
		if (this.searchRemoteValue) return this.searchRemote();

		this.searchLocal();
	}

	async searchRemote() {
		if (this.searchTarget.value === '') return;

		const response = await fetch(
			this.searchUrlValue +
				'?' +
				new URLSearchParams({
					q: this.searchTarget.value,
					preselects: this.selectedValue.map((x) => x.value).join(','),
				})
		);

		const searchedItems = await response.json();

		this.itemsValue = searchedItems;
		this.dropdownTarget.classList.add('multiselect__dropdown--open');
	}

	searchLocal() {
		this.dropdownTarget.classList.add('multiselect__dropdown--open');

		/**
		 * if search value is empty
		 * filter by items of preload
		 */
		if (this.searchTarget.value === '') {
			let theRestOfTheItems = this.itemsValue.filter(
				(x) => !this.selectedValue.map((y) => y.value).includes(x.value)
			);
			this.listTarget.innerHTML = this.selectedItems;
			this.listTarget.insertAdjacentHTML(
				'beforeend',
				this.items(theRestOfTheItems)
			);
		}

		let searched = this.itemsValue.filter((item) => {
			return item.text
				.toLowerCase()
				.includes(this.searchTarget.value.toLowerCase());
		});

		let selectedSearched = this.selectedValue.filter((item) => {
			return item.text
				.toLowerCase()
				.includes(this.searchTarget.value.toLowerCase());
		});

		searched = searched.filter(
			(x) => !selectedSearched.map((y) => y.value).includes(x.value)
		);

		if (searched.length === 0) {
			this.dropdownTarget.classList.remove('multiselect__dropdown--open');
		}
		this.listTarget.innerHTML = this.items(selectedSearched, true);
		this.listTarget.insertAdjacentHTML('beforeend', this.items(searched));
	}

	async preload() {
		const response = await fetch(this.preloadUrlValue);

		const items = await response.json();
		this.itemsValue = items;
	}

	searchUrlValueChanged() {
		if (this.searchUrlValue) this.searchRemoteValue = true;
	}
	/** ------ END SEARCH ----------- */

	toggleDropdown() {
		if (this.dropdownTarget.classList.contains('multiselect__dropdown--open')) {
			this.dropdownTarget.classList.remove('multiselect__dropdown--open');
			if (this.selectedValue.length > 0)
				this.inputContainerTarget.style.display = 'none';
			this.searchTarget.blur();
		} else {
			if (this.itemsValue.length)
				this.dropdownTarget.classList.add('multiselect__dropdown--open');
			this.searchTarget.focus();
		}
	}

	itemsValueChanged() {
		if (!this.hasListTarget) return;

		if (this.itemsValue.length) {
			this.listTarget.innerHTML = this.items(this.itemsValue);
		} else {
			this.listTarget.innerHTML = this.noResultsTemplate;
		}
	}

	selectedValueChanged() {
		if (!this.hasPreviewTarget) return;

		while (this.hiddenTarget.options.length) this.hiddenTarget.remove(0);

		if (this.selectedValue.length > 0) {
			this.previewTarget.innerHTML = this.pills;
			this.searchTarget.style.paddingTop = '0.5rem';

			this.selectedValue.forEach((selected) => {
				const option = document.createElement('option');
				option.text = selected.text;
				option.value = selected.value;
				option.setAttribute('selected', true);
				this.hiddenTarget.add(option);
			});

			if (!this.searchRemoteValue) {
				this.selectedValue.forEach((selected) => {
					this.checkItem(selected.value);
				});
			}
		} else {
			this.searchTarget.style.paddingTop = '0';
			this.inputContainerTarget.style.display = '';
			this.previewTarget.innerHTML = '';
		}

		this.element.dispatchEvent(new Event('multiselect-change'));
	}

	removeItem(e) {
		e.stopPropagation();

		const itemToRemove = e.currentTarget.parentNode;

		this.selectedValue = this.selectedValue.filter(
			(x) => x.value.toString() !== itemToRemove.dataset.value
		);
		this.uncheckItem(itemToRemove.dataset.value);
		this.element.dispatchEvent(
			new CustomEvent('multiselect-removed', {
				detail: { id: itemToRemove.dataset.value },
			})
		);
	}

	uncheckItem(value) {
		const itemToUncheck = this.listTarget.querySelector(
			`input[data-value="${value}"]`
		);

		if (itemToUncheck) itemToUncheck.checked = false;
	}

	checkItem(value) {
		const itemToCheck = this.listTarget.querySelector(
			`input[data-value="${value}"]`
		);

		if (itemToCheck) itemToCheck.checked = true;
	}

	toggleItem(input) {
		const item = {
			text: input.dataset.text,
			value: input.dataset.value,
		};
		let newSelectedArray = this.selectedValue;

		if (this.selectedVariantValue == 'multiple') {
			if (input.checked) {
				newSelectedArray.push(item);

				if (this.focusedItem) {
					this.focusedItem
						.closest('li')
						.classList.remove('multiselect__focused');
					this.focusedItem.removeAttribute('aria-selected');
				}

				input.setAttribute('aria-selected', 'true');
				input.closest('li').classList.add('multiselect__focused');
				// this.element.dispatchEvent(
				// 	new CustomEvent('multiselect-added', { detail: { item: item } })
				// );
			} else {
				newSelectedArray = newSelectedArray.filter(
					(selected) => selected.value.toString() !== item.value
				);
				this.element.dispatchEvent(
					new CustomEvent('multiselect-removed', { detail: { id: item.value } })
				);
			}
		} else {
			newSelectedArray = [item];
			console.log('removing check mark', this.selectedValue[0]?.value);
			this.uncheckItem(this.selectedValue[0]?.value);
		}

		this.selectedValue = newSelectedArray;
	}

	sibling(next) {
		const options = this.itemTargets;
		const selected = this.focusedItem;
		const index = options.indexOf(selected);
		const sibling = next ? options[index + 1] : options[index - 1];
		const def = next ? options[0] : options[options.length - 1];
		return sibling || def;
	}

	navigate(target) {
		const previouslySelected = this.focusedItem;
		if (previouslySelected) {
			previouslySelected.removeAttribute('aria-selected');
			previouslySelected.closest('li').classList.remove('multiselect__focused');
		}

		target.setAttribute('aria-selected', 'true');
		target.closest('li').classList.add('multiselect__focused');
		target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
	}

	get focusedItem() {
		return this.listTarget.querySelector(activeSelector);
	}

	focusSearch() {
		this.inputContainerTarget.style.display = '';
		this.searchTarget.focus();
	}

	get template() {
		return `<div class="relative">
      <div class="multiselect__container border border-red-600 relative z-50 bg-white" data-multiselect-target="container" data-action="click->multiselect#toggleDropdown focus->multiselect#focusSearch" tabindex="0" data-turbo-cache="false">
        <div class="multiselect__preview" data-multiselect-target="preview">
        </div>
        <div class="multiselect__input-container" data-multiselect-target="inputContainer">${this.inputTemplate}</div>
      </div>
      <div class="w-full h-full absolute top-0 z-10" data-action="click@window->multiselect#closeOnClickOutside">
        <div class="multiselect__dropdown border border-black backdrop-blur-sm bg-white/50
 hs-overlay-backdrop shadow-lg pt-20" data-multiselect-target="dropdown">
          <ul class="multiselect__list" data-multiselect-target="list">
            ${this.allItems}
          </ul>
        </div>
      </div>
      </div>
    `;
	}

	get noResultsTemplate() {
		return `<div class="multiselect__no-result">${this.element.dataset.noResultsMessage}</div>`;
	}

	get inputTemplate() {
		return `
        <input type="text" class="multiselect__search" placeholder="${
					this.element.dataset.placeholder
				}"
               data-multiselect-target="search" ${
									this.disabledValue === true ? 'disabled' : ''
								}
               data-action="multiselect#search keydown->multiselect#onKeyDown">
      `;
	}

	items(items, selected = false) {
		const checked = selected ? 'checked' : '';
		let itemsTemplate = '';

		items.forEach(
			(item) => (itemsTemplate += this.itemTemplate(item, checked))
		);

		return itemsTemplate;
	}

	get selectedItems() {
		return this.items(this.selectedValue, true);
	}

	get allItems() {
		return this.items(this.itemsValue);
	}

	itemTemplate(item, selected = '') {
		return `
      <li>
        <label>
          <input type="checkbox" ${selected} data-value="${item.value}" data-text="${item.text}"
          data-action="multiselect#checkBoxChange" data-multiselect-target="item" tabindex="-1">
          <span>${item.text}</span>
        </label>
      </li>
    `;
	}

	checkBoxChange(event) {
		event.preventDefault();
		this.searchTarget.focus();
		this.toggleItem(event.currentTarget);
	}

	/** --------- PILLS -------------- */

	get pills() {
		let itemsTemplate = '';

		this.selectedValue.forEach(
			(item) => (itemsTemplate += this.pillTemplate(item))
		);

		return itemsTemplate;
	}

	pillTemplate(item) {
		const deletePill = `<span
				class='multiselect__pill-delete'
				data-action='click->multiselect#removeItem'>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					viewBox='0 0 30 30'
					width='12px'
					height='12px'
				>
					<path d='M25.707,6.293c-0.195-0.195-1.805-1.805-2-2c-0.391-0.391-1.024-0.391-1.414,0c-0.195,0.195-17.805,17.805-18,18c-0.391,0.391-0.391,1.024,0,1.414c0.279,0.279,1.721,1.721,2,2c0.391,0.391,1.024,0.391,1.414,0c0.195-0.195,17.805-17.805,18-18C26.098,7.317,26.098,6.683,25.707,6.293z' />
					<path d='M23.707,25.707c0.195-0.195,1.805-1.805,2-2c0.391-0.391,0.391-1.024,0-1.414c-0.195-0.195-17.805-17.805-18-18c-0.391-0.391-1.024-0.391-1.414,0c-0.279,0.279-1.721,1.721-2,2c-0.391,0.391-0.391,1.024,0,1.414c0.195,0.195,17.805,17.805,18,18C22.683,26.098,23.317,26.098,23.707,25.707z' />
				</svg>
			</span>`;

		if (this.disabledValue) {
			return `<div class="multiselect__pill" data-value="${item.value}" title="${item.text}">
        <span class="multiselect__pill-text">${item.text}</span>
      </div>`;
		} else {
			if (this.selectedVariantValue == 'multiple') {
				return `<div class="multiselect__pill" data-value="${item.value}" title="${item.text}">
        				<span class="multiselect__pill-text">${item.text}</span>
						${deletePill}
      				</div>`;
			} else {
				return `<div class="multiselect__pill w-full mb-2" data-value="${item.value}" title="${item.text}">
        				<span class="multiselect__pill-text">${item.text}</span>
						${deletePill}
      				</div>`;
			}
		}
	}

	/** ------- CLOSE Dropdown --------------- */
	closeOnClickOutside({ target }) {
		if (this.element.contains(target)) return;

		this.dropdownTarget.classList.remove('multiselect__dropdown--open');
		if (this.selectedValue.length > 0)
			this.inputContainerTarget.style.display = 'none';
		this.searchTarget.value = '';
		if (!this.searchRemoteValue) {
			this.listTarget.innerHTML = this.allItems;
			this.selectedValue.forEach((selected) => {
				this.checkItem(selected.value);
			});
		}
	}

	/** ------ END OF CLOSE DROPDOWN ----------- */
}

function debounce(fn, delay) {
	let timeoutId = null;

	return (...args) => {
		const callback = () => fn.apply(this, args);
		clearTimeout(timeoutId);
		timeoutId = setTimeout(callback, delay);
	};
}

export { Multiselect };
