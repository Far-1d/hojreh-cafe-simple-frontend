document.addEventListener('DOMContentLoaded', ()=>{
    if (!getWithExpiry('restaurant')){
        window.location.href = "main.html";
        return;
    }
    
    const cart = new Cart();
    if (getWithExpiry('customer')){
        if (cart.getItems()){ // there are items in cart
            window.location.href = "delivery.html";
        } else {
            window.location.href = "loggedin.html";
            return;
        }
    }


    const button = document.getElementsByClassName('action-button')[0];
    button.addEventListener('click', listenInputs)

});


async function listenInputs(event){
    const button = document.getElementsByClassName('action-button')[0];
    button.setAttribute('disabled', 'true');

    const phoneInput = document.getElementById('phone');
    if (phoneInput.value.length == 11 && phoneInput.value.startsWith('09') && isOnlyNumbers(phoneInput.value)){
        const headers = {}
        const form = new FormData();
        form.append('phone_number', phoneInput.value);
        form.append('restaurant', getWithExpiry('restaurant').id);

        try{
            const response = await fetchAndStoreData('POST', `${base_url}/api/customer/signup`, 'customer', headers, form)

            const phone = response.phone_number;
            setTimeout(() => {
                createCodeInput();
            }, 2000);
            showSuccess('کد ورود به شماره شما ارسال شد');
        } catch (error) {
            showError(`${error.message}`)
            button.textContent = "تایید";
            button.removeAttribute('disabled');
        }
    } else {
        showError('فرمت شماره تلفن اشتباه است')
        button.textContent = "تایید";
        button.removeAttribute('disabled');
    }
}


function isOnlyNumbers(input) {
    // Regular expression to check if the input consists only of digits (0-9)
    const regex = /^\d+$/; 
    return regex.test(input); // Returns true if input matches the regex, false otherwise
}

function createCodeInput(){
    const h2 = document.createElement('h2');
    h2.className = "w-full py-2 text-xl text-[#665541]"
    h2.style.fontWeight = 700;
    h2.dir = "rtl"
    h2.textContent = "کد ارسال شده را وارد کنید"

    const input_field = document.createElement('input')
    input_field.type = "text"
    input_field.name = "code"
    input_field.id = "code"
    input_field.className = "h-14 min-w-full rounded-[16px] border border-[#241E17] bg-[#FFFDFA] px-3"

    const div = document.getElementsByClassName('login-form')[0];
    div.appendChild(h2);
    div.appendChild(input_field);

    const button = document.getElementsByClassName('action-button')[0];
    button.removeEventListener('click', listenInputs);
    button.addEventListener('click', sendCode);

    button.textContent = "تایید";
    button.removeAttribute('disabled');
}


async function sendCode(){
    const phoneInput = document.getElementById('phone');
    const codeInput = document.getElementById('code');
    if (! codeInput.value.length) {
        showError('لطفا کد را وارد کنید');
        return
    }
    if (phoneInput.value.length == 11 && phoneInput.value.startsWith('09') && isOnlyNumbers(phoneInput.value)){
        const headers = {}
        const form = new FormData();
        form.append('phone_number', phoneInput.value);
        form.append('code', codeInput.value);

        try{
            const response = await fetchAndStoreData('POST', `${base_url}/api/customer/verify`, 'customer', headers, form);
            const id = response.id;
            setWithExpiry('customer', response, 60*60*12);

            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            const next = urlParams.get('next');
            
            if (next == "profile"){
                window.location.href = "profile.html";
            } else if (next == "delivery"){
                window.location.href = "delivery.html";
            } else if (next == "history"){
                window.location.href = "order-history.html";
            } else {
                window.location.href = "menu.html";
            }

            return;
        } catch (error) {
            showError(`کد وارد شده اشتباه است`)
        }
    } else {
        showError('فرمت شماره تلفن اشتباه است.')
    }

}
