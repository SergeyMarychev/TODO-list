export default class Counter {
	constructor(selector, value = 0) {
		this.value = value;
		this.element = document.querySelector(selector);
	}

	increment() {
		this.value++;
		this.element.textContent = this.value;
	}

	decrement() {
		this.value--;
		this.element.textContent = this.value;
	}

	clear() {
		this.value = 0;
		this.element.textContent = this.value;
	}
}
