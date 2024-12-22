class Cart {
    constructor() {
        this.items = this.loadCart(); // Load existing cart from localStorage
        this.expiryDuration = 24 * 60 * 60 * 1000; // Set expiry duration (e.g., 1 day)
        this.checkExpiry();
    }

    loadCart() {
        const cartData = localStorage.getItem('restaurantCart');
        return cartData ? JSON.parse(cartData) : [];
    }

    saveCart() {
        localStorage.setItem('restaurantCart', JSON.stringify(this.items));
        localStorage.setItem('cartExpiry', Date.now() + this.expiryDuration); // Save expiry time
    }

    checkExpiry() {
        const expiryTime = localStorage.getItem('cartExpiry');
        if (expiryTime && Date.now() > expiryTime) {
            this.clearCart(); // Clear cart if expired
        }
    }

    clearCart() {
        this.items = [];
        localStorage.removeItem('restaurantCart');
        localStorage.removeItem('cartExpiry');
    }

    addItem(item, type, inp_option=null, inp_addon=null) {
        const existingItem = this.items.find(i => i.id === item.id);
        
        if (existingItem) {

            if (type=='item'){
                existingItem.qty += 1; // Update quantity if item exists
            }
            else if(type == 'option'){
                const existingOption = existingItem.options.find(i => i.id === inp_option.id);
                existingOption.qty += 1;
            }
            else if(type == "item_addon"){
                const existingAddon = existingItem.addons.find(i => i.id === inp_addon.id);
                existingAddon.qty += 1;
            }
            else if (type == "option_addon"){
                const existingOption = existingItem.options.find(i => i.id === inp_option.id);
                const existingOptionAddon = existingOption.addons.find(i => i.id === inp_addon.id);
                existingOptionAddon.qty += 1;
            }
        
        } else {

            item.qty = 0; // Initialize quantity for new item
            // increase qty if an item is selected
            if (type=='item') item.qty += 1;

            item.options.forEach(option => {
                option.qty=0;   // Initialize quantity for option
                // increase qty if an option is selected
                if (type=='option' && inp_option==option) option.qty += 1;
            
                option.addons.forEach(addon => {
                    addon.qty=0; // Initialize quantity for option addon
                    // increase qty if an option addon is selected
                    if (type=='option_addon' && inp_addon==addon) addon.qty += 1;
                });
            });
            item.addons.forEach(addon => {
                addon.qty = 0;
                // increase qty if an option addon is selected
                if (type=='item_addon' && inp_addon==addon) addon.qty += 1;
            });
            
            this.items.push(item);
        }
        this.saveCart();
    }

    reduceItem(item, type, inp_option=null, inp_addon=null) {
        const existingItemIndex = this.items.findIndex(i => i.id === item.id);
        if (existingItemIndex !== -1) {
            if(type == 'item'){
                if (this.items[existingItemIndex].qty > 1) {
                    this.items[existingItemIndex].qty -= 1;
                } else if (this.items[existingItemIndex].qty == 1) {
                    // check an option of the item is not selected
                    let is_options_selected=false;
                    this.items[existingItemIndex].options.forEach(option => {
                        if (option.qty > 0) is_options_selected = true;
                    });

                    // if there is an option, reduce item and its addon qty to 0
                    if (is_options_selected){
                        this.items[existingItemIndex].qty = 0;
                        this.items[existingItemIndex].addons.forEach(addon => {
                            addon.qty = 0;
                        });
                    } else {
                        this.items.splice(existingItemIndex, 1);
                    }
                }
            }
            else if (type == 'option'){
                const existingOptionIndex = this.items[existingItemIndex].options.findIndex(i => i.id === inp_option.id);
                if (existingOptionIndex !== -1){
                    if (this.items[existingItemIndex].options[existingOptionIndex].qty > 1){
                        this.items[existingItemIndex].options[existingOptionIndex].qty -= 1;
                    } else if (this.items[existingItemIndex].options[existingOptionIndex].qty == 1){
                        this.items[existingItemIndex].options[existingOptionIndex].qty = 0;
                        this.items[existingItemIndex].options[existingOptionIndex].addons.forEach(addon => {
                            addon.qty = 0;
                        });
                        if(this.items[existingItemIndex].qty == 0){
                            let options_have_qty = false;
                            this.items[existingItemIndex].options.forEach(option=>{
                                if (this.optionQty(this.items[existingItemIndex], option) != 0) options_have_qty = true;
                            })

                            if(!options_have_qty) this.items.splice(existingItemIndex, 1); //remove the whole item when both item and option qty are 0
                        }
                    }
                }
            } 
            else if (type == "item_addon"){
                const existingAddonIndex = this.items[existingItemIndex].addons.findIndex(i => i.id === inp_addon.id);
                if (existingAddonIndex !== -1){    
                    if (this.items[existingItemIndex].addons[existingAddonIndex].qty > 0){
                        this.items[existingItemIndex].addons[existingAddonIndex].qty -= 1;
                    }
                }
            }
            else if (type == "option_addon"){
                const existingOptionIndex = this.items[existingItemIndex].options.findIndex(i => i.id === inp_option.id);
                if (existingOptionIndex !== -1){
                    const existingOptionAddonIndex = this.items[existingItemIndex].options[existingOptionIndex].addons.findIndex(i => i.id === inp_addon.id);
                    if (existingOptionAddonIndex !== -1){
                        if (this.items[existingItemIndex].options[existingOptionIndex].addons[existingOptionAddonIndex].qty > 0){
                            this.items[existingItemIndex].options[existingOptionIndex].addons[existingOptionAddonIndex].qty -= 1;
                        }
                    }
                }
            }
            this.saveCart();
        }
    }
    
    isAllowed(item, type, inp_option=null){
        // check if item of option exists before adding addons
        const existingItemIndex = this.items.findIndex(i => i.id === item.id);
        if (existingItemIndex !== -1) {
            if (type == "item_addon"){
                if (this.items[existingItemIndex].qty > 0) return true;
            }
            else if (type == "option_addon"){
                const existingOptionIndex = this.items[existingItemIndex].options.findIndex(i => i.id === inp_option.id);
                if(this.items[existingItemIndex].options[existingOptionIndex].qty > 0) return true;
            }
        }
        return false;   //not allowed
    }

    getItems() {
        return this.items;
    }

    itemQty(item) {
        const existingItem = this.items.find(i => i.id === item.id);
        return existingItem ? existingItem.qty : 0;
    }

    optionQty(item, option) {
        const existingItem = this.items.find(i => i.id === item.id);
        if (existingItem){
            const existingOption = existingItem.options.find(i => i.id === option.id);
            return existingOption ? existingOption.qty : 0;
        }
        return 0;
    }
    
    addonQty(item, inp_option=null, inp_addon) {
        const existingItem = this.items.find(i => i.id === item.id);
        if (existingItem){
            if (inp_option == null){
                const existingAddon = existingItem.addons.find(i => i.id === inp_addon.id);
                return existingAddon ? existingAddon.qty : 0;
            } else {
                const existingOption = existingItem.options.find(i => i.id === inp_option.id);
                if (existingOption){
                    const existingOptionAddon = existingOption.addons.find(i => i.id === inp_addon.id);
                return existingOptionAddon ? existingOptionAddon.qty : 0;
                }
            }
        }
        return 0;
    }
    
    isInCart(item, inp_option=null, inp_addon=null) {
        const existingItem = this.items.find(i => i.id === item.id);
        if(existingItem){
            if (inp_addon != null){
                if (inp_option != null){
                    const existingOption = existingItem.options.find(i => i.id == inp_option.id)
                    return existingOption.addons.some(addon => addon.id === inp_addon.id && addon.qty > 0);
                } else {
                    return existingItem.addons.some(addon => addon.id === inp_addon.id && addon.qty > 0);
                }
            }

            if (inp_option != null) {
                return existingItem.options.some(option => option.id === inp_option.id  && option.qty > 0);
            }
            console.log()
            return this.items.some(cartItem => cartItem.id === item.id && cartItem.qty > 0);
        }
        return false;
    }
    
    getTotalPrice() {
        let total_items=0, total_options=0, total_item_addons=0, total_option_addons=0;

        total_items = this.items.reduce((total, item) => total + (item.price * item.qty), 0);
        this.items.forEach(item=>{
            total_options += item.options.reduce((total, option) => total + (option.price * option.qty), 0);
            total_item_addons += item.addons.reduce((total, addon) => total + (addon.price * addon.qty), 0);
            item.options.forEach(option=>{
                total_option_addons += option.addons.reduce((total, addon) => total + (addon.price * addon.qty), 0);
            })
        })
        
        return total_items + total_options + total_item_addons + total_option_addons;
    }
}
