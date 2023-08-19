import { renderTask, tasks } from '../../task.js';

const editModal = new bootstrap.Modal('#edit-modal');

const editModalSave = () => {
	const nameInput = document.querySelector('#edit-name');
	const descriptionInput = document.querySelector('#edit-description');
	const taskId = document.querySelector('#edit-modal .id').value;

	const task = tasks.find((t) => t.id === taskId);
	task.description = descriptionInput.value;
	task.name = nameInput.value;
	renderTask(taskId);

	descriptionInput.value = '';
	nameInput.value = '';

	editModal.hide();
};

const initEditModal = () => {
	document
		.querySelector('#edit-modal .save')
		.addEventListener('click', editModalSave);
};

export default initEditModal;
