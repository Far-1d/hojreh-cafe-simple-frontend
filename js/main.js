
document.addEventListener('DOMContentLoaded', async () => {
    const restaurant_name = "حجره";
    const best_seller_count = "6";
    
    try{
        await fetchAndStoreData('GET', `${base_url}/api/restaurant/get/${restaurant_name}`, 'restaurant', {}, null, 60*60*24);
        await fetchAndStoreData('GET', `${base_url}/api/restaurant/branch/list/${restaurant_name}`, 'branch', {}, null, 60*60*24);

        const restaurant = getWithExpiry('restaurant');
        const restaurant_id = restaurant.id;

        const branch = getWithExpiry('branch')[0];
        const branch_id = branch.id;
        fillContact(restaurant, branch);

        await fetchAndStoreData('GET', base_url+`/api/restaurant/hour/list/${branch_id}`, 'hour', {}, null, 60*60*24);
        await fetchAndStoreData('GET', base_url+`/api/restaurant/social_media/list/${restaurant_id}`, 'social', {}, null, 60*60*24);

        fillWorkHour();
        fillSocialMedia(restaurant);

        await fetchAndStoreData('GET', `${base_url}/api/menu/item/best?restaurant=${restaurant_id}&size=${best_seller_count}`, 'best_sellers', {}, null, 60*60*24);
        fillBestSeller();
    
    } catch (error) {
        console.log("cought an error: ",error);
    }
});


function fillBestSeller(){
    const best_seller_div = document.getElementsByClassName('best_seller_items')[0];
    best_seller_div.innerHTML = '';
    const items = getWithExpiry('best_sellers');
    items.forEach(item =>{
        const div = createBestSellerItem(item);
        best_seller_div.appendChild(div);
    })

}

function createBestSellerItem(item){
    const mainDiv = document.createElement('div');
    const button = document.createElement('button');
    const innerDiv = document.createElement('div');
    const img = document.createElement('img');
    const p = document.createElement('p');

    mainDiv.className = "item-center flex shrink-0 w-28 justify-center";
    button.className = "item-center w-full flex-col justify-center";
    innerDiv.className = "flex w-full justify-center";
    img.className = "h-20 w-20 rounded-[16px]";
    p.className = "w-full text-base font-bold";

    p.textContent = convertToPersianNumber(item.name)
    img.src = changeImageUrl(item.images[0].thumbnail? item.images[0].thumbnail : item.images[0].image)
    img.alt = `${item.name} image`;
    img.loading = "lazy";
    img.decoding = "async";

    button.addEventListener('click', ()=>{
        setWithExpiry('itemDisplayed', item.id, 60);
        window.location.href = "item.html";

    })

    innerDiv.appendChild(img);
    button.appendChild(innerDiv);
    button.appendChild(innerDiv);
    button.appendChild(p);
    mainDiv.appendChild(button);

    return mainDiv;
}

function changeImageUrl(img){
    return `${base_url}${img}`
}


function fillContact(restaurant, branch){
    // best_seller items
    const best_seller_title = document.getElementsByClassName("best_seller")[0];
    best_seller_title.textContent = "پر فروش های "+restaurant.name;

    // menu button
    const menu = document.getElementsByClassName("restaurant_menu")[0];
    menu.textContent = 'منو '+ restaurant.name;

    // about us button text
    const about_us = document.getElementsByClassName("about_us_text")[0];
    about_us.textContent = 'درباره '+ restaurant.name;

    // branch address
    const address_p = document.getElementsByClassName("address")[0];
    address_p.textContent = branch.location;

    // branch phone numbers
    const phone_number = document.getElementsByClassName("phone_number")[0];
    phone_number.textContent =  convertToPersianNumber(branch.phone);
}

function fillWorkHour(){
    const parsedData = getWithExpiry('hour');

    if (!Array.isArray(parsedData)) {
        console.error('No valid hour data found in local storage.');
        return; // Exit the function if there's no valid data
    }

    // branch address
    const workingHourContainer = document.getElementsByClassName("working_hours")[0];

    
    parsedData.forEach(hour => {
        const div = document.createElement('div');
        div.className = "flex items-center justify-between w-full h-full"

        const p1 = document.createElement('p'); 
        p1.className = "my-2 font-normal text-sm shrink-0 line-clamp-1 text-neutral-900"
        p1.textContent = ` ${hour.title}`

        const p2 = document.createElement('p'); 
        p2.className = "my-2 font-bold text-sm w-full line-clamp-1 text-neutral-900 text-left"
        p2.textContent = `${ convertToPersianNumber(formatTime(hour.start_time))} الی ${convertToPersianNumber(formatTime(hour.end_time))}`
        
        div.appendChild(p1);
        div.appendChild(p2);
        workingHourContainer.appendChild(div); 
    });

}

function fillSocialMedia(restaurant){
    const parsedData = getWithExpiry('social');
    
    // about us button text
    const instagram_text = document.getElementsByClassName("instagram_text")[0];
    instagram_text.textContent = 'اینستاگرام '+ restaurant.name;
    
    const instagram = document.getElementsByClassName("instagram_button")[0]
    instagram.addEventListener("click", ()=>{
        window.location.href = parsedData.instagram;
    })

}

