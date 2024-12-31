function goToMenu(){
    window.location.href = "./menu.html"
}

function goToHome(){
    window.location.href = "./main.html"
}

async function fetchAndStoreData(method, url, key, headers, json_data) {
    try {

        const options = {
            method: method, // Set the HTTP method (GET or POST)
            headers: headers,
            body: json_data ? json_data : null // Stringify data if provided
        };
        const response = await fetch(url, options);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            setWithExpiry('error', errorData, 60*5); // 5min expiry
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        let data = [];
        if (method=="GET"){
            const text = await response.text();
            if (text) {
                data = JSON.parse(text); // Parse as JSON
            }
            setWithExpiry(key, data, 60*60*12) // 12 hour expiry
        } else {
            return await response.json();
        }
    } catch (error) {
        console.error('Error fetching or storing data:', error);
    }
}

// const base_url = "http://127.0.0.1:8000"
const base_url = 'https://django-restaurant.chbk.app'
const front_url = "https://hojrehcafe.ir"

function convertToPersianPrice(number) {
    // Convert number to string and add commas
    const numberWithCommas = number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    
    // Mapping Arabic numerals to Persian numerals
    const persianNumerals = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    
    // Convert each digit to its Persian equivalent
    let persianPrice = '';
    for (let char of numberWithCommas) {
        if (/\d/.test(char)) { // Check if the character is a digit
            persianPrice += persianNumerals[parseInt(char)];
        } else {
            persianPrice += char; // Keep commas or other characters
        }
    }

    return persianPrice;
}


function fillLogo(){
    if (getWithExpiry('restaurant')){
        const restaurant = getWithExpiry('restaurant');
        const logo_img = document.getElementsByClassName("logo")[0];
        logo_img.src = `${base_url}${restaurant.logo}`;
    }
}

const single_words = {
    'greasy': 'چرب',
    'vegan': 'گیاهی',
    'dietary': 'رژیمی',
    'spicy': 'تند',
    'local': 'محلی',
    'raw': 'خام',
}



function setWithExpiry(key, value, ttl) { // ttl is in seconds
    const now = new Date();
    const item = {
        value: value,
        expiry: now.getTime() + ttl*1000 
    };
    localStorage.setItem(key, JSON.stringify(item));
}


function getWithExpiry(key) {
    const itemStr = localStorage.getItem(key);
    // If the item doesn't exist, return null
    if (!itemStr) {
        return null;
    }
    
    const item = JSON.parse(itemStr);
    const now = new Date();
    
    // Compare the expiry time of the item with the current time
    if (now.getTime() > item.expiry) {
        // If the item is expired, delete it and return null
        localStorage.removeItem(key);
        return null;
    }
    
    return item.value; // Return the value if not expired
}


document.addEventListener('DOMContentLoaded', ()=>{
    const menuBtn = document.getElementsByClassName('menu-btn')[0];
    const closeMenuBtn = document.getElementById('closeMenu');
    
    menuBtn.addEventListener('click', 
        function() {
            console.log('togling menu!')
            const menu = document.getElementById('sideMenu');
            menu.classList.toggle('openMenu'); // Toggle the 'open' class

            closeMenuBtn.classList.toggle('openClose'); // Toggle the 'open' class
        }
    );

    closeMenuBtn.addEventListener('click', 
        function() {
            console.log('togling menu!')
            const menu = document.getElementById('sideMenu');
            menu.classList.toggle('openMenu'); // Toggle the 'open' class
            
            closeMenuBtn.classList.toggle('openClose'); // Toggle the 'open' class
        }
    );
});