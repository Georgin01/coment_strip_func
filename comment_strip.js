//функция для формирования и скачивания файла
function download(data, filename, type) {
	let file = new Blob([data], {type: type});
	if (window.navigator.msSaveOrOpenBlob) // IE10+
	    window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Другие
        let a = document.createElement("a"),
        	url = URL.createObjectURL(file);
        a.href = url;
	    a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}	

//Принимает строку и возвращает ее без комментов
function remove(str) {
	
	var prev, prevToken, quoteChar;
	var quote = regExp = characterClass = blockComment = lineComment = preserveComment = false;
	var chr = str[0], parts = [], index = 0;

	for (let i = 0; i < str.length; i++) {
		let next = str[i + 1];
		// проверяем экранирование
		let unescaped = prev !== '\\' || str[i - 2] === '\\';
		if (quote) {
			if (chr === quoteChar && unescaped) quote = false;
		} else if (regExp) {
			// проверим, чтобы '/'' не был концом регулярки
			
			if (chr === '[' && unescaped) characterClass = true;
			else if (chr === ']' && unescaped && characterClass) characterClass = false;
			else if (chr === '/' && unescaped && !characterClass) regExp = false;
		} else if (blockComment) {
			// проверка закрывающегося комментария
			if (chr === '*' && next === '/') {
				i++;
				if (!preserveComment) index = i + 1;// Следующий контент начинается после комментария.

				blockComment = preserveComment = false;
			}
		} else if (lineComment) {
			// однострочные.
			if (/[\n\r]/.test(next)) {
				lineComment = false;
				index = i + 1;
			}
		} else {
			if (/['"]/.test(chr)) {
				quote = true;
				quoteChar = chr;
			} else if (chr === '/') {
				if (next === '*') {
					// Не отфильтровывать условные комментарии/*@ ... */
					// и защищенные комменты /*! ... */
					preserveComment = /[@!]/.test(str[i + 2]);
					blockComment = true;
				} else if (next === '/') {
					lineComment = true;
				} else {
					regExp = /[(,=:[!&|?{};\/]/.test(prevToken);
				}
				if (index < i && (lineComment ||
						blockComment && !preserveComment)) {
					// вставить нормальный коннтент до коммента
					parts.push(str.substring(index, i));
					index = i;
				}
			}
		}
		// следим за предыдущим пробелом
		if (!/\s/.test(chr))
			prevToken = chr;
		prev = chr;
		chr = next;
	}
	if (index < str.length && !lineComment && (!blockComment || preserveComment)) {
		parts.push(str.substring(index, str.length));
	}
	str = parts.join('');

	return str;
}

	//Главная функция 
function commentsStrip(object){
	//проверка на поддержку браузером FILE API
	if (window.File && window.FileReader && window.Blob) {
		let content = ''; //переменная для записи содержимого файла
		let file = object.files[0]; // первый элемент массива файлов
		let reader = new FileReader();
		//при успешном прогружении файла записать содержимое в переменную
		reader.onload = function(){
			content = reader.result;
			//удалить комментарии
			let a = remove(content);
			//Вернуть функцию для скачивания готового документа
			return(download(a, file.name, file.type));
		}
		//считать как простой текст
		reader.readAsText(file);
	}else{
		alert("Нужные File API не поддерживаются вашим браузером!");
	}
}