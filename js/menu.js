
document.addEventListener('DOMContentLoaded', async () => {
    // return to main page if no branch id is found 
    if (getWithExpiry('branch') == null){
        window.location.href = "main.html"
        return;
    }
    // activate cart button
    cartButton();

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const isSearching = urlParams.get('search');
    const cart = new Cart(); // Create an instance of Cart
    
    // get branch
    const branch = getWithExpiry('branch')[0];
    const branch_id = branch.id;
    
    const categoryContainer = document.getElementById('category-list');
    if (isSearching == "true"){
        // clear skeleton
        const itemsDiv = document.getElementsByClassName('item_list')[0];
        itemsDiv.innerHTML = "<p class='mt-10 text-[#241E17]'>متن جستجو را وارد کنید</p>";
    }
    
    try{
        // get menus
        if (! getWithExpiry('menu')){
            await fetchAndStoreData('GET', `${base_url}/api/menu/list/${branch_id}`, 'menu', {}, null, 60*15); // expiry = 15 min
        }
        
        // Load categories using existing API
        const menu = getWithExpiry('menu')[0];
        const menu_id = menu.id;
        
        if (! getWithExpiry('category')){
            await fetchAndStoreData('GET', `${base_url}/api/menu/category/list/${menu_id}`, 'category', {}, null, 60*5); // expiry = 5 min
        }

        ///////////////      option 1 : all items load at once but takes time
        if (! getWithExpiry('items')){
            // get items for each category , concatenate them, store 'em
            await fetchAndStoreData('GET', `${base_url}/api/menu/get/${menu_id}`, 'items', {}, null, 60*1); // expiry = 1 min
        }

        fillCategory();

        if (isSearching != "true"){
            fillItems(cart);
        } else {
            categoryContainer.style.display = 'none';
        }

        //////////////      option 2 : load items squentially 
        // if (isSearching != "true"){
        //     // Load categories sequentially like puzzle pieces
        //     await loadCategoriesSequentially(cart);
        // } else {
        //     categoryContainer.style.display = 'none';
        // }

    } catch (error) {
        console.error("Error fetching data:", error);
    }
    
    runImageLoading();
});

// Global variables for infinite scroll
let currentCategoryIndex = 0;
let isLoading = false;
let allCategories = [];
let loadedCategories = new Set();

// New sequential loading function
async function loadCategoriesSequentially(cart) {
    const categories = getWithExpiry('category');
    if (!categories || categories.length === 0) return;
    
    allCategories = categories; // Store for infinite scroll
    const categoryContainer = document.getElementsByClassName('category_list')[0];
    const itemsContainer = document.getElementsByClassName('item_list')[0];
    
    // Clear containers
    categoryContainer.innerHTML = '';
    itemsContainer.innerHTML = '';
    
    // Show initial loading indicator
    itemsContainer.innerHTML = '<div class="flex justify-center items-center h-32"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#665541]"></div></div>';
    
    // Load each category one by one
    for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        
        try {
            // Load items for this category
            const response = await fetch(`${base_url}/api/menu/item/list/${category.id}`);
            const items = await response.json();
            
            // Create and add category button
            const categoryButton = createCategoryElement(category, i);
            categoryContainer.appendChild(categoryButton);
            
            console.log(`category ${category.id} is loaded with ${items.length} items`)
            
            // If this is the first category, load its items immediately
            if (i === 0) {
                // Clear loading indicator
                itemsContainer.innerHTML = '';
            }

            // Add category header and items
            if (items && items.length > 0) {
                const catDiv = createCategoryHeader(category.name, i);
                itemsContainer.appendChild(catDiv);
                loadedCategories.add(category.id);
                
                items.forEach(item => {
                    const imgLink = item.images?.[0] ? changeImageUrl(item.images[0].thumbnail? item.images[0].thumbnail : item.images[0].image): '/images/default_pic.png'
                    const itemDiv = createItemElement(item, imgLink, cart)
                    itemsContainer.appendChild(itemDiv)
                });
            } else {
                itemsContainer.innerHTML = '<p class="mt-10 text-center text-[#665541]">هیچ آیتمی در این دسته بندی یافت نشد</p>';
            }
            
            // Setup infinite scroll for first category
            setupInfiniteScroll(cart);
            
            // Add a small delay to create the puzzle piece effect
            await new Promise(resolve => setTimeout(resolve, 200));
            
        } catch (error) {
            console.error(`Error loading category ${category.name}:`, error);
            // Continue with next category even if one fails
        }
    }
    
    // Final setup
    setTimeout(() => {
        connect_scroll_functionality();
        runImageLoading();
    }, 500);
}

// Function to load items for a specific category (used when clicking category buttons)
async function loadCategoryItems(categoryId, cart, isInfiniteScroll = false) {
    if (isLoading) return;
    isLoading = true;
    
    try {
        const itemsDiv = document.getElementsByClassName('item_list')[0];
        
        // Show loading indicator only for first load
        if (!isInfiniteScroll) {
            itemsDiv.innerHTML = '<div class="flex justify-center items-center h-32"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#665541]"></div></div>';
        }
        
        const response = await fetch(`${base_url}/api/menu/item/list/${categoryId}`);
        const items = await response.json();
        
        if (!isInfiniteScroll) {
            itemsDiv.innerHTML = "";
        }
        
        if (items && items.length > 0) {
            // Create category header
            const category = allCategories.find(cat => cat.id === categoryId);
            if (category && !loadedCategories.has(categoryId)) {
                const catDiv = createCategoryHeader(category.name, currentCategoryIndex);
                itemsDiv.appendChild(catDiv);
                loadedCategories.add(categoryId);
            }
            
            items.forEach(item => {
                const imgLink = item.images?.[0] ? changeImageUrl(item.images[0].thumbnail? item.images[0].thumbnail : item.images[0].image): '/images/default_pic.png'
                const itemDiv = createItemElement(item, imgLink, cart)
                itemsDiv.appendChild(itemDiv)
            });
        } else if (!isInfiniteScroll) {
            itemsDiv.innerHTML = '<p class="mt-10 text-center text-[#665541]">هیچ آیتمی در این دسته بندی یافت نشد</p>';
        }
        
        setTimeout(() => {
            connect_scroll_functionality();
            runImageLoading();
        }, 500);
        
    } catch (error) {
        console.error("Error loading category items:", error);
        if (!isInfiniteScroll) {
            const itemsDiv = document.getElementsByClassName('item_list')[0];
            itemsDiv.innerHTML = '<p class="mt-10 text-center text-red-500">خطا در بارگذاری آیتم‌ها</p>';
        }
    } finally {
        isLoading = false;
    }
}

// Infinite scroll function
async function loadNextCategory(cart) {
    if (isLoading || currentCategoryIndex >= allCategories.length) return;
    
    // Show loading indicator
    const itemsDiv = document.getElementsByClassName('item_list')[0];
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'flex justify-center items-center h-16 my-4';
    loadingDiv.innerHTML = '<div class="animate-spin rounded-full h-6 w-6 border-b-2 border-[#665541]"></div>';
    itemsDiv.appendChild(loadingDiv);
    
    currentCategoryIndex++;
    const nextCategory = allCategories[currentCategoryIndex];
    
    if (nextCategory && !loadedCategories.has(nextCategory.id)) {
        await loadCategoryItems(nextCategory.id, cart, true);
    }
    
    // Remove loading indicator
    itemsDiv.removeChild(loadingDiv);
}

// Intersection Observer for infinite scroll
function setupInfiniteScroll(cart) {
    const itemsDiv = document.getElementsByClassName('item_list')[0];
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isLoading) {
                loadNextCategory(cart);
            }
        });
    }, { threshold: 0.1 });
    
    // Create a sentinel element at the bottom
    const sentinel = document.createElement('div');
    sentinel.id = 'scroll-sentinel';
    sentinel.style.height = '20px';
    itemsDiv.appendChild(sentinel);
    
    observer.observe(sentinel);
}

// New function to search items using existing API
async function searchItemsOptimized(searchTerm, cart) {
    try {
        const itemsDiv = document.getElementsByClassName('item_list')[0];
        itemsDiv.innerHTML = '<div class="flex justify-center items-center h-32"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#665541]"></div></div>';
        
        const restaurant = getWithExpiry('restaurant');
        if (!restaurant) {
            throw new Error('Restaurant not found');
        }
        
        const response = await fetch(`${base_url}/api/menu/item/filter/${restaurant.id}?q=${encodeURIComponent(searchTerm)}`);
        const items = await response.json();
        
        itemsDiv.innerHTML = "";
        
        if (items && items.length > 0) {
            const resultDiv = document.createElement('div');
            resultDiv.className = 'text-xl text-[#665541] w-full my-3 mt-10';
            resultDiv.style.fontWeight = '700';
            resultDiv.dir = 'rtl';
            resultDiv.textContent = 'نتایج';
            itemsDiv.appendChild(resultDiv);
            
            items.forEach(item => {
                const imgLink = item.images?.[0] ? changeImageUrl(item.images[0].thumbnail? item.images[0].thumbnail : item.images[0].image): '/images/default_pic.png'
                const itemDiv = createItemElement(item, imgLink, cart);
                itemsDiv.appendChild(itemDiv);
            });
        } else {
            itemsDiv.innerHTML = '<p class="mt-10 text-center text-[#665541]">موردی یافت نشد</p>';
        }
        
        setTimeout(() => {
            runImageLoading();
        }, 500);
        
    } catch (error) {
        console.error("Error searching items:", error);
        const itemsDiv = document.getElementsByClassName('item_list')[0];
        itemsDiv.innerHTML = '<p class="mt-10 text-center text-red-500">خطا در جستجو</p>';
    }
}


const placeholderImage = 'images/default_pic.png';

function runImageLoading(){
    const lazyImages = document.querySelectorAll('img[data-src]');

    const loadImage = (img) => {
        if (img.getAttribute('data-src')){
            img.src = img.getAttribute('data-src');
            img.removeAttribute('data-src'); // Remove data-src after loading
        }
    };

    const onScroll = () => {
        lazyImages.forEach(img => {
            const rect = img.getBoundingClientRect();
            if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
                loadImage(img);
            }
        });
    };

    // Initial check in case images are already in view
    onScroll();

    // Add scroll event listener
    const itemsDiv = document.getElementsByClassName('item_list')[0];
    itemsDiv.addEventListener('scroll', onScroll);
}



function createCategoryElement(category, idx) {
    const button = document.createElement('button');
    // button.className = "category-button mx-1 flex h-10 w-[95px] flex-shrink-0 items-center justify-around rounded-[16px] px-1 pb-1 text-center text-xs";
    button.className = "category-button mx-1 flex h-10 flex-shrink-0 items-center justify-around rounded-[16px] px-4 pb-1 text-center text-xs text-nowrap border border-white/0 hover:border-[#FFA842]";
    button.id = `category-${idx}`
    button.style.fontSize = '18px';

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
        const menu_items = getWithExpiry('items');
        
        if (! menu_items) { window.location.href = "/menu.html" }

        menu_items.categories.forEach((category, idx) => {
            const catDiv = createCategoryHeader(category.name, idx);
            itemsDiv.appendChild(catDiv)
            
            let items = [];

            if (category.subcategories.length == 0) {
                items = category.items;
            }
            else {
                let sub_items = [];
                for (let i = 0; i < category.subcategories.length; i++) {

                    sub_items = [...sub_items, ...category.subcategories[i].items];
                }
                
                items = [...category.items, ...sub_items];
            }
            
            items.forEach(item=> {
                const imgLink = item.images?.[0] ? changeImageUrl(item.images[0].thumbnail? item.images[0].thumbnail : item.images[0].image): '/images/default_pic.png'
                const itemDiv = createItemElement(item, imgLink, cart)
                itemsDiv.appendChild(itemDiv)
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
            const imgLink = item.images[0] ? changeImageUrl(item.images[0].thumbnail? item.images[0].thumbnail : item.images[0].image): '/images/default_pic.png'
            const itemDiv = createItemElement(item, imgLink, cart);
            itemsDiv.appendChild(itemDiv);
        })
        if (!items.length){
            const p = document.createElement('p');
            p.textContent = "موردی یافت نشد";
            itemsDiv.appendChild(p);
        }
    }
    setTimeout(() => {
        connect_scroll_functionality();
        runImageLoading();
    }, 500);
    
}

function fillCategory(){
    const category_div = document.getElementsByClassName('category_list')[0];
    category_div.innerHTML = '';
    const categories = getWithExpiry('category');
    categories.forEach((category, idx) => {
        const div = createCategoryElement(category, idx);
        category_div.appendChild(div);
    });
}

// create a categoty element for item list
function createCategoryHeader(name, idx){
    const div = document.createElement('div');
    div.className = "mt-10 mb-6 flex w-full items-center justify-center item-section border-dashed rounded-xl py-4 bg-[#FFA842] hover:bg-[#FC9419] duration-150 text-white";
    div.id = `section-${idx}`

    const span = document.createElement('span');
    span.className = "text-xl font-bold ";
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
    img_div.className = "grid grid-cols-7 cursor-pointer";
    img_div.dir = "rtl";
    img_div.addEventListener('click', ()=>{
        setWithExpiry('itemDisplayed', item.id, 5*60);
        window.location.href = "item.html";
    })

    const img_inner_div = document.createElement('div');
    img_inner_div.className = "col-span-3 w-full";

    const img_tag = document.createElement('img');
    img_tag.className = "max-h-40 rounded-[16px] w-full h-auto"
    img_tag.alt = item.name;
    img_tag.setAttribute('data-src', image)
    img_tag.src = placeholderImage;
    // img_tag.src = image;
    // img_tag.loading = "lazy";
    // img_tag.decoding = "async";

    img_inner_div.appendChild(img_tag)
    img_div.appendChild(img_inner_div)
    
    let spaceBelow = 0;
    if (! item.single_word) spaceBelow += 5;
    if (! item.description) spaceBelow += 5;

    const name_description_div = document.createElement('div');
    name_description_div.className = `col-span-4 h-full w-full flex items-center px-3 pb-${spaceBelow}`;   

    const button_holder_div = document.createElement('div');
    button_holder_div.className = `flex flex-col justify-start items-start h-full pt-4`
    const redirect_button = document.createElement('div');
    redirect_button.className = `pb-4`
    
    const h3_name = document.createElement('h3');
    h3_name.className = "text-xl font-bold text-[#665541] py-2";
    h3_name.textContent = convertToPersianNumber(item.name);

    // single word
    const sw_span = document.createElement('span');
    sw_span.className = "line-clamp-2 text-sm text-[#665541] tracking-wide";
    sw_span.textContent = convertToPersianNumber(item.single_word || '');


    const desc_span = document.createElement('span');
    desc_span.className = "line-clamp-2 text-sm text-[#665541] tracking-wide";
    desc_span.textContent = convertToPersianNumber(item.description || '');

    // inventory
    const row1_div3 = document.createElement('div');

    if (item.show_inventory){
        const inventory_text = document.createElement('p');
        const inventory_value = document.createElement('span');
        inventory_text.className = "text-sm";
        inventory_value.className = "text-sm text-[#665541]";

        row1_div3.className = "mt-3 flex w-full items-center justify-between";
        
        inventory_text.textContent = "موجودی: ";
        inventory_value.textContent = item.inventory == 0 ? "اتمام موجودی" : `${item.inventory}`
        
        if (item.inventory == 0) {
            inventory_value.style.color ="#eb2762";
        }

        inventory_text.appendChild(inventory_value);
        row1_div3.appendChild(inventory_text);
    }

    redirect_button.appendChild(h3_name);
    button_holder_div.appendChild(redirect_button);
    button_holder_div.appendChild(sw_span);
    button_holder_div.appendChild(desc_span);
    button_holder_div.appendChild(row1_div3);
    
    name_description_div.appendChild(button_holder_div);
    img_div.appendChild(name_description_div);

    // row 2
    const row2_div1 = document.createElement('div');
    row2_div1.className = "mt-3 flex w-full items-center justify-between";

    // item buy button
    if ((item.options.length && item.own_price_visible) || !item.options.length){
        const price_span = document.createElement('span');
        price_span.className = "text-xl font-bold text-[#665541]";
        price_span.textContent = convertToPersianPrice(item.price);
    
        const row2_div2 = document.createElement('div');
        const cart_button = itemCartButton(item, cart)
    
        row2_div2.appendChild(cart_button);
        row2_div1.appendChild(row2_div2);
        row2_div1.appendChild(price_span);
    }
    
    

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
                            <span class="text-lg font-bold">${convertToPersianPrice(option.price)}</span>
                            <span class="text-sm- font-normal h-4 line-clamp-1">${option.desription || ''}</span>
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
            button.className = "flex h-8 w-14 items-center justify-center rounded-[12px] bg-[#018FCC] disabled:bg-[#a5cddf] disabled:text-[#696969]";
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
            
            if (item.show_inventory && item.inventory == 0) {
                button.disabled = true;
            }

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
                if (item.show_inventory){
                    if (option==null){
                        if (item.inventory <= cart.itemQty(item)){
                            return showModal('انتخاب بیش از حد مجاز نیست', 5000);
                        }
                    }
                    else {
                        if (item.inventory <= cart.optionQty(item, option)){
                            return showModal('انتخاب بیش از حد مجاز نیست', 5000);
                        }
                    }
                }
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

        const button = document.getElementById(`category-${sectionId.split('-')[1]}`);
        button.scrollIntoView({ behavior: 'smooth', inline: 'center' }); // Center the button in view
    }

    // Add click event listeners to category buttons
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sectionId = `section-${button.id.split('-')[1]}`; // Get corresponding section ID
            disableObserver();
            
            scrollToSection(sectionId);
            setActiveButton(button);
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
                    const currentButtonId = `category-${entry.target.id.split('-')[1]}`;
                    // Only activate the button if it's not the same as the last active one
                    if (lastActiveButtonId !== currentButtonId) {
                        const button = document.getElementById(currentButtonId);
                        setActiveButton(button);

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