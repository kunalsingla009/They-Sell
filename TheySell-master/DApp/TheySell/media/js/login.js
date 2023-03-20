const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
	container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
	container.classList.remove("right-panel-active");
});

function seller_details(){
	check_button = document.getElementById("is_seller")
	if (check_button.checked == true){
		document.getElementById("labeladharcard").hidden = false
		document.getElementById("aadhaarcard").hidden = false
		document.getElementById("sellerid").hidden = false
		document.getElementById("accadd").hidden = false

		document.getElementById("aadhaarcard").required = true
		document.getElementById("sellerid").required = true
		document.getElementById("accadd").required = true

		document.getElementById("signupForm").action = "/signupseller/"
	}
	else{
		document.getElementById("labeladharcard").hidden = true
		document.getElementById("aadhaarcard").hidden = true
		document.getElementById("sellerid").hidden = true
		document.getElementById("accadd").hidden = true

		document.getElementById("aadhaarcard").required = false
		document.getElementById("sellerid").required = false
		document.getElementById("accadd").required = false

		document.getElementById("signupForm").action = "/signupuser/"
	}
}