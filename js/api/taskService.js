class TaskService {
	constructor() {
		this.url = 'https://localhost:7195/Tasks';
	}

	async getAll(isImportant, isCompleted, isDeleted) {
		let result = null;
		await axios
			.get(this.url + '/GetAll', {
				params: {
					isImportant: isImportant,
					isCompleted: isCompleted,
					isDeleted: isDeleted,
				},
			})
			.then(function (response) {
				result = response.data;
			})
			.catch(function (error) {
				console.log(error);
			});

		return result;
	}

	async update(
		id,
		isImportant = null,
		isCompleted = null,
		name = null,
		description = null
	) {
		await axios
			.put(this.url + '/Update', {
				id: id,
				isImportant: isImportant,
				isCompleted: isCompleted,
				name: name,
				description: description,
			})
			.catch(function (error) {
				console.log(error);
			});
	}

	async delete(id, isSoftDelete = false) {
		await axios
			.delete(this.url + '/Delete', {
				params: {
					id: id,
					isSoftDelete: isSoftDelete,
				},
			})
			.catch(function (error) {
				console.log(error);
			});
	}

	async create(name) {
		await axios
			.post(this.url + '/Create?name=' + name)
			.catch(function (error) {
				console.log(error);
			});
	}

	async get(id) {
		let result = null;
		await axios
			.get(this.url + '/Get', {
				params: {
					id: id,
				},
			})
			.then(function (response) {
				result = response.data;
			})
			.catch(function (error) {
				console.log(error);
			});

		return result;
	}
}

export default new TaskService();
