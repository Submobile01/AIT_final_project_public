
const userForm = document.querySelector('#userForm')
const userSubmit = document.querySelector('#userSubmit')

function handleSubmit(event){
    this.classList.toggle('disappear')
    
}

userSubmit.addEventListener('click', handleSubmit)