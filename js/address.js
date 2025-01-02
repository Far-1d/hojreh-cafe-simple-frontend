document.addEventListener('DOMContentLoaded', async () => {
    const customer = getWithExpiry('customer');
    if (! customer){
        window.location.href = "login.html";
        return;
    }

    const address = getWithExpiry('updateAddress');
    if (address) {
        const detail = document.getElementById('detail');
        const name = document.getElementById('name');

        detail.value = address.detail;
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

    forward_btn.addEventListener('click', async (e)=>{
        e.target.disabled=true; 
        const detail = document.getElementById('detail').value.trim();
        const name = document.getElementById('name').value.trim();
        
        if (name === "") {
            showError("لطفا فیلد اسم را پر کنید");
            e.target.disabled = false; 
            return;
        }
        const form = new FormData();
        form.append('detail', detail);
        form.append('name', name);
        

        const headers = {
            'authorization': `bearer ${customer.id}`
        }
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const returnUrl = urlParams.get('return');
        console.log(returnUrl);
        if(address){
            const response = await fetchAndStoreData('PUT', `${base_url}/api/customer/address/update/${address.id}`, '', headers, form);
            if (response){
                showSuccess('آدرس آپدیت شد');
                if (returnUrl == "profile"){
                    window.location.href = "profile.html";
                } else if (returnUrl == "send"){
                    window.location.href = "send.html";
                }
            }
        } else {
            const response = await fetchAndStoreData('POST', `${base_url}/api/customer/address/create`, '', headers, form);
            if (response){
                showSuccess('آدرس ساخته شد');
                if (returnUrl == "profile"){
                    window.location.href = "profile.html";
                } else if (returnUrl == "send"){
                    window.location.href = "send.html";
                }            }
        }
        e.target.disabled = false;
    })

}


// map related event
// window.addEventListener('message', function(event) {
//     document.getElementById('location').value = `${event.data.lat} , ${event.data.lng}`
// })
