document.addEventListener('DOMContentLoaded', async ()=>{
    const customer = getWithExpiry('customer');
    const restaurant = getWithExpiry('restaurant');
    if (! restaurant){
        window.location.href = "main.html";
        return;
    }
    
    if (! customer){
        window.location.href = "login.html?next=history";
        return;
    }

    try {
        const headers = {
            'authorization' : `bearer ${customer.id}`,
        }
        await fetchAndStoreData('GET', `${base_url}/api/order/list/${restaurant.id}?state=${7}`, 'history', headers);
        
        fillHistory();

    } catch (error) {
        showError('مشکل در اتصال به سرور');  
    }

});


function fillHistory(){
    const history = getWithExpiry('history');

    const container = document.getElementById('history-container');
    container.innerHTML = ``;

    history.forEach(order => {
        const div = createHistoryElement(order);
        container.appendChild(div);
    });
}


function createHistoryElement(order){
    const mainDiv = document.createElement('div');
    mainDiv.className = "scale-90 sm:scale-100 rounded-[16px] bg-[#FFF6E8] px-3 py-3 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.4)]";
    
    const orderDiv      = createOrderIdDiv(order);
    const priceDiv      = createOrderPriceDiv(order);
    const stateDiv      = createOrderStateDiv(order);
    const addressDiv    = createOrderAddressDiv(order);
    const deliveryDiv   = createOrderDeliveryDiv(order);
    const timeDiv       = createOrderDeliverTimeDiv(order);
    const noteDiv       = createOrderNoteDiv(order);
    const dateDiv       = createOrderDateTimeDiv(order);
    const cartDiv       = createOrderCartDiv(order);

    mainDiv.appendChild(orderDiv);
    mainDiv.appendChild(priceDiv);
    mainDiv.appendChild(stateDiv);
    mainDiv.appendChild(addressDiv);
    mainDiv.appendChild(deliveryDiv);
    mainDiv.appendChild(timeDiv);
    mainDiv.appendChild(noteDiv);
    mainDiv.appendChild(dateDiv);
    mainDiv.appendChild(cartDiv);

    return mainDiv;
}


const createOrderIdDiv = (order)=> {
    const mainDiv = document.createElement('div');
    mainDiv.className = "flex w-full justify-start gap-6";
    const p = document.createElement('p');
    p.className = "py-1 w-20";
    p.textContent = "سفارش:";
    const span = document.createElement('span');
    span.className = "font-light py-2 text-xs w-72";
    span.textContent = order.id;

    mainDiv.appendChild(p);
    mainDiv.appendChild(span);
    return mainDiv;
}

const createOrderPriceDiv = (order)=> {
    const mainDiv = document.createElement('div');
    mainDiv.className = "flex w-full justify-start gap-6";
    const p = document.createElement('p');
    p.className = "py-1 w-20";
    p.textContent = "جمع کل:";
    const span = document.createElement('span');
    span.className = "font-light py-2 text-sm w-72";
    span.textContent = convertToPersianPrice(order.total_cost);

    mainDiv.appendChild(p);
    mainDiv.appendChild(span);
    return mainDiv;
}

const createOrderStateDiv = (order)=> {
    const mainDiv = document.createElement('div');
    mainDiv.className = "flex w-full justify-start gap-6";
    const p = document.createElement('p');
    p.className = "py-1 w-20";
    p.textContent = "وضعیت:";
    const span = document.createElement('span');
    span.className = "font-light py-2 text-sm w-72";

    let state = order.status == "prep" ?'در حال آماده سازی' : order.status == "send"? 'در حال ارسال':'تحویل داده شده'
    span.textContent = state;

    mainDiv.appendChild(p);
    mainDiv.appendChild(span);
    return mainDiv;
}

const createOrderAddressDiv = (order)=> {
    const mainDiv = document.createElement('div');
    mainDiv.className = "flex w-full justify-start gap-6";
    const p = document.createElement('p');
    p.className = "py-1 w-20";
    p.textContent = "آدرس:";
    const span = document.createElement('span');
    span.className = "font-light py-2 text-sm flex flex-col w-72";
    
    const titleSpan = document.createElement('span');
    const detailSpan = document.createElement('span');
    titleSpan.className = "font-semibold";
    titleSpan.textContent = order.address.name;
    detailSpan.textContent = order.address.detail;

    span.appendChild(titleSpan);
    span.appendChild(detailSpan);

    mainDiv.appendChild(p);
    mainDiv.appendChild(span);
    return mainDiv;
}

const createOrderDeliveryDiv = (order)=> {
    const mainDiv = document.createElement('div');
    mainDiv.className = "flex w-full justify-start gap-6";
    const p = document.createElement('p');
    p.className = "py-1 w-20";
    p.textContent = "تحویل:";
    const span = document.createElement('span');
    span.className = "font-light py-2 text-sm";
    span.textContent = order.delivery == "takeout"? 'ارسالی' : 'حضوری';

    mainDiv.appendChild(p);
    mainDiv.appendChild(span);
    return mainDiv;
}

const createOrderDeliverTimeDiv = (order)=> {
    const mainDiv = document.createElement('div');
    mainDiv.className = "flex w-full justify-start gap-6";
    const p = document.createElement('p');
    p.className = "py-1 w-20";
    p.textContent = "زمان ارسال:";
    const span = document.createElement('span');
    span.className = "font-light py-2 text-sm flex flex-col";
    
    const nameSpan = document.createElement('span');
    const descriptionSpan = document.createElement('span');
    nameSpan.className = "font-semibold";
    nameSpan.textContent = order.deliver_time.name;
    descriptionSpan.textContent = order.deliver_time.description;

    span.appendChild(nameSpan);
    span.appendChild(descriptionSpan);

    mainDiv.appendChild(p);
    mainDiv.appendChild(span);
    return mainDiv;
}

const createOrderNoteDiv = (order)=> {
    const mainDiv = document.createElement('div');
    mainDiv.className = "flex w-full justify-start gap-6";
    const p = document.createElement('p');
    p.className = "py-1 w-20";
    p.textContent = "توضیحات:";
    const span = document.createElement('span');
    span.className = "font-light py-2 text-sm w-72";
    span.textContent = order.note || '-';

    mainDiv.appendChild(p);
    mainDiv.appendChild(span);
    return mainDiv;
}

const createOrderDateTimeDiv = (order)=> {
    const mainDiv = document.createElement('div');
    mainDiv.className = "flex w-full justify-start gap-6";
    const p = document.createElement('p');
    p.className = "py-1 w-20";
    p.textContent = "تاریخ:";
    const span = document.createElement('span');
    span.className = "font-light py-2 text-sm";
    span.textContent = order.created_jalali;

    mainDiv.appendChild(p);
    mainDiv.appendChild(span);
    return mainDiv;
}

const createOrderCartDiv = (order)=> {
    const mainDiv = document.createElement('div');
    mainDiv.className = "flex w-full justify-start gap-6";
    const p = document.createElement('p');
    p.className = "py-1 shrink-0";
    p.textContent = "سبد خرید:";

    const table = document.createElement('table');
    table.className = "w-full text-xs sm:text-sm";
    
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    const tdName = document.createElement('td');
    const tdPrice = document.createElement('td');
    const trQty = document.createElement('td');
    tdName.textContent = "نام";
    tdPrice.textContent = "قیمت";
    trQty.textContent = "تعداد";
    trHead.appendChild(tdName);
    trHead.appendChild(tdPrice);
    trHead.appendChild(trQty);
    thead.appendChild(trHead);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    tbody.className = "px-3";

    order.items.forEach(item => {
        const tr = document.createElement('tr');
        const td1 = document.createElement('td');
        const td2 = document.createElement('td');
        const td3 = document.createElement('td');
        td1.className = "max-w-28 line-clamp-1";
        if (item.item){
            td1.textContent = item.item.name;
            td2.textContent = item.item.price;
            td3.textContent = item.quantity;
        } else if (item.item_option){
            td1.textContent = item.item_option.name;
            td2.textContent = item.item_option.price;
            td3.textContent = item.quantity;
        }
        
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);

    mainDiv.appendChild(p);
    mainDiv.appendChild(table);
    return mainDiv;
}
