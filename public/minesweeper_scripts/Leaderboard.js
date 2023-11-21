
const userForm = document.querySelector('#userForm')
const userSubmit = document.querySelector('#userSubmit')

function handleSubmit(event){
    userForm.classList.toggle('disappear')
    
}

userSubmit.addEventListener('click', handleSubmit)