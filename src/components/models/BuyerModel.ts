import { EventEmitter } from '../base/Events';
import { IBuyer, TPayment, TBuyerErrors } from '../../types';

export class BuyerModel extends EventEmitter {
    private payment: TPayment | null = null;
    private email: string = '';
    private phone: string = '';
    private address: string = '';

    setPayment(payment: TPayment): void {
        this.payment = payment;
        this.emit('buyer:payment-changed', { payment });
        this.emit('buyer:changed', this.getData());
    }

    setEmail(email: string): void {
        this.email = email;
        this.emit('buyer:email-changed', { email });
        this.emit('buyer:changed', this.getData());
    }

    setPhone(phone: string): void {
        this.phone = phone;
        this.emit('buyer:phone-changed', { phone });
        this.emit('buyer:changed', this.getData());
    }

    setAddress(address: string): void {
        this.address = address;
        this.emit('buyer:address-changed', { address });
        this.emit('buyer:changed', this.getData());
    }

    getData(): IBuyer {
        return {
            payment: this.payment,
            email: this.email,
            phone: this.phone,
            address: this.address
        };
    }

    clear(): void {
        this.payment = null;
        this.email = '';
        this.phone = '';
        this.address = '';
        this.emit('buyer:cleared');
        this.emit('buyer:changed', this.getData());
    }

    validate(): TBuyerErrors {
        const errors: TBuyerErrors = {};
        
        if (!this.address.trim()) errors.address = 'Укажите адрес доставки';
        if (!this.payment) errors.payment = 'Выберите способ оплаты';
        if (!this.email.trim()) errors.email = 'Укажите email';
        if (!this.phone.trim()) errors.phone = 'Укажите телефон';
        
        return errors;
    }
}