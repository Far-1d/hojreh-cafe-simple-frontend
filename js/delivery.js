document.addEventListener('DOMContentLoaded', async () => {

    connectActionButton();
});


function connectActionButton(){
    const order = Order.loadFromLocalStorage() || new Order();
    const cart = new Cart(); 
    
    const button = document.getElementsByClassName('action-button')[0];
    const note = document.getElementById('note');
    button.addEventListener('click', async ()=>{
        order.refresh();
        if(order.deliveryType=="takeout"){
            order.updateCustomerNote(note.value);
            window.location.href = "send.html";
        } else if (order.deliveryType == "dine-in"){
            order.updateCustomerNote(note.value);
            const customer = getWithExpiry('customer');
            if (customer){
                const body = order.createBody(cart)
                const headers = {
                    'authorization': `bearer ${customer.id}`,
                }
                const response = await fetchAndStoreData('POST', `${base_url}/api/order/create`, 'orderCreated', headers, body);
                console.log(response);
                if (response.id){
                }
                window.location.href = "status.html?status=OK&state=1008";
            } else {
                showError('لطفا ابتدا وارد سایت شوید');
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 3000);
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