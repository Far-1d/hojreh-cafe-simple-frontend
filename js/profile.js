document.addEventListener('DOMContentLoaded', async ()=>{
    const customer = getWithExpiry('customer');
    const restaurant = getWithExpiry('restaurant');
    if (! restaurant){
        window.location.href = "main.html";
        return;
    }
    
    if (! customer){
        window.location.href = "login.html?next=profile";
        return;
    }

    try {
        const headers = {
            'authorization' : `bearer ${customer.id}`,
        }
        await fetchAndStoreData('GET', `${base_url}/api/customer/address/list`, 'addresses', headers);

        await fetchAndStoreData('GET', `${base_url}/api/customer/get/${customer.id}`, 'profile', headers);
        
        fillAddresses();
        fillProfile();
    } catch (error) {
        showError('مشکل در اتصال به سرور');  
    }
    
    const nameEditBtn = document.getElementById('name-edit');
    nameEditBtn.addEventListener('click', ()=>{ToggleEdit('name')})

});


function fillProfile(){
    const profile = getWithExpiry('profile');
    const name = document.getElementById('name-value');
    const phone = document.getElementById('phone-value');
    name.textContent = profile.name;
    phone.textContent = profile.phone_number;
}


function ToggleEdit(section){
    const Container = document.getElementById(`${section}-container`);
    const nameValue = document.getElementById(`${section}-value`);
    const input = document.createElement('input');
    input.className = "h-14 w-full rounded-[24px] border border-black px-2 pb-1 text-[#241E17]";
    input.type = "text";
    input.name = section;
    input.value = nameValue.textContent;
    input.dir = "rtl";
    input.id = section;
    
    const actionBtn = document.getElementsByClassName('action-button')[0];
    actionBtn.hidden = false;
    actionBtn.addEventListener('click', ()=>{updateProfile(section)})

    Container.innerHTML = ''
    Container.appendChild(input);
}

async function updateProfile(section){
    const customer = getWithExpiry('customer');

    const form = new FormData();
    form.append(section, document.getElementById(section).value);
    
    const url = `${base_url}/api/customer/update/${customer.id}`;
    
    const options = {
        method: 'PUT', // Set the HTTP method (GET or POST)
        headers: {},
        body: form
    };
    const response = await fetch(url, options);
    if (response.ok){
        const Container = document.getElementById(`${section}-container`);
        const div = document.createElement('div');
        const btn = document.createElement('button');
        const p = document.createElement('p');

        div.className = "flex h-14 w-full items-center justify-between rounded-[24px] bg-[#FFF6E8] px-4 text-center text-[#241E17] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.4)]";
        btn.className = "text-sm text-[#665541] underline";
        p.className = "text-[#665541]";
        
        btn.style.fontWeight = 700;
        p.style.fontWeight = 700;
        btn.id=`${section}-edit`
        p.id=`${section}-value`
        
        btn.textContent = "ویرایش";
        btn.addEventListener('click', ()=>{ToggleEdit('name')})

        p.textContent = document.getElementById(section).value;
        
        div.appendChild(btn);
        div.appendChild(p);

        Container.innerHTML = ``;
        Container.appendChild(div);

        const actionBtn = document.getElementsByClassName('action-button')[0];
        actionBtn.hidden = true;
    }
}


function fillAddresses(){
    const list = document.getElementById('address-container');
    const addresses = getWithExpiry('addresses');
    if(addresses.length){
        addresses.forEach((address, idx) => {
            const div = createAddress(address);
            list.appendChild(div);
        });
    }
    list.appendChild(createNewButton());

}

function createAddress(address){
    const mainDiv = document.createElement('div');
    const innerDiv = document.createElement('div');
    const p_tag = document.createElement('p');
    const span = document.createElement('span');
    const button = document.createElement('button');

    mainDiv.className = "flex items-center justify-between h-20 px-4 py-2 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.4)] rounded-[16px] hover:border border-[#4FB9E6] bg-[#FFF6E8]";
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
        setWithExpiry('updateAddress', address, 5*60);
        window.location.href="address.html?return=profile";
    })

    return mainDiv;
}

function createNewButton(){
    const mainDiv = document.createElement('div');
    const button = document.createElement('button');

    mainDiv.className = "flex items-center justify-between h-12 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.4)] rounded-[16px] hover:border border-[#4FB9E6] bg-[#FFF6E8]";
    button.className = "w-full h-full text-sm";
    button.id = "new-address";
    button.textContent = "آدرس جدید";

    mainDiv.appendChild(button);
    
    button.addEventListener('click', ()=>{
        localStorage.removeItem('updateAddress');
        window.location.href="address.html?return=profile";
    })

    return mainDiv;
}
