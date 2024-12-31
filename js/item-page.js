document.addEventListener('DOMContentLoaded', async () => {
    // return to main page if no branch id is fonud 
    const item_id = getWithExpiry('itemDisplayed');
    if ( item_id == null){
        window.location.href = "menu.html"
        return;
    }
    
    const cart = new Cart(); // Create an instance of Cart
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
    sw_span.textContent = single_words[item.single_word];

    const p_description = document.getElementsByClassName('item-description')[0];
    p_description.textContent = item.description;
    
    const optionDiv = document.getElementsByClassName('option-list')[0];
    item.options.forEach((option, idx) =>{
      const element = createItemOptionElement(option, item, cart, true);
      optionDiv.appendChild(element);
  })

    const select_button = document.getElementsByClassName('item-select')[0];

    select_button.textContent =cart.itemQty(item)>0 ? `انتخاب شد (${cart.itemQty(item)})` :'انتخاب'
    select_button.addEventListener('click', ()=>{
        cart.addItem(item, 'item');
        select_button.textContent = `انتخاب شد (${cart.itemQty(item)})`
    })
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


function createCarousel(item){
    let photos = [];
    const carousel = document.getElementsByClassName('carousel')[0];
    item.images.forEach(image =>{
        let source = `${base_url}${image.image}`;
        photos.push(source);
    })
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