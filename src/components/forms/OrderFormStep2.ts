import { BaseForm } from '../base/BaseForm';
import { IBuyer } from '../../types';

export class OrderFormStep2 extends BaseForm<IBuyer> {
    private emailInput: HTMLInputElement;
    private phoneInput: HTMLInputElement;

    constructor(container: HTMLElement) {
        super(container);
        this.emailInput = container.querySelector('[name="email"]') as HTMLInputElement;
        this.phoneInput = container.querySelector('[name="phone"]') as HTMLInputElement;
    }

    protected collectFormValues(): Partial<IBuyer> {
        return {
            email: this.emailInput.value.trim(),
            phone: this.phoneInput.value.trim()
        };
    }

    protected validate(v: Partial<IBuyer>): Record<string, string> {
        const errors: Record<string, string> = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!v.email) errors.email = 'Введите email';
        else if (!emailRegex.test(v.email)) errors.email = 'Некорректный email';
        
        if (!v.phone) errors.phone = 'Введите телефон';
        else if (v.phone.replace(/\D/g, '').length < 10) errors.phone = 'Некорректный телефон';
        
        return errors;
    }

    protected populateFields(v: Partial<IBuyer>): void {
        if (v.email) this.emailInput.value = v.email;
        if (v.phone) this.phoneInput.value = v.phone;
    }
}