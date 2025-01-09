document.addEventListener('DOMContentLoaded', ()=>{
    
})




function showSearch(){
    const container = document.getElementById('nav-container');
    container.innerHTML = '';
    container.innerHTML = `
        <div class="flex gap-2 w-full">
          <div class="flex h-[56px] w-full items-center justify-between rounded-[16px] border border-neutral-700 bg-white px-3">
            <button id="searchBtn" onclick="searchItems()">
                <svg class="w-6 h-6" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="200px" width="200px" xmlns="http://www.w3.org/2000/svg">
                    <path fill="none" stroke-miterlimit="10" stroke-width="32" d="M221.09 64a157.09 157.09 0 1 0 157.09 157.09A157.1 157.1 0 0 0 221.09 64z"></path><path fill="none" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32" d="M338.29 338.29 448 448"></path>
                </svg>    
            </button>

            <input type="text" name="item" id="item" placeholder="نام آیتم" class="h-full w-full p-1 focus:outline-none" dir="rtl" />
          </div>

          <button class="menu-btn flex h-14 w-16 items-center justify-center rounded-[16px] bg-[#018FCC] text-center text-white duration-300 hover:translate-x-1" onclick="exitSearch()">
                <svg class="w-6 h-6 stroke-white" stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="200px" width="200px" xmlns="http://www.w3.org/2000/svg">
                    <path fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="48" d="m184 112 144 144-144 144"></path>
                </svg>          
            </button>
        </div>
    `;
}

async function searchItems(){
    const item_name = document.getElementById('item').value;
    
    if (item_name.length < 2) {
        showError('حداقل دو حرف را وارد کنید');
        return;
    }
    const btn = document.getElementById('searchBtn');
    btn.disabled = true;

    try {
        const restaurant = getWithExpiry('restaurant');
        await fetchAndStoreData('GET', `${base_url}/api/menu/item/filter/${restaurant.id}?q=${item_name}`, 'searchedItems', {});
    } catch (error) {
        console.log(error)
        showError('خطا اتصال به سرور');
        btn.disabled = false;
        return;    
    }
    
    // fill items
    const categoryContainer = document.getElementById('category-list');
    categoryContainer.style.display = 'none';
    
    const cart = new Cart();
    fillItems(cart, isFromSearch=true);
    btn.disabled = false;
}

function exitSearch(){
    const container = document.getElementById('nav-container');
    container.innerHTML = '';
    container.innerHTML = `
        <nav class="flex h-[56px] w-full items-center justify-between rounded-[16px] bg-[#FFF6E8] px-3 overflow-visible shadow-[0_2px_8px_-2px_rgba(0,0,0,0.4)]">
            <button class="flex w-10 items-center justify-center" onclick=showSearch()>
                <img src="/images/search.png" alt="search-bar" class="h-8 w-8" loading="eager" decoding="async"/>
            </button>

            <button class="flex w-16 items-center justify-center overflow-visible" onclick=goToHome()>
                <img src="/images/logo.png" alt="logo" class="w-[95px] logo" loading="eager" decoding="async"/>
            </button>

            <button class="menu-btn flex w-10 items-center justify-center" onclick=toggleMenu()>
                <div class="h-8 w-8">
                    <img src="/images/menu.svg" alt="menu" class="h-8 w-8" loading="eager" decoding="async"/>
                </div>
                </button>
        </nav>
    `;

    const categoryContainer = document.getElementById('category-list');
    categoryContainer.style.display = 'block';

    const cart = new Cart();
    fillItems(cart);
}




