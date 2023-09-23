'use strict';

import isValidTaskName from './validation.js';
import { Task, tasks, renderTask } from './task.js';
import getGuid from './utils.js';
import initEditModal from './js/modals/editModal.js';
import Counter from './counter.js';
import taskService from './js/api/taskService.js';

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

	const clear = () => {
		counterDeleted.clear();
		counterCompleted.clear();
		counterImportant.clear();
		counterInProcess.clear();

		tasksInProcess.textContent = '';
		tasksImportant.textContent = '';
		tasksCompleted.textContent = '';
		tasksDeleted.textContent = '';
	};

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

		renderTask(task);
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

		taskService.create(taskName).then(() => {
			taskNameInput.value = '';
			initTasks();
		});
	};

	const removeTask = function (id, isHard) {
		taskService.delete(id, !isHard).then(() => {
			initTasks();
		});
	};

	const editTask = function () {
		const id = this.dataset.id;
		document.querySelector('#edit-modal .id').value = id;

		taskService.get(id).then((task) => {
			document.querySelector('#edit-name').value = task.name;
			document.querySelector('#edit-description').value =
				task.description;
		});
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
			taskService.delete(taskId).then(() => {
				initTasks();
			});
			deletePopover();
		}
		if (e.target.classList.contains('soft-delete')) {
			const taskId = e.target.classList[4];
			taskService.delete(taskId, true).then(() => {
				initTasks();
			});
			deletePopover();
		}

		console.log(e.target.classList);
	});

	const addDescription = function () {
		const id = this.dataset.id;
		document.querySelector('#description-modal .id').value = id;
	};

	const changeImportantSwitch = function () {
		const id = this.dataset.id;

		taskService.update(id, this.checked).then(() => {
			initTasks();
		});
	};

	const changeCompletedSwitch = function () {
		const id = this.dataset.id;

		taskService.update(id, null, this.checked).then(() => {
			initTasks();
		});
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

		taskService
			.update(taskId, null, null, null, descriptionInput.value)
			.then(() => {
				descriptionInput.value = '';
				descriptionModal.hide();
				initTasks();
			});
	};

	document
		.querySelector('#description-modal .save')
		.addEventListener('click', descriptionModalSave);

	const initTasks = () => {
		taskService.getAll().then((tasks) => {
			clear();

			if (!tasks) {
				return;
			}

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
		});
	};

	initTasks();
	initEditModal(initTasks);
});
