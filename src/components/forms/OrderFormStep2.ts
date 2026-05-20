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

    protected get submitEvent(): string {
        return 'order-step2:submit';
    }

    protected collectFormValues(): Partial<IBuyer> {
        return {
            email: this.emailInput.value.trim(),
            phone: this.phoneInput.value.trim()
        };
    }

    protected populateFields(v: Partial<IBuyer>): void {
        if (v.email !== undefined) this.emailInput.value = v.email;
        if (v.phone !== undefined) this.phoneInput.value = v.phone;
    }
}