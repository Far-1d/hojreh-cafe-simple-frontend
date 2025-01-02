document.addEventListener('DOMContentLoaded', async () => {
    const customer = getWithExpiry('customer');
    const restaurant = getWithExpiry('restaurant');
    
    if (! restaurant){
        window.location.href = "main.html";
        return;
    }

    if (! customer){
        console.log("there is no customer")

        window.location.href = "login.html";
        return;
    }
    
    let order = Order.loadFromLocalStorage() || new Order();

    try {
        const headers = {
            'authorization' : `bearer ${customer.id}`,
        }
        await fetchAndStoreData('GET', `${base_url}/api/customer/address/list`, 'addresses', headers);
        
        const restaurant_id = restaurant.id;
        await fetchAndStoreData('GET', `${base_url}/api/order/deliver/list?restaurant=${restaurant_id}`, 'deliverTimes', {});
        
        fillAddresses(order);
        createTime(order);
        loadPrice();
        connectActionButtons(order);
    } catch (error) {
        showError('مشکل در اتصال به سرور');  
    }
});

function fillAddresses(order){
    const list = document.getElementsByClassName('address-list')[0];
    const addresses = getWithExpiry('addresses');
    if(addresses.length){
        addresses.forEach((address, idx) => {
            const div = createAddress(address, order);
            list.appendChild(div);
        });
    }
    list.appendChild(createNewButton());

}

function createAddress(address, order){
    const mainDiv = document.createElement('div');
    const innerDiv = document.createElement('div');
    const p_tag = document.createElement('p');
    const span = document.createElement('span');
    const button = document.createElement('button');

    mainDiv.className = "flex items-center justify-between h-20 px-4 py-2 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.4)] rounded-[16px] hover:border border-[#4FB9E6]";
    innerDiv.className = "flex-col items-center justify-start";
    p_tag.className = "text-sm text-[#665541] font-bold";
    span.className = "text-xs text-[#665541]";
    button.className = "text-sm underline text-[#665541]";

    // mainDiv.dataset.uuid = address.id;
    innerDiv.dir = "rtl";
    button.style.fontWeight = 700;

    p_tag.textContent = address.name;
    span.textContent = address.detail;
    button.textContent = "ویرایش";

    innerDiv.appendChild(p_tag);
    innerDiv.appendChild(span);
    mainDiv.appendChild(innerDiv);
    mainDiv.appendChild(button);

    button.addEventListener('click', ()=>{
        setWithExpiry('updateAddress', address, 60*5);
        window.location.href="address.html?return=send";
    })

    mainDiv.addEventListener('click', function (){
        const list = document.getElementsByClassName('address-list')[0];
        const divs = list.querySelectorAll('div');

        divs.forEach(div =>{
            div.classList.remove('selected');
        })

        mainDiv.classList.add('selected');
        // const address_id = mainDiv.dataset.uuid;
        order.updateAddress(address.id);        
    })

    if (order.address == address.id){
        mainDiv.classList.add('selected');
    }
    return mainDiv;
}

function createNewButton(){
    const mainDiv = document.createElement('div');
    const button = document.createElement('button');

    mainDiv.className = "flex items-center justify-between h-12 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.4)] rounded-[16px] hover:border border-[#4FB9E6]";
    button.className = "w-full h-full text-sm";
    button.id = "new-address";
    button.textContent = "آدرس جدید";

    mainDiv.appendChild(button);
    
    button.addEventListener('click', ()=>{
        localStorage.removeItem('updateAddress');
        window.location.href="address.html?return=send";
    })

    return mainDiv;
}

function createTime(order){
    const listDiv = document.getElementsByClassName('deliver-time')[0]; 
    const times = getWithExpiry('deliverTimes');
    times.forEach(time=>{
        const div = createTimeElement(time, order);
        listDiv.appendChild(div);
    })
}

function createTimeElement(time, order){
    const mainDiv = document.createElement('div');
    const button = document.createElement('button');
    mainDiv.className = "my-3 h-full w-full";
    button.className = "time w-full h-12 rounded-[16px] bg-[#FFF6E8] text- text-[#241E17] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.4)]";
    button.textContent = time.name;
    button.dataset.uuid = time.id;
    tippy(button, {content:`${time.time}<br>${time.description}`});
    
    button.addEventListener('click', function (){
        const listDiv = document.getElementsByClassName('deliver-time')[0];
        const times = listDiv.querySelectorAll('.time');
        times.forEach(time=>{
            time.classList.remove('selected-time');
        })
        button.classList.add('selected-time');

        order.updateDeliveryTime(button.dataset.uuid);
    })

    if (order.deliveryTime == time.id){
        button.classList.add('selected-time');
    }

    mainDiv.appendChild(button);
    return mainDiv;
}



function connectActionButtons(order){
    const returnBtn = document.getElementsByClassName('return-button')[0];
    returnBtn.addEventListener('click', ()=>{
        window.location.href = "delivery.html";
        return;
    });

    const forwardBtn = document.getElementsByClassName('forward-button')[0];
    forwardBtn.addEventListener('click', async ()=>{
        forwardBtn.textContent = "درحال پردازش";
        const cart = new Cart();
        const customer = getWithExpiry('customer');

        if (order.isComplete()){
            const body = order.createBody(cart)
            const headers = {
                'authorization': `bearer ${customer.id}`,
            }
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
        } else {
            showError('لطفا اطلاعات ارسال را تکمیل کنید');
        }

        forwardBtn.textContent = "پرداخت";
    });


}


function loadPrice(){
    const cart = new Cart();
    let total = cart.getTotalPrice();
    let net = total;
    
    const totalSpan = document.getElementsByClassName('price-toman')[0];
    const netSpan = document.getElementsByClassName('price-net')[0];
    totalSpan.textContent = convertToPersianPrice(total);
    totalSpan.style.textDecoration = "none";
    netSpan.textContent = "";
    
    try{
        const discountInfo = getWithExpiry('discount');
        
        if (discountInfo != null) {
            let priceDiscount = total * discountInfo.percent/100;
            if (discountInfo.max_discount > 0 && priceDiscount > discountInfo.max_discount){
                priceDiscount = discountInfo.max_discount;
            }

            net = total - priceDiscount;
            netSpan.textContent = convertToPersianPrice(net);   
            totalSpan.style.textDecoration = "line-through";
        }
    } catch {
        // do nothing
    }

}