import getGuid from './utils.js';

export class Task {
	constructor(name) {
		this.id = getGuid();
		this.name = name;
		this.isCompleted = false;
		this.isImportant = false;
		this.description = '';
		this.isDeleted = false;
	}
}

export const tasks =
	Cookies.get('tasks') == undefined ? [] : JSON.parse(Cookies.get('tasks'));

export const renderTask = (task) => {
	const taskContainers = document.querySelectorAll(
		`.col-card[data-id="${task.id}"]`
	);
	taskContainers.forEach((taskContainer) => {
		const addDescription = taskContainer.querySelector('.addDescription');
		const taskText = taskContainer.querySelector('.task__text');
		const taskName = taskContainer.querySelector('.task__title');
		const importantSwitch =
			taskContainer.querySelector('.important-switch');
		const completedSwitch =
			taskContainer.querySelector('.completed-switch');

		taskName.textContent = task.name;
		importantSwitch.checked = task.isImportant;
		completedSwitch.checked = task.isCompleted;

		taskText.textContent = task.description;
		if (task.description) {
			addDescription.style.display = 'none';
			taskText.style.display = 'block';
		} else {
			addDescription.style.display = 'block';
			taskText.style.display = 'none';
		}

		if (task.isCompleted) {
			importantSwitch.disabled = true;
			taskContainer.querySelector('.edit').style.display = 'none';
			addDescription.disabled = true;
		} else {
			importantSwitch.disabled = false;
			taskContainer.querySelector('.edit').style.display = 'inline';
			addDescription.disabled = false;
		}

		if (task.isDeleted) {
			taskContainer.querySelector('.base-delete').style.display = 'none';
			importantSwitch.disabled = true;
			taskContainer.querySelector('.edit').style.display = 'none';
			addDescription.disabled = true;
		} else {
			taskContainer.querySelector('.full-delete').style.display = 'none';
		}
	});
};
