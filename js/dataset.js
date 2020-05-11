function renderDataset(){
	d3.csv("./static/dataset/avocado_dataset.csv").then(function(data) {
		var table = document.getElementById('dataset_table');

		// Insert table header
		var headCount = 0;
		var header = table.createTHead();
		var rowH = header.insertRow(headCount);   
		Object.keys(data[0]).forEach(entry => {
			var cell = rowH.insertCell(headCount);
			cell.innerHTML = entry;
			headCount = headCount + 1;
		});

		var rowCount = 1;
		data.forEach(function(d){
			var row = table.insertRow(rowCount);
			var colCount = 0;
			Object.entries(d).forEach(entry => {

				var cell = row.insertCell(colCount);
				cell.innerHTML = entry[1];
				colCount = colCount + 1;
			});

			rowCount = rowCount + 1;
		})
	}); 
}
