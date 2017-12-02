window.onload = function() {
	var reset = document.getElementById('reset_button');
	reset.onclick = function() {
		var errors = document.getElementsByClassName('error_field');
		for (var i = 0; i < errors.length; ++i)
			errors[i].innerHTML = "";
	}
}