document.addEventListener('DOMContentLoaded', async () => {
    const customer = getWithExpiry('customer');
    if(! customer){
        showError('لطفا ابتدا وارد سایت شوید');
        setTimeout(() => {
            window.location.href = "login.html?next=delivery";
        }, 3000);
    }
    const cart = new Cart();
    if (! cart.items){
        window.location.href = "menu.html";
    }

    connectActionButton(cart);
});


function connectActionButton(cart){
    const order = Order.loadFromLocalStorage() || new Order();

    const button = document.getElementsByClassName('action-button')[0];
    const note = document.getElementById('note');
    button.addEventListener('click', async ()=>{
        order.refresh();
        order.updateCustomerNote(note.value);

        if(order.deliveryType=="takeout"){
            window.location.href = "send.html";
        } else if (order.deliveryType == "dine-in"){
            const customer = getWithExpiry('customer');
            
            // without payment code

            // const body = order.createBody(cart)
            // const headers = {
            //     'authorization': `bearer ${customer.id}`,
            // }
            // const response = await fetchAndStoreData('POST', `${base_url}/api/order/create`, 'orderCreated', headers, body);
            // console.log(response);
            // if (response.id){
                // window.location.href = "status.html?status=OK&state=1008";
            // }

            // with payment code
            const body = order.createBody(cart)
            const headers = {
                'authorization': `bearer ${customer.id}`,
            }
            try {
                const response = await fetchAndStoreData('POST', `${base_url}/api/order/create`, 'orderCreated', headers, body);
                if (response.id){
                    const form = new FormData();
                    form.append('order', response.id);
                    const newResponse = await fetchAndStoreData('POST', `${base_url}/api/payment/new?gateway=zarinpal`, 'payment', headers, form);
                    if (newResponse.payment){
                        const returnUrl = `${front_url}/status.html`;
                        window.location.href = `${base_url}/api/payment/pay/zarinpal?payment=${newResponse.payment}&return=${returnUrl}`
                    }
                } else {
                    console.log(getWithExpiry('error'));
                    forwardBtn.textContent = "پرداخت";
                    showError('مشکل در اتصال به سرور');
                    return;
                }
            } catch (error) {
                showError('خطا اجرای برنامه')
            }

        } else {
            showError('لطفا نوع دریافت را انتخاب کنید');
        }
    })

    if (order.deliveryType == "takeout") toggleButton('button1');
    else if (order.deliveryType == "dine-in") toggleButton('button2');

    if (order.customerNote != '') note.textContent = order.customerNote;
}



function toggleButton(buttonId) {
    var button1 = document.getElementById('takeout');
    var button2 = document.getElementById('dine-in');
    
    const order = Order.loadFromLocalStorage() || new Order();
    order.updateDeliveryType('')
    
    if (buttonId === 'button1') {
        // Toggle Button 1
        button1.classList.toggle('selected');
        // If Button 1 is selected, deselect Button 2
        if (button1.classList.contains('selected')) {
            button2.classList.remove('selected');
            order.updateDeliveryType('takeout');
        }
    } else if (buttonId === 'button2') {
        // Toggle Button 2
        button2.classList.toggle('selected');
        // If Button 2 is selected, deselect Button 1
        if (button2.classList.contains('selected')) {
            button1.classList.remove('selected');
            order.updateDeliveryType('dine-in')
        }
    }
}