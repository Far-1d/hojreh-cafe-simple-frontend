document.addEventListener('DOMContentLoaded', async () => {
    const restaurant = getWithExpiry('restaurant');
    if (! restaurant){
        try {
            await fetchAndStoreData('GET', `${base_url}/api/restaurant/get/${restaurant_name}`, 'restaurant', {});
            await fetchAndStoreData('GET', `${base_url}/api/restaurant/branch/list/${restaurant_name}`, 'branch', {});
            await fetchAndStoreData('GET', base_url+`/api/restaurant/social_media/list/${restaurant_id}`, 'social', {});
        } catch (error) {
            showError('خطا اتصال به سرور');
            return;
        }
    }

    fillAboutUs();
});



const fillAboutUs = ()=>{
    // get elements
    const restauName = document.getElementById('restaurant-name');
    const restauDesc = document.getElementById('restaurant-description');
    const branchphone = document.getElementById('branch-phone');
    const branchAddr = document.getElementById('branch-address');

    const instagramA = document.getElementById('instagram');
    const telegramA = document.getElementById('telegram');
    const xA = document.getElementById('x');
    const whatsappA = document.getElementById('whatsapp');

    // get data
    const restaurant = getWithExpiry('restaurant');
    const branch = getWithExpiry('branch')[0];
    const social = getWithExpiry('social');

    // fill elements
    restauName.textContent = restaurant.name;
    restauDesc.textContent = restaurant.description;
    branchphone.textContent = branch.phone;
    branchphone.href = `tel:${branch.phone}`;
    branchAddr.textContent = branch.location;

    instagramA.href = social.instagram;
    telegramA.href = social.telegram;
    xA.href = social.twitter;
    whatsappA.href = social.whatsapp;
}