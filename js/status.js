document.addEventListener('DOMContentLoaded', async () => {

    const cart = new Cart(); // Create an instance of Cart
    let order = Order.loadFromLocalStorage() || new Order();

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    if (urlParams.has('status')){
        if (urlParams.get('status')=="OK" && !urlParams.has('code')){
            if (urlParams.has('state')){
                showSuccess('سفارش با موفقیت ثبت شد');
                fillOrderStatus(false);
            } else {
                showSuccess('پرداخت با موفقیت انجام شد');
                fillOrderStatus();
            }
            cart.clearCart();
            order.deleteOrder()
        }
        else if (urlParams.get('status')=="NOK" && urlParams.has('code')){
            const code = urlParams.get('code');
            showError('پرداخت ناموفق');
            fillError(code);
        }
    }

    connectActionButtons()

});

function fillOrderStatus(isTakeout=true){
    const mainDiv = document.getElementsByClassName('status-div')[0];
    mainDiv.innerHTML = `
        <div class="prepration flex items-center justify-center h-12 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.4)] rounded-[16px] border-[#018FCC] text-xl text-white bg-[#2CA7DB]" style="font-weight:700" >
            <span>
                در حال اماده سازی
            </span>
        </div>
        ${isTakeout ? `
            <div class="sending flex items-center justify-center h-12 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.4)] rounded-[16px] border-[#018FCC] text-sm text-[#241E17]" >
                <span>
                    در حال ارسال
                </span>
            </div>

            <div class="received flex items-center justify-center h-12 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.4)] rounded-[16px] border-[#018FCC] text-sm text-[#241E17]">
                <span>
                    دریافت شد
                </span>
            </div>
        ` : ''}
    `;
}

function fillError(code){
    const mainDiv = document.getElementsByClassName('status-div')[0];
    let title = '';
    let description = '';
    switch (code) {
        case '1002':
            title = "تراکنش شما ناموفق بود";
            description = `
                درگاه پرداخت نتوانسته است تراکنش را تأیید کند. لطفاً مجدداً تلاش کنید و در صورت ادامه مشکل، با پشتیبانی تماس بگیرید.
            `;
            break;
        case '1003':
            title = "تراکنش قبلاً ثبت شده است";
            description = `
                شما نمی‌توانید دوباره برای همین شناسه تراکنش اقدام کنید. اگر فکر می‌کنید این یک خطا است، لطفاً با پشتیبانی تماس بگیرید.
            `;
        case '1004':
            title = "اطلاعات کافی دریافت نشد";
            description = `
                لطفاً دوباره تلاش کنید و در صورت بروز مشکل، با ما تماس بگیرید.
            `;
        case '1005':
            title = "تراکنش قبلاً تأیید شده است";
            description = `
                اگر قصد دارید دوباره آن را تأیید کنید، نیازی به انجام دوباره نیست. در غیر این صورت، لطفاً با پشتیبانی تماس بگیرید.
            `;
        case '1006':
            title = "درگاه پرداخت تراکنش را قبول نکرد";
            description = `
                اگر قصد دارید دوباره آن را تأیید کنید، نیازی به انجام دوباره نیست. در غیر این صورت، لطفاً با پشتیبانی تماس بگیرید.
            `;
        default:
            title = "وضعیت نامشخص";
            description = "خطای نامشخصی رخ داده است. در صورت نیاز میتوانید از لینک زیر به پشتیبانی پیام دهید";
            break;
    }
    mainDiv.innerHTML = `
        <div class="mt-10 w-full flex flex-col items-center justify-center gap-3">
              <h2 class="w-full text-right text-lg">
                ${title}
              </h2>
              <span class="line-clamp-4 text-sm">
                ${description}
              </span>
              <a href="/" class="text-cyan-400 hover:text-sky-500 duration-200 mt-6">برگشت به خانه</a>
        </div>
    `;
}


function connectActionButtons() {
    const button = document.getElementsByClassName('return-home')[0];
    button.addEventListener('click', ()=>{
        window.location.href = '/';
    })
}