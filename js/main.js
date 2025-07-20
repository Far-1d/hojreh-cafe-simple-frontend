
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
        
        const allow_overtime = branch.overtime_orders;

        if (! allow_overtime){
            const is_overtime = compare_time();
            // if (is_overtime){
            //     showModal("کافه الان بسته شده س", 6000)
            // }
        }
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
    img.src = (item.images && item.images.length > 0) ?
        changeImageUrl(item.images[0].thumbnail ? item.images[0].thumbnail : item.images[0].image) :
        '/images/default_pic.png';
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
    // // best_seller items
    // const best_seller_title = document.getElementsByClassName("best_seller")[0];
    // best_seller_title.textContent = "پر فروش های "+restaurant.name;

    // // menu button
    // const menu = document.getElementsByClassName("restaurant_menu")[0];
    // menu.textContent = 'منو '+ restaurant.name;

    // branch address
    const address_p = document.getElementsByClassName("address")[0];
    address_p.textContent = branch.location;

    // branch phone numbers
    const phone_number = document.getElementsByClassName("phone_number")[0];
    phone_number.textContent =  convertToPersianNumber(branch.phone);
    phone_number.href = `tel:${branch.phone}`
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
        div.className = "flex justify-between items-center py-2 border-b border-[#2CA7DB]/10 last:border-b-0"

        const p1 = document.createElement('span'); 
        p1.className = "text-[#665541] font-medium"
        p1.textContent = ` ${hour.title}`

        const p2 = document.createElement('span'); 
        p2.className = "text-[#665541] font-bold"
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

function compare_time(){
    const now = new Date();
    const currentDay = now.getDay(); // 0 (Sun) to 6 (Sat)
    const currentTime = now.toTimeString().slice(0, 8); // "HH:MM"
    
    const schedule = getWithExpiry('hour');

    let flag = false;

    schedule.forEach(hour => {
        if (hour.title == "هر روز" && currentDay != 5){
            if(currentTime < hour.start_time || currentTime > hour.end_time) flag = true;
        
        } else if (hour.title == "جمعه" && currentDay == 5) {
            if(currentTime < hour.start_time || currentTime > hour.end_time) flag = true;
        }
    });

    return flag;
}