const MESSAGES = {
	EMPTY: 'Введите название задачи!',
};

const isValidTaskName = (taskName) => {
	const taskNameValidation = document.querySelector('#taskNameValidation');
	if (taskName.trim() === '') {
		taskNameValidation.textContent = MESSAGES.EMPTY;
		return false;
	}

	return true;
};

export default isValidTaskName;
