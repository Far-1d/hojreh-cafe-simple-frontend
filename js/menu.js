
document.addEventListener('DOMContentLoaded', async () => {
    // return to main page if no branch id is fonud 
    if (getWithExpiry('branch') == null){
        window.location.href = "main.html"
        return;
    }

    const cart = new Cart(); // Create an instance of Cart

    // get menus
    const branch = getWithExpiry('branch')[0];
    const branch_id = branch.id;
    
    try{
        if (! getWithExpiry('menu')){
            await fetchAndStoreData('GET', `${base_url}/api/menu/list/${branch_id}`, 'menu', {});
        }
        
        if (! getWithExpiry('category')){
            // get categories
            const menu = getWithExpiry('menu')[0];
            const menu_id = menu.id;
            await fetchAndStoreData('GET', `${base_url}/api/menu/category/list/${menu_id}`, 'category', {});
        }
        
        if (! getWithExpiry('items')){
            // get items for each category , concatenate them, store 'em
            const categories = getWithExpiry('category');
            let items = [];

            // Use Promise.all to wait for all fetch requests
            const itemFetchPromises = categories.map(async (category) => {
                const category_id = category.id;
                await fetchAndStoreData('GET', `${base_url}/api/menu/item/list/${category_id}`, 'cat_items', {});
                const catItems = getWithExpiry('cat_items') || [];
                return catItems; // Return items for this category
            });

            // Wait for all item fetches to complete
            const fetchedItemsArrays = await Promise.all(itemFetchPromises);
            
            // Flatten the array of arrays into a single array
            fetchedItemsArrays.forEach(catItems => {
                items = items.concat(catItems);
            });

            setWithExpiry("items", items, 10*60);
        }
        fillCategory();
        fillItems(cart);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
    connect_scroll_functionality();
    cartButton();
});


function fillCategory(){
    const category_div = document.getElementsByClassName('category_list')[0];
    category_div.innerHTML = '';
    const categories = getWithExpiry('category');
    categories.forEach((category, idx) => {
        const div = createCategoryElement(category, idx);
        category_div.appendChild(div);
    });
}


function createCategoryElement(category, idx) {
    const button = document.createElement('button');
    button.className = "category-button mx-1 flex h-10 w-[95px] flex-shrink-0 items-center justify-around rounded-[16px] px-1 pb-1 text-center text-xs";
    button.id = `category-${idx}`

    const span = document.createElement('span');
    span.className = "text-[#665541]";
    span.style.fontWeight = "700"; // Use style property directly
    span.textContent = category.name;
    
    button.appendChild(span);

    if (category.icon) {
        const img = document.createElement('img');
        img.src = `${base_url}${category.icon}`;
        img.className = "w-6 h-6";
        button.appendChild(img);
    }

    return button;
}


function fillItems(cart, isFromSearch=false){
    const itemsDiv = document.getElementsByClassName('item_list')[0];
    itemsDiv.innerHTML = "";
    if (!isFromSearch){
        const categories = getWithExpiry('category');
        const items = getWithExpiry('items');
        
        categories.forEach((category, idx) => {
            const catDiv = createCategoryHeader(category.name, idx);
            itemsDiv.appendChild(catDiv)
            items.forEach(item=> {
                if (item.category.id === category.id){
                    // check item.images length
                    const imgLink = item.images[0] ? changeImageUrl(item.images[0].thumbnail? item.images[0].thumbnail : item.images[0].image): '/images/default_item.webp'
                    const itemDiv = createItemElement(item, imgLink, cart)
                    itemsDiv.appendChild(itemDiv)
                }
            })
        });
    } else {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'text-xl text-[#665541] w-full my-3 mt-10';
        resultDiv.style.fontWeight = '700';
        resultDiv.dir = 'rtl';
        resultDiv.textContent = 'نتایج';
        itemsDiv.appendChild(resultDiv);

        const items = getWithExpiry('searchedItems');
        items.forEach((item,idx) =>{
            const imgLink = item.images[0] ? changeImageUrl(item.images[0].thumbnail? item.images[0].thumbnail : item.images[0].image): '/images/default_item.webp'
            const itemDiv = createItemElement(item, imgLink, cart);
            itemsDiv.appendChild(itemDiv);
        })
    }

}

// create a categoty element for item list
function createCategoryHeader(name, idx){
    const div = document.createElement('div');
    div.className = "mt-10 mb-6 flex w-full items-center justify-end item-section";
    div.id = `section-${idx}`

    const span = document.createElement('span');
    span.className = "text-xl font-bold text-[#665541]";
    span.textContent = name;

    div.appendChild(span)
    
    return div
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
            });

            minus.addEventListener('click', () => {
                cart.reduceItem(item, type, option);
                qtySpan.textContent = convertToPersianPrice(option==null? cart.itemQty(item): cart.optionQty(item, option)); // Update quantity display
                if (option != null){
                    if (cart.optionQty(item, option) === 0) {
                        updateButtonState(); // Update to "Add to Cart" if quantity is zero
                    }
                } else {
                    if (cart.itemQty(item) === 0) {
                        updateButtonState(); // Update to "Add to Cart" if quantity is zero
                    }
                }
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



function cartButton(){
    const button = document.getElementsByClassName('cart-button')[0];
    button.addEventListener('mouseleave', ()=>{
        const svg = button.querySelector('svg');
        svg.innerHTML = `<path d="M2.58683 10H21.4132M18.0351 6L5.96486 6C3.45403 6 1.57594 8.32624 2.08312 10.808L3.71804 18.808C4.09787 20.6666 5.71942 22 7.59978 22H16.4002C18.2806 22 19.9021 20.6666 20.282 18.808L21.9169 10.808C22.4241 8.32624 20.546 6 18.0351 6Z" stroke="#FFF9F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M9 2L6 6" stroke="#FFF9F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M15 2L18 6" stroke="#FFF9F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M9 14L9 18" stroke="#FFF9F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M15 14L15 18" stroke="#FFF9F0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`
    });
    button.addEventListener('mouseenter', ()=>{
        const svg = button.querySelector('svg');
        svg.innerHTML = `<path fill-rule="evenodd" clip-rule="evenodd" d="M18.1896 6.00295L15.6 2.55004C15.3514 2.21867 14.8813 2.15152 14.55 2.40004C14.2186 2.64857 14.1514 3.11867 14.4 3.45004L16.3124 6H7.68749L9.59996 3.45004C9.84848 3.11867 9.78133 2.64857 9.44996 2.40004C9.11859 2.15152 8.64848 2.21867 8.39996 2.55004L5.81028 6.00295C3.91171 6.07556 2.40389 7.481 2.06934 9.25H21.9305C21.5959 7.48103 20.0882 6.07561 18.1896 6.00295ZM20.2819 18.808C19.902 20.6666 18.2805 22 16.4001 22H7.59969C5.71933 22 4.09778 20.6666 3.71795 18.808L2.08303 10.808C2.07908 10.7887 2.07527 10.7693 2.07161 10.75H21.9282C21.9245 10.7693 21.9207 10.7887 21.9168 10.808L20.2819 18.808ZM8.99976 13.25C9.41397 13.25 9.74976 13.5858 9.74976 14L9.74976 18C9.74976 18.4142 9.41397 18.75 8.99976 18.75C8.58554 18.75 8.24976 18.4142 8.24976 18L8.24976 14C8.24976 13.5858 8.58554 13.25 8.99976 13.25ZM15.7498 14C15.7498 13.5858 15.414 13.25 14.9998 13.25C14.5855 13.25 14.2498 13.5858 14.2498 14V18C14.2498 18.4142 14.5855 18.75 14.9998 18.75C15.414 18.75 15.7498 18.4142 15.7498 18V14Z" fill="#FFF9F0"/>`
    });

    button.addEventListener('click', ()=>{
        window.location.href = "cart.html";
    })
}






function connect_scroll_functionality(){
    // Get all category buttons
    const categoryButtons = document.querySelectorAll('.category-button');

    let lastActiveButtonId = null; // Track the last active button ID
    let observer; // Declare observer variable

    // Function to scroll to the corresponding section
    function scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        section.scrollIntoView({ behavior: 'smooth' });

        const button = document.getElementById(`category-${sectionId.charAt(sectionId.length - 1)}`);
        button.scrollIntoView({ behavior: 'smooth', inline: 'center' }); // Center the button in view
    }

    // Add click event listeners to category buttons
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sectionId = `section-${button.id.charAt(button.id.length - 1)}`; // Get corresponding section ID
            disableObserver();
            
            scrollToSection(sectionId);
            setActiveButton(button);
            setActiveSubElements(button);
            lastActiveButtonId = button.id;

            setTimeout(() => {
                enableObserver();
            }, 1500);
        });
    });

    // Function to set active button style
    function setActiveButton(activeButton) {
        categoryButtons.forEach(button => {
            button.classList.remove('active-cat');
            const img = button.querySelector('img');
            const span = button.querySelector('span');

            // Remove active-sub class from span and img
            if (span) span.className = 'text-[#665541]' ;
            if (img) img.classList.remove('active-img');
        });
        activeButton.classList.add('active-cat');
    }

    // Function to set active-sub class on span and img
    function setActiveSubElements(activeButton) {
        const span = activeButton.querySelector('span');
        const img = activeButton.querySelector('img');
        
        if (span) span.className = 'active-span';
        if (img) img.classList.add('active-img');
    }

    // Initialize the Intersection Observer
    function initObserver() {
        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const currentButtonId = `category-${entry.target.id.charAt(entry.target.id.length - 1)}`;
                    // Only activate the button if it's not the same as the last active one
                    if (lastActiveButtonId !== currentButtonId) {
                        const button = document.getElementById(currentButtonId);
                        setActiveButton(button);
                        setActiveSubElements(button);

                        button.scrollIntoView({ behavior: 'smooth', inline: 'center' });
                        lastActiveButtonId = currentButtonId; // Update last active button ID
                    }
                }
            });
        }, { threshold: 0.7 });

        document.querySelectorAll('.item-section').forEach(section => {
            observer.observe(section);
        });
    }

    function disableObserver() {
        if (observer) {
            observer.disconnect(); // Disconnect the observer to stop tracking
        }
    }

    function enableObserver() {
        initObserver(); // Re-initialize and enable the observer
    }

    initObserver(); // Initial call to set up the observer

}