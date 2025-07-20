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
        const location = document.getElementById('location');
        const iframe = document.getElementById('map-iframe'); 

        detail.value = address.detail;
        name.value = address.name;

        if (address.location){
            location.value = `${address.location.latitude} , ${address.location.longitude}`;

            iframe.addEventListener('load', () => {
                iframe.contentWindow.postMessage(
                    { 
                        type: "update_map",
                        data: address.location 
                    }, 
                    "*"
                );
            })
        }
    }
    connectActionButtons(address, customer);
});

const jsonify_location = (latLngString) => {
    const [lat, lng] = latLngString.replace(/\s/g, '').split(',');
    
    // Convert to numbers and construct JSON
    return {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng)
    };
}


function connectActionButtons(address, customer){
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const returnUrl = urlParams.get('return');

    const return_btn = document.getElementsByClassName('return-button')[0];
    return_btn.addEventListener('click', ()=>{
        if (returnUrl == "profile"){
            window.location.href = "profile.html";
        } else if (returnUrl == "send"){
            window.location.href = "send.html";
        }
        return;
    })

    const forward_btn = document.getElementsByClassName('forward-button')[0];

    forward_btn.addEventListener('click', async (e)=>{
        e.target.disabled=true; 
        const detail = document.getElementById('detail').value.trim();
        const name = document.getElementById('name').value.trim();
        const loc = document.getElementById('location').value.trim();
        
        if (name === "") {
            showError("لطفا فیلد اسم را پر کنید");
            e.target.disabled = false; 
            return;
        }
        const form = {
            detail: detail,
            name: name,
            location: jsonify_location(loc)  // Ensure this returns a JSON-serializable object
        };
        

        const headers = {
            'authorization': `bearer ${customer.id}`,
            'Content-Type': 'application/json',
        }
        
        if(address){
            const response = await fetchAndStoreData('PUT', `${base_url}/api/customer/address/update/${address.id}`, '', headers, JSON.stringify(form));
            if (response){
                showSuccess('آدرس آپدیت شد');
                if (returnUrl == "profile"){
                    window.location.href = "profile.html";
                } else if (returnUrl == "send"){
                    window.location.href = "send.html";
                }
            }
        } else {
            const response = await fetchAndStoreData('POST', `${base_url}/api/customer/address/create`, '', headers, JSON.stringify(form));
            if (response){
                showSuccess('آدرس ساخته شد');
                if (returnUrl == "profile"){
                    window.location.href = "profile.html";
                } else if (returnUrl == "send"){
                    window.location.href = "send.html";
                }            
            }
        }
        e.target.disabled = false;
    })

}


// map related event
window.addEventListener('message', function(event) {
    document.getElementById('location').value = `${event.data.lat} , ${event.data.lng}`
})