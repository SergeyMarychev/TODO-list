import taskService from '../api/taskService.js';

const editModal = new bootstrap.Modal('#edit-modal');

const editModalSave = (onUpdate) => {
	const nameInput = document.querySelector('#edit-name');
	const descriptionInput = document.querySelector('#edit-description');
	const taskId = document.querySelector('#edit-modal .id').value;

	taskService
		.update(taskId, null, null, nameInput.value, descriptionInput.value)
		.then(() => {
			descriptionInput.value = '';
			nameInput.value = '';
			editModal.hide();
			onUpdate();
		});
};

const initEditModal = (onUpdate) => {
	document
		.querySelector('#edit-modal .save')
		.addEventListener('click', () => {
			editModalSave(onUpdate);
		});
};

export default initEditModal;
