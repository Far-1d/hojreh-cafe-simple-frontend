document.addEventListener('DOMContentLoaded', async () => {
    const customer = getWithExpiry('customer');
    if (! customer){
        window.location.href = "login.html";
        return;
    }

    const address = getWithExpiry('updateAddress');
    if (address) {
        const street = document.getElementById('street');
        const alley = document.getElementById('alley');
        const number = document.getElementById('number');
        const unit = document.getElementById('unit');
        const name = document.getElementById('name');

        street.value = address.street;
        alley.value = address.alley;
        number.value = address.number;
        unit.value = address.unit;
        name.value = address.name;
    }
    connectActionButtons(address, customer);
});



function connectActionButtons(address, customer){
    const return_btn = document.getElementsByClassName('return-button')[0];
    return_btn.addEventListener('click', ()=>{
        window.location.href = "send.html";
        return;
    })

    const forward_btn = document.getElementsByClassName('forward-button')[0];

    forward_btn.addEventListener('click', async ()=>{ 
        const street = document.getElementById('street').value.trim();
        const alley = document.getElementById('alley').value.trim();
        const number = document.getElementById('number').value.trim();
        const unit = document.getElementById('unit').value.trim();
        const name = document.getElementById('name').value.trim();
        
        if (street === "" || alley === "" || number === "" || unit === "" || name === "") {
            showError("لطفا تمام فیلد ها را پر کنید");
             return;
        }
        const form = new FormData();
        form.append('street', street);
        form.append('alley', alley);
        form.append('number', number);
        form.append('unit', unit);
        form.append('name', name);
        

        const headers = {
            'authorization': `bearer ${customer.id}`
        }
        if(address){
            const response = await fetchAndStoreData('PUT', `${base_url}/api/customer/address/update/${address.id}`, '', headers, form);
            if (response){
                showSuccess('آدرس آپدیت شد');
                window.location.href = "send.html";
            }
        } else {
            const response = await fetchAndStoreData('POST', `${base_url}/api/customer/address/create`, '', headers, form);
            if (response){
                showSuccess('آدرس ساخته شد');
                window.location.href = "send.html";
            }
        }
    })

}



window.addEventListener('message', function(event) {
    document.getElementById('location').value = `${event.data.lat} , ${event.data.lng}`
})
