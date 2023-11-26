
const userForm = document.querySelector('#userForm')
const userSubmit = document.querySelector('#userSubmit')

function generateListener(buttonName, sortOrder){
    return function(){
        console.log(`listener triggered for ${buttonName}, ${sortOrder}`)
        const queryParams = { 'sort-by': buttonName, 'sort-order': sortOrder};

        // Create a new URL object based on the current URL
        const newUrl = new URL(window.location.href);

        // Set each query parameter in the URL, updating existing ones or adding new ones
        Object.keys(queryParams).forEach(key => newUrl.searchParams.set(key, queryParams[key]));

        // Modify the current URL
        window.location.href = newUrl
    }
    
}

const timeAscButton = document.querySelector('#timeButton.asc')
const timeDescButton = document.querySelector('#timeButton.desc')
const mineDensityAscButton = document.querySelector('#mineDensityButton.asc')
const mineDensityDescButton = document.querySelector('#mineDensityButton.desc')
console.log(timeAscButton,timeDescButton,mineDensityAscButton,mineDensityDescButton)
timeAscButton.addEventListener('click', generateListener('timeCompleted','asc'));
timeDescButton.addEventListener('click', generateListener('timeCompleted','desc'));
mineDensityAscButton.addEventListener('click', generateListener('difficulty','asc'));
mineDensityDescButton.addEventListener('click', generateListener('difficulty','desc'));





function handleSubmit(event){
    
    
}

userSubmit.addEventListener('click', handleSubmit)