document.addEventListener('DOMContentLoaded', async ()=>{
    const customer = getWithExpiry('customer');
    const branch = getWithExpiry('branch');

    if (! branch){
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
        await fetchAndStoreData('GET', `${base_url}/api/order/list/${branch[0].id}?state=${7}`, 'history', headers);
        
        fillHistory();

    } catch (error) {
        console.log(error)
        showError('مشکل در اتصال به سرور');  
    }

});


function fillHistory(){
    try {
        const history = getWithExpiry('history');
    
        const container = document.getElementById('history-container');
        container.innerHTML = ``;
        if (history.length){
            history.forEach((order, idx) => {
                const div = createHistoryElement(order, idx);
                container.appendChild(div);
            });
        } else {
            container.innerHTML = '<p class="w-full text-center text-[#241E17]">سفارشی یافت نشد</p>'
        }

        connect_reorder_btns(history);
    } catch (error) {
        console.log(error);
    }
}


function createHistoryElement(order, idx){
    const mainDiv = document.createElement('div');
    mainDiv.className = 'shadow-sm';

    let element = `<div class="text-card-foreground border-cafe-blue/20 bg-cafe-cream/50 w-full rounded-lg border shadow-sm transition-shadow duration-200 hover:shadow-lg">
            <div class="flex flex-col space-y-1.5 p-6 pb-3">
              <div class="flex items-start justify-between">
                <h3 class="text-cafe-blue text-lg font-semibold tracking-tight">سفارش #${idx+1}</h3>

                <div class="flex items-center gap-2">
                    ${create_order_delivery(order)}
                    ${create_order_status(order)}
                </div>
              </div>
              <div dir="rtl" class="text-sm text-gray-600">${create_jdate(order)}</div>
            </div>
            <div class="space-y-4 p-6 pt-0">
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div class="space-y-3">
                  <div class="flex items-center gap-2 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-phone text-cafe-blue h-4 w-4"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    <span class="font-medium"> تلفن: </span>
                    <span> ${order.customer?.phone_number} </span>
                  </div>

                  <div class="flex items-start gap-2 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin text-cafe-blue mt-0.5 h-4 w-4">
                      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <div>
                      <span class="font-medium"> آدرس: </span>
                      <div class="text-gray-600">${order?.address?.detail}</div>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock text-cafe-blue h-4 w-4">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span class="font-medium"> زمان تحویل: </span>
                    <span> ${order.deliver_time?.name} </span>
                  </div>
                </div>

                <div class="space-y-3">
                  <div class="flex items-center gap-2 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-dollar-sign text-cafe-blue h-4 w-4">
                      <line x1="12" x2="12" y1="2" y2="22"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                    <span class="font-medium"> جمع کل: </span>
                    <span> ${convertToPersianPrice(order.total_cost)} تومان </span>
                    ${create_order_discount(order)}
                  </div>

                  <div class="flex items-center gap-2 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-dollar-sign text-cafe-blue h-4 w-4">
                      <line x1="12" x2="12" y1="2" y2="22"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                    <span class="font-medium"> خالص پرداختی: </span>
                    <span class="text-cafe-blue font-semibold"> ${convertToPersianPrice(order?.net_cost)} تومان </span>
                  </div>

                  <div class="flex items-start gap-2 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text text-cafe-blue mt-0.5 h-4 w-4">
                      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                      <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                      <path d="M10 9H8"></path>
                      <path d="M16 13H8"></path>
                      <path d="M16 17H8"></path>
                    </svg>
                    <div class="min-w-0 flex-1">
                      <span class="font-medium"> توضیحات: </span>
                      <div class="mt-1 break-words text-gray-600 italic">${order.note}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="border-cafe-blue/20 border-t pt-4">
                <div class="mb-3 flex items-center justify-between gap-2">
                  <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-utensils text-cafe-blue h-4 w-4">
                      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
                      <path d="M7 2v20"></path>
                      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
                    </svg>
                    <span class="text-sm font-medium"> ایتم ها: </span>
                  </div>
                  <button data-cart="${order.id}" class="re-order-btn text-sm bg-blue-100 border border-blue-300 rounded-full transition-colors text-blue-800 px-2">سفارش مجدد</button>
                </div>

                <!-- order items -->
                <div class="space-y-2">
                  
                  ${create_order_cart(order)}

                </div>
              </div>
            </div>
          </div>`
    
        mainDiv.innerHTML = element;
    return mainDiv;
}

const create_jdate = (order)=>{
  let time = convertToPersianNumber(order.created_jalali.slice(0,8));
  let date = convertToPersianNumber(order.created_jalali.slice(9, 19));
  return `${time}  	&nbsp; 	&nbsp; 	&nbsp; ${date}`;

}

const create_order_discount = (order)=> {
    let element  = '';
    if (order.total_cost != order.net_cost){
        element = `<span class="text-green-600" dir="ltr"> (᠆${Math.round((order.total_cost-order.net_cost)*100/order.total_cost)}%) </span>`
    }

    return element;
}

const create_order_status = (order)=> {
    let element = '';

    if (order.status == "prep"){
        element = `<div class="focus:ring-ring hover:bg-primary/80 inline-flex items-center rounded-full border border-yellow-200 bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800 transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none">آماده سازی</div>`
    }
    else if (order.status == "send"){
        element = `<div class="focus:ring-ring hover:bg-primary/80 inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none">در حال ارسال</div>`
    }
    else {
        element = `<div class="focus:ring-ring hover:bg-primary/80 inline-flex items-center rounded-full border border-green-200 bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none">تحویل داده شده</div>`
    }

    return element;
}


const create_order_delivery = (order)=> {
    let element = '';

    if (order.delivery == "takeoutP" || order.delivery == "takeoutN"){
        element = `<div class="focus:ring-ring hover:bg-primary/80 inline-flex items-center rounded-full border border-purple-200 bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800 transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none">بیرون بر</div>`
    } else {
        element = `<div class="focus:ring-ring hover:bg-primary/80 inline-flex items-center rounded-full border border-pink-200 bg-pink-100 px-2.5 py-0.5 text-xs font-semibold text-pink-800 transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none">حضوری</div>`
    }

    return element; 
}


const create_order_cart = (order)=> {
    let result = '';

    order.items.forEach(item => {
        let name, price, quantity;

        if (item.item){
            name = item.item.name;
            price = convertToPersianPrice(item.item.price);
            quantity = item.quantity;
        } else if (item.item_option){
            name = item.item_option.name;
            price = convertToPersianPrice(item.item_option.price);
            quantity = item.quantity;
        }

        let element = `
            <div class="border-cafe-blue/10 hover:border-cafe-blue/30 flex items-center justify-between rounded-lg border bg-white p-3 transition-colors">
                <div class="flex-1">
                <a href="#" class="hover:text-cafe-blue cursor-pointer text-left text-sm font-medium transition-colors"> ${name} </a>
                </div>
                <div class="flex items-center gap-3">
                  <div class="focus:ring-ring text-foreground bg-cafe-cream border-cafe-blue/30 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none">${quantity}×</div>
                  <div class="text-cafe-blue min-w-[60px] text-right text-sm font-semibold">${price} تومان</div>
                </div>
            </div>    
        `;
        
        result += element;
    });

    
    return result;
}


const connect_reorder_btns = (orders)=>{
  const buttons = document.querySelectorAll('button.re-order-btn');
  const cart = new Cart();

  buttons.forEach(button =>{
    button.addEventListener('click', ()=>{
      let order_id = button.getAttribute('data-cart');
      
      let order = orders.filter(order=> order.id == order_id)[0];
      
      order.items.forEach(async (item) =>{
        let url = `${base_url}/api/menu/item/get/${item.item.id}`

        const response = await fetch(url);

        const actual_item = await response.json();

        for (let i = 0; i < item.quantity; i++) {          
          cart.addItem(actual_item, 'item', null);
        }

        showModal("ایتم ها به سبد خرید شما اضافه شدن", 5000)
      })
    })
  })
}


function showModal(message, autoCloseTime = 3000) {
  const modal = document.getElementById('modal');
  const modalMessage = document.getElementById('modalMessage');
  const closeBtn = document.getElementById('closeBtn');

  modalMessage.textContent = message;
  modal.style.display = 'flex'; // Show modal

  function closeModal() {
    modal.style.display = 'none'; // Hide modal
    closeBtn.removeEventListener('click', closeModal);
    clearTimeout(autoCloseTimeout);
  }

  closeBtn.addEventListener('click', closeModal);

  const autoCloseTimeout = setTimeout(closeModal, autoCloseTime);
}

