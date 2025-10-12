document.addEventListener('DOMContentLoaded', async () => {
    // return to main page if no branch id is fonud 
    const item_id = getWithExpiry('itemDisplayed');
    if ( item_id == null){
        window.location.href = "menu.html"
        return;
    }
    
    const cart = new Cart(); // Create an instance of Cart
    
    // activate cart button
    cartButton();
    
    try{
        await fetchAndStoreData('GET', `${base_url}/api/menu/item/get/${item_id}`, 'single_item', {});
        fillPage(cart);
    } catch (error) {
        console.log("caught error: ",error);
    }

});

function fillPage(cart){
    const item = getWithExpiry('single_item');
    
    createCarousel(item);

    const h3_name = document.getElementsByClassName('item-name')[0];
    h3_name.textContent = item.name;

    const sw_span = document.getElementsByClassName('single_word')[0];
    sw_span.textContent = item.single_word;

    const item_price = document.getElementsByClassName('item_price')[0];
    item_price.textContent = `${convertToPersianPrice(item.price)} ت`;

    const p_description = document.getElementsByClassName('item-description')[0];
    p_description.textContent = item.description;
    
    if (item.show_inventory){
      const inventory = document.getElementsByClassName('inventory')[0];
      inventory.textContent = item.inventory == 0 ? "اتمام موجودی": item.inventory;
      if (item.inventory == 0) {
          inventory.style.color ="#eb2762";
      }
    } else {
      const inventory_container = document.getElementsByClassName('inventory-container')[0];
      inventory_container.style.display = "none";
    }

    const optionDiv = document.getElementsByClassName('option-list')[0];
    item.options.forEach((option, idx) =>{
      const element = createItemOptionElement(option, item, cart, true);
      optionDiv.appendChild(element);
    })
    
    const select_button = document.getElementsByClassName('item-select')[0];
    
    if (item.show_inventory && item.inventory == 0){
      select_button.disabled = true;
    }

    if ((item.options.length && item.own_price_visible) || !item.options.length){  
      select_button.textContent =cart.itemQty(item)>0 ? `انتخاب شد (${convertToPersianPrice(cart.itemQty(item))})` :'انتخاب'
      select_button.addEventListener('click', ()=>{
          if (item.show_inventory){
            if (item.inventory <= cart.itemQty(item)){
                return showModal('انتخاب بیش از حد مجاز نیست', 5000);
            }
          }
          
          cart.addItem(item, 'item');
          select_button.textContent = `انتخاب شد (${convertToPersianPrice(cart.itemQty(item))})`
      })
    } else {
      select_button.style.display = "none";
      const returnBtn = document.getElementsByClassName('return-button')[0];
      returnBtn.className = "col-span-3 bg-[#FFF6E8] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.4)] rounded-[16px] text-[#241E17] text-lg py-3";
    }
}


function createItemOptionElement(option, item, cart, is_last){
  {/* option 1  */}
  const mainDiv = document.createElement('div')
  mainDiv.className = `flex w-full items-center ${is_last ?'':'border-b-[0.2px] border-[#018fcc2c]'} p-3 pb-4`
  
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

          if (item.inventory == 0){
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

const placeholderImage = 'images/default_pic.png';

function createCarousel(item){
    let photos = [];
    const carousel = document.getElementsByClassName('carousel')[0];
    if (item.images && item.images.length > 0){
      item.images.forEach(image =>{
        let source = `${base_url}${image.image}`;
        photos.push(source);
      })
    }
    else {
      photos.push(placeholderImage);
    }
    carouselFunctions(photos);
}

function carouselFunctions(photos) {
  const img = document.getElementById('carousel');
  let dotsContainer = document.querySelector(".dots");

  // Images are from unsplash
  let pictures = photos;

  img.src = pictures[0];

  let position = 0;

  function showItem(index) {
    img.src = pictures[index];
    pictures.forEach((item, idx) => {
      dots[idx].classList.remove("active");
      if (idx === index) {
        dots[idx].classList.add("active");
      }
    });
  }
  if (pictures.length > 1){
    pictures.forEach((_, index) => {
      let dot = document.createElement("span");
      dot.classList.add("dot");
      dot.dataset.index = index;
      dotsContainer.appendChild(dot);
    });
    
    let dots = document.querySelectorAll(".dot");

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        let index = parseInt(dot.dataset.index);
        showItem(index);
      });
    });
  }
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