class Order {
    constructor(deliveryType = '', customerNote = '', address = '', discount = 0, deliveryTime = '') {
        this.deliveryType = deliveryType; // Type of delivery (e.g., 'dine-in', 'takeout')
        this.customerNote = customerNote; // Customer note
        this.address = address; // Delivery address
        this.discount = discount; // Discount amount or code
        this.deliveryTime = deliveryTime; // Expected delivery time
    }

    // Method to get order details
    getOrderDetails() {
        return {
            deliveryType: this.deliveryType,
            customerNote: this.customerNote,
            address: this.address,
            discount: this.discount,
            deliveryTime: this.deliveryTime,
        };
    }

    // Method to update delivery type
    updateDeliveryType(newDeliveryType) {
        this.deliveryType = newDeliveryType;
        this.saveToLocalStorage();
    }

    // Method to update customer note
    updateCustomerNote(newCustomerNote) {
        this.customerNote = newCustomerNote;
        this.saveToLocalStorage();
    }

    // Method to update address
    updateAddress(newAddress) {
        this.address = newAddress;
        this.saveToLocalStorage();
    }

    // Method to update discount
    updateDiscount(newDiscount) {
        this.discount = newDiscount;
        this.saveToLocalStorage();
    }

    // Method to update delivery time
    updateDeliveryTime(newDeliveryTime) {
        this.deliveryTime = newDeliveryTime;
        this.saveToLocalStorage();
    }

    saveToLocalStorage() {
        localStorage.setItem('orderData', JSON.stringify(this.getOrderDetails()));
    }

    // Static method to load order data from localStorage
    static loadFromLocalStorage() {
        const orderData = localStorage.getItem('orderData');
        if (orderData) {
            const { deliveryType, customerNote, address, discount, deliveryTime } = JSON.parse(orderData);
            return new Order(deliveryType, customerNote, address, discount, deliveryTime);
        }
        return null; // Return null if no order data exists
    }

    deleteOrder(){
        localStorage.removeItem('orderData');
        this.deliveryType = '';
        this.customerNote = '';
        this.address = '';
        this.discount = '';
        this.deliveryTime = '';
    }

    refresh(){
        const orderData = localStorage.getItem('orderData');
        if (orderData) {
            const { deliveryType, customerNote, address, discount, deliveryTime } = JSON.parse(orderData);
            this.deliveryType= deliveryType;
            this.customerNote= customerNote;
            this.address= address;
            this.discount= discount;
            this.deliveryTime= deliveryTime;
        }
    }

    isComplete(){
        if (this.deliveryType != '' &&  
            this.address != '' && 
            this.deliveryTime != '') {
                return true;
            }
        return false;
    }
    
    createBody(cart){
        const restaurant = getWithExpiry('restaurant');
        
        const cart_data = {};
        // cart.getItems().forEach(item => {
        //     cart_data[item.id] = item.qty;
        // });

        const body = new FormData();
        body.append('restaurant', restaurant.id);
        if (this.address) body.append('address', this.address);
        if (this.deliveryTime) body.append('deliver_time', this.deliveryTime);
        body.append('delivery', this.deliveryType);
        body.append('discount', this.discount);
        body.append('note', this.customerNote);
        // body.append('cart', JSON.stringify(cart_data));
        body.append('cart', JSON.stringify(cart.getItems()));
        return body;
    }   
}

// // Example usage:
// let order = Order.loadFromLocalStorage() || new Order();
// // Accessing order details
// console.log(order.getOrderDetails());

// // Updating some properties
// order.updateDeliveryType('dine-in');
// order.updateCustomerNote('Call me when you arrive.');
// order.updateAddress('456 Elm St, City');
// order.updateDiscount(15);
// order.updateDeliveryTime('2024-12-01T19:00:00');

// // Checking updated order details
// console.log(order.getOrderDetails());
