'use strict';

import isValidTaskName from './validation.js';
import { Task, tasks, renderTask } from './task.js';
import getGuid from './utils.js';
import initEditModal from './js/modals/editModal.js';
import Counter from './counter.js';

document.addEventListener('DOMContentLoaded', () => {
	let countTasks = 0;
	const counterInProcess = new Counter('#counterInProcess');
	const counterImportant = new Counter('#counterImportant');
	const counterCompleted = new Counter('#counterCompleted');
	const counterDeleted = new Counter('#counterDeleted');

	const taskNameInput = document.querySelector('#taskName'),
		createTaskBtn = document.querySelector('#createTask'),
		tasksInProcess = document.querySelector('#tasksInProcess'),
		tasksImportant = document.querySelector('#tasksImportant'),
		tasksCompleted = document.querySelector('#tasksCompleted'),
		tasksDeleted = document.querySelector('#tasksDeleted');

	const descriptionModal = new bootstrap.Modal('#description-modal');

	const initTooltips = () => {
		const tooltipTriggerList = document.querySelectorAll(
			'[data-bs-toggle="tooltip"]'
		);
		const tooltipList = [...tooltipTriggerList].map(
			(tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
		);
	};

	const initPopovers = () => {
		const popoverTriggerList = document.querySelectorAll(
			'[data-bs-toggle="popover"]'
		);
		const popoverList = [...popoverTriggerList].map(
			(popoverTriggerEl) =>
				new bootstrap.Popover(popoverTriggerEl, {
					html: true,
					trigger: 'focus click',
				})
		);
	};

	initTooltips();
	initPopovers();

	const deletePopoverContent = (taskId) => {
		return `<a href='#'  class='btn btn-danger hard-delete ${taskId}'>Полностью</a>
		<a href='#' class='btn btn-outline-danger ms-2 soft-delete ${taskId}'>Частично</a>`;
	};

	const addTaskToDom = (task, container) => {
		container.insertAdjacentHTML(
			'beforeend',
			`<div class="col col-card" data-id="${task.id}">
	<div
		class="card h-100 task"
		style="max-width: 18rem"
	>
		<div
			class="card-header bg-transparent d-flex justify-content-between"
		>
			<h5 class="task__title">${task.name}</h5>
			<div class="task__btns"><button class="edit btn-icon" data-bs-toggle="modal" data-bs-target="#edit-modal" data-id="${
				task.id
			}" ><span data-bs-toggle="tooltip" data-bs-title="Редактировать"><i class="fa-solid fa-pen"></i></span></button>
			<button class="close btn-icon base-delete" data-id="${
				task.id
			}" data-bs-toggle="popover" data-bs-title="Как Вы хотите удалить?" data-bs-content="${deletePopoverContent(
				task.id
			)}"><i class="fa-solid fa-xmark"></i></button>
			<button class="close btn-icon full-delete" data-id="${
				task.id
			}"><i class="fa-solid fa-xmark"></i></button>
			</div>			
		</div>
		<div class="card-body">	
			<button type="button" class="btn btn-secondary addDescription" data-id="${
				task.id
			}" data-bs-toggle="modal" data-bs-target="#description-modal">Добавить описание</button>			
			<p class="card-text task__text"></p>
		</div>
		<div
			class="card-footer bg-transparent "
		>
			<div
				class="form-check form-switch form-switch-flex"
			>
				<input
					class="form-check-input important-switch"
					type="checkbox"
					role="switch"
					id="flexSwitchCheckDefault"
					data-id="${task.id}"
				/>
				<label
					class="form-check-label"
					for="flexSwitchCheckDefault"
					>Важное
				</label>
			</div>
			<div
				class="form-check form-switch form-switch-flex"
			>
				<input
					class="form-check-input completed-switch"
					type="checkbox"
					role="switch"
					id="flexSwitchCheckDefault"
					data-id="${task.id}"
				/>
				<label
					class="form-check-label"
					for="flexSwitchCheckDefault"
					>Выполнено
				</label>
			</div>
		</div>
	</div>
</div>`
		);

		renderTask(task.id);
		addTaskEvents(task.id, container);

		initTooltips();
		initPopovers();
	};

	const addTask = () => {
		const taskName = taskNameInput.value;
		if (!isValidTaskName(taskName)) {
			taskNameInput.classList.add('is-invalid');
			return;
		} else {
			taskNameInput.classList.remove('is-invalid');
		}

		const task = new Task(taskName);
		tasks.push(task);

		taskNameInput.value = '';
		addTaskToDom(task, tasksInProcess);
		counterInProcess.increment();
		Cookies.set('tasks', JSON.stringify(tasks));
	};

	const removeTask = function (id, isHard) {
		const task = tasks.find((t) => t.id === id);
		document
			.querySelectorAll(`.col-card[data-id="${id}"]`)
			.forEach((e) => e.remove());

		if (isHard) {
			if (!task.isDeleted) {
				if (!task.isCompleted) {
					counterInProcess.decrement();
				} else {
					counterCompleted.decrement();
				}

				if (task.isImportant && !task.isCompleted) {
					counterImportant.decrement();
				}
			} else {
				counterDeleted.decrement();
			}

			const index = tasks.findIndex((task) => task.id === id);
			tasks.splice(index, 1);
		} else {
			task.isDeleted = true;
			addTaskToDom(task, tasksDeleted);
			if (!task.isCompleted) {
				counterInProcess.decrement();
			} else {
				counterCompleted.decrement();
			}

			if (task.isImportant && !task.isCompleted) {
				counterImportant.decrement();
			}

			counterDeleted.increment();
		}

		Cookies.set('tasks', JSON.stringify(tasks));
	};

	const editTask = function () {
		const id = this.dataset.id;
		document.querySelector('#edit-modal .id').value = id;

		const task = tasks.find((t) => t.id === id);

		document.querySelector('#edit-name').value = task.name;
		document.querySelector('#edit-description').value = task.description;

		Cookies.set('tasks', JSON.stringify(tasks));
	};

	const deletePopover = () => {
		const popover = document.querySelector('.popover');
		if (popover) {
			popover.remove();
		}
	};

	document.addEventListener('click', (e) => {
		if (e.target.classList.contains('hard-delete')) {
			const taskId = e.target.classList[3];
			removeTask(taskId, true);
			deletePopover();
		}
		if (e.target.classList.contains('soft-delete')) {
			const taskId = e.target.classList[4];
			removeTask(taskId);
			deletePopover();
		}

		console.log(e.target.classList);
	});

	const addDescription = function () {
		const id = this.dataset.id;
		document.querySelector('#description-modal .id').value = id;

		Cookies.set('tasks', JSON.stringify(tasks));
	};

	const changeImportantSwitch = function () {
		const id = this.dataset.id;
		const task = tasks.find((t) => t.id === id);

		if (this.checked) {
			task.isImportant = true;
			addTaskToDom(task, tasksImportant);
			counterImportant.increment();
		} else {
			const taskContainer = tasksImportant.querySelector(
				`.col-card[data-id="${id}"]`
			);
			taskContainer.remove();
			task.isImportant = false;
			renderTask(task.id);
			counterImportant.decrement();
		}

		Cookies.set('tasks', JSON.stringify(tasks));
	};

	const changeCompletedSwitch = function () {
		const id = this.dataset.id;
		const task = tasks.find((t) => t.id === id);

		if (this.checked) {
			task.isCompleted = true;

			if (task.isImportant) {
				const taskContainer = tasksImportant.querySelector(
					`.col-card[data-id="${id}"]`
				);
				taskContainer.remove();
			}
			const taskContainer = tasksInProcess.querySelector(
				`.col-card[data-id="${id}"]`
			);
			tasksCompleted.appendChild(taskContainer);
			counterCompleted.increment();
			counterInProcess.decrement();
			if (task.isImportant) {
				counterImportant.decrement();
			}
		} else {
			task.isCompleted = false;
			const taskContainer = tasksCompleted.querySelector(
				`.col-card[data-id="${id}"]`
			);
			tasksInProcess.appendChild(taskContainer);
			addTaskToDom(task, tasksImportant);
			counterCompleted.decrement();
			counterInProcess.increment();
			if (task.isImportant) {
				counterImportant.increment();
			}
		}

		renderTask(task.id);

		Cookies.set('tasks', JSON.stringify(tasks));
	};

	const addTaskEvents = (taskId, container) => {
		const addDescriptionBtn = container.querySelector(
			`.addDescription[data-id="${taskId}"]`
		);
		addDescriptionBtn.addEventListener('click', addDescription);

		const editBtn = container.querySelector(`.edit[data-id="${taskId}"]`);
		editBtn.addEventListener('click', editTask);

		container
			.querySelector(`.important-switch[data-id="${taskId}"]`)
			.addEventListener('change', changeImportantSwitch);

		container
			.querySelector(`.completed-switch[data-id="${taskId}"]`)
			.addEventListener('change', changeCompletedSwitch);

		container
			.querySelector(`.full-delete[data-id="${taskId}"]`)
			.addEventListener('click', function () {
				const id = this.dataset.id;
				removeTask(id, true);
			});
	};

	createTaskBtn.addEventListener('click', () => {
		addTask();
		initTooltips();
		initPopovers();
	});

	const descriptionModalSave = () => {
		const descriptionInput = document.querySelector(
			'#exampleFormControlTextarea1'
		);
		const taskId = document.querySelector('#description-modal .id').value;

		const task = tasks.find((t) => t.id === taskId);
		task.description = descriptionInput.value;
		renderTask(taskId);

		descriptionInput.value = '';
		descriptionModal.hide();

		Cookies.set('tasks', JSON.stringify(tasks));
	};

	document
		.querySelector('#description-modal .save')
		.addEventListener('click', descriptionModalSave);

	initEditModal();

	const initTasks = () => {
		tasks.forEach((task) => {
			if (task.isDeleted) {
				addTaskToDom(task, tasksDeleted);
				counterDeleted.increment();
			} else if (task.isCompleted) {
				addTaskToDom(task, tasksCompleted);
				counterCompleted.increment();
			} else {
				addTaskToDom(task, tasksInProcess);
				counterInProcess.increment();

				if (task.isImportant) {
					addTaskToDom(task, tasksImportant);
					counterImportant.increment();
				}
			}
		});
	};

	initTasks();
});
