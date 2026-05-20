import { BaseForm } from '../base/BaseForm';
import { IBuyer, TPayment } from '../../types';

export class OrderFormStep1 extends BaseForm<IBuyer> {
    private addressInput: HTMLInputElement;
    private paymentButtons: NodeListOf<HTMLButtonElement>;

    constructor(container: HTMLElement) {
        super(container);
        this.addressInput = container.querySelector('[name="address"]') as HTMLInputElement;
        this.paymentButtons = container.querySelectorAll('.button_alt');

        this.paymentButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.paymentButtons.forEach(b => b.classList.remove('button_alt-active'));
                btn.classList.add('button_alt-active');
                this.emitChange();
            });
        });
    }

    protected get submitEvent(): string {
        return 'order-step1:submit';
    }

    protected collectFormValues(): Partial<IBuyer> {
        const activeBtn = this.container.querySelector('.button_alt-active') as HTMLButtonElement;
        return {
            address: this.addressInput.value.trim(),
            payment: activeBtn ? (activeBtn.getAttribute('name') as TPayment) : null
        };
    }

    protected populateFields(v: Partial<IBuyer>): void {
        if (v.address !== undefined) this.addressInput.value = v.address;
        if (v.payment !== undefined) {
            this.paymentButtons.forEach(btn => {
                btn.classList.toggle('button_alt-active', btn.getAttribute('name') === v.payment);
            });
        }
    }
}