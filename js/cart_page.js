document.addEventListener('DOMContentLoaded', async () => {
    // return to main page if no branch id is fonud 
    if (getWithExpiry('branch') == null){
        window.location.href = "main.html"
        return;
    }
    
    const cart = new Cart(); // Create an instance of Cart

    try{
        fillItems(cart);
    } catch (error) {
        console.error("Error fetching data:", error);
    }

    forwardButton(cart);
    returnButton();
});



function fillItems(cart){
    const itemsDiv = document.getElementsByClassName('item-list')[0];
    itemsDiv.innerHTML = "";

    const items = cart.getItems();

    items.forEach(item=> {
        // check item.images length
        const imgLink = changeImageUrl(item.images[0].thumbnail? item.images[0].thumbnail : item.images[0].image)
        const itemDiv = createItemElement(item, imgLink, cart)
        itemsDiv.appendChild(itemDiv)
    })
    updatePrice(cart);
}


function changeImageUrl(img){
    return `${base_url}${img}`
}


function createItemElement(item, image, cart){
    const mainDiv = document.createElement('div');
    mainDiv.className = "mt-4 flex h-fit w-full flex-col items-start justify-between rounded-[16px] bg-[#FFF6E8] p-3 px-4 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.4)]";
    mainDiv.dir = "rtl";
    
    // row 1
    const img_div = document.createElement('div');
    img_div.className = "grid grid-cols-7";
    img_div.dir = "rtl";

    const img_inner_div = document.createElement('div');
    img_inner_div.className = "col-span-3 w-full";

    const img_tag = document.createElement('img');
    img_tag.className = "max-h-40 rounded-[16px]"
    img_tag.alt = item.name;
    img_tag.src = image;
    img_tag.loading = "lazy";
    img_tag.decoding = "async";

    img_inner_div.appendChild(img_tag)
    img_div.appendChild(img_inner_div)
    
    let spaceBelow = 0;
    if (! single_words[item.single_word]) spaceBelow += 5;
    if (! item.description) spaceBelow += 5;

    const name_description_div = document.createElement('div');
    name_description_div.className = `col-span-4 h-full w-full flex items-center px-3 pb-${spaceBelow}`;   

    const button_holder_div = document.createElement('div');
    button_holder_div.className = `flex flex-col justify-center items-start h-full`
    const redirect_button = document.createElement('button');
    redirect_button.addEventListener('click', ()=>{
        setWithExpiry('itemDisplayed', item.id, 5*60);
        window.location.href = "item.html";
    })

    const h3_name = document.createElement('h3');
    h3_name.className = "text-xl font-bold text-[#665541] py-2";
    h3_name.textContent = item.name;

    // single word
    const sw_span = document.createElement('span');
    sw_span.className = "line-clamp-2 text-sm font-normal text-[#665541]";
    sw_span.textContent = single_words[item.single_word];


    const desc_span = document.createElement('span');
    desc_span.className = "line-clamp-2 text-sm font-normal text-[#665541]";
    desc_span.textContent = item.description;

    redirect_button.appendChild(h3_name);
    button_holder_div.appendChild(redirect_button);
    button_holder_div.appendChild(sw_span);
    button_holder_div.appendChild(desc_span);
    
    name_description_div.appendChild(button_holder_div);
    img_div.appendChild(name_description_div);

    // row 2
    const row2_div1 = document.createElement('div');
    row2_div1.className = "mt-3 flex w-full items-center justify-between";

    const price_span = document.createElement('span');
    price_span.className = "text-xl font-bold text-[#665541]";
    price_span.textContent = convertToPersianPrice(item.price);

    const row2_div2 = document.createElement('div');
    const cart_button = itemCartButton(item, cart)

    row2_div2.appendChild(cart_button);
    row2_div1.appendChild(row2_div2);
    row2_div1.appendChild(price_span);

    
    mainDiv.appendChild(img_div);
    mainDiv.appendChild(row2_div1);
    if (item.options){
        const row_3 = createItemOptionRow(item, cart);
        mainDiv.appendChild(row_3);
    }

    return mainDiv;
}


function createItemOptionRow(item, cart){
    // <!-- row 3 -->
    const mainDiv = document.createElement('div')
    mainDiv.className = 'mt-1 flex h-full w-full flex-col items-start justify-center bg-transparent p-1'

    item.options.forEach((option, idx) =>{
        const element = createItemOptionElement(option, item, cart, idx === item.options.length-1 ? true:false);
        mainDiv.appendChild(element);
    })

    return mainDiv;
}

function createItemOptionElement(option, item, cart, is_last){
    {/* option 1  */}
    const mainDiv = document.createElement('div')
    mainDiv.className = `flex w-full items-center ${is_last ?'':'border-b-[0.2px] border-[#018fcc2c]'} p-3 pb-10`
    
    const nameDiv = document.createElement('div');
    nameDiv.innerHTML = `<div class="flex w-full flex-col items-start space-y-2 text-base font-bold text-[#241E17]">
                            <h3>${option.name}</h3>
                            <span class="text-sm font-bold">${convertToPersianPrice(option.price)}</span>
                            <span class="text-sm font-normal h-4 line-clamp-1">${option.desription || ''}</span>
                        </div>`
    const btnDiv = document.createElement('div');
    btnDiv.className='flex h-full w-full items-center justify-end'
    
    const button = itemCartButton(item, cart, option);
    btnDiv.appendChild(button);

    mainDiv.appendChild(nameDiv);
    mainDiv.appendChild(btnDiv);
    return mainDiv;
}


function itemCartButton(item, cart, option=null) {
    const buttonContainer = document.createElement('div'); // Create a container for the button
    const updateButtonState = () => {
        // Clear previous content
        buttonContainer.innerHTML = '';

        if (!cart.isInCart(item, option)) {
            // Create "Add to Cart" button
            const button = document.createElement('button');
            button.className = "flex h-8 w-14 items-center justify-center rounded-[12px] bg-[#018FCC]";
            button.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 13V19" stroke="#FFF9F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M15 16L9 16" stroke="#FFF9F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M8.06891 22H15.9313C17.7726 22 19.3761 20.7429 19.8156 18.9548L21.7821 10.9548C22.4017 8.43408 20.4935 6 17.8977 6H6.10238C3.5066 6 1.59838 8.4341 2.21802 10.9548L4.18455 18.9548C4.6241 20.743 6.22756 22 8.06891 22Z" stroke="#FFF9F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M3 10H21" stroke="#FFF9F0" stroke-width="1.5" stroke-linecap="round" />
                    <path d="M8.99976 2L5.99976 6" stroke="#FFF9F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M14.9998 2L17.9998 6" stroke="#FFF9F0" stroke-width="1.5" stroke-linecap="round" />
                </svg>
            `;
            button.addEventListener('click', () => {
                const type = option==null?'item':'option';
                cart.addItem(item, type, option);
                updateButtonState(); // Update button state after adding
                updatePrice(cart);
            });
            buttonContainer.appendChild(button);
        } else {
            // Create quantity control buttons
            const div = document.createElement('div');
            const plus = document.createElement('button');
            const minus = document.createElement('button');
            const qtySpan = document.createElement('span');

            div.className = "item-center flex w-24 justify-center gap-1 rounded-[12px] bg-[#2CA7DB] text-white";
            plus.className = "flex h-8 w-8 items-center justify-center text-white";
            minus.className = "flex h-8 w-8 items-center justify-center text-white";
            qtySpan.className = "pt-1 text-base font-bold";

            plus.innerHTML = `<img src='/images/plus.svg' alt="plus icon"/>`;
            minus.innerHTML = `<img src='/images/minus.svg' alt="minus icon"/>`;

            const type = option==null?'item':'option';

            plus.addEventListener('click', () => {
                cart.addItem(item, type, option);
                qtySpan.textContent = convertToPersianPrice(option==null? cart.itemQty(item): cart.optionQty(item, option)); // Update quantity display
                updatePrice(cart);
            });

            minus.addEventListener('click', () => {     // there is a bug in reduceItem (i think it is there)
                // when there are two options and at first both has qty, then when one is reduced to 0
                // the item is removed
                cart.reduceItem(item, type, option);
                qtySpan.textContent = convertToPersianPrice(option==null? cart.itemQty(item): cart.optionQty(item, option)); // Update quantity display
                if (option != null){
                    if (cart.optionQty(item, option) === 0) {
                        updateButtonState(); // Update to "Add to Cart" if quantity is zero
                        
                        if (cart.itemQty(item) === 0) {
                            fillItems(cart);
                        }
                    }
                } else {
                    if (cart.itemQty(item) === 0) {
                        updateButtonState(); // Update to "Add to Cart" if quantity is zero
                        fillItems(cart);
                    }
                }

                updatePrice(cart);
                forwardButton(cart);
            });

            qtySpan.textContent = convertToPersianPrice(option==null? cart.itemQty(item): cart.optionQty(item, option));

            div.appendChild(plus);
            div.appendChild(qtySpan);
            div.appendChild(minus);
            
            buttonContainer.appendChild(div);
        }
    };

    updateButtonState(); // Initial call to set up the button state
    return buttonContainer; // Return the container with the appropriate button(s)
}


function updatePrice(cart){
    const total = convertToPersianPrice(cart.getTotalPrice());
    const priceSpan = document.getElementsByClassName('price-toman')[0];
    priceSpan.textContent = `${total} تومان`;
}


function forwardButton(cart){
    const button = document.getElementsByClassName('forward-button')[0];
    if (cart.getItems().length){
        button.removeAttribute('disabled');
        button.addEventListener('click', ()=>{
            window.location.href = "login.html?next=delivery";
        })
    } else {
        button.setAttribute('disabled', '');
    }
};

function returnButton(){
    const button = document.getElementsByClassName('return-button')[0];
    button.addEventListener('click', ()=>{
        window.location.href = "menu.html";
    })
};