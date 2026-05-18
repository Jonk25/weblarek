import { Component } from '../base/Component';
import { EventEmitter } from '../base/Events';

export class SuccessMessage extends Component<{ id: string; total: number }> {
    private titleEl: HTMLElement;
    private descEl: HTMLElement;
    private closeBtn: HTMLElement;
    private events = new EventEmitter();

    constructor(container: HTMLElement) {
        super(container);
        this.titleEl = container.querySelector('.order-success__title')!;
        this.descEl = container.querySelector('.order-success__description')!;
        this.closeBtn = container.querySelector('.order-success__close')!;

        if (!this.titleEl || !this.descEl || !this.closeBtn) {
            throw new Error('SuccessMessage: отсутствуют элементы из template #success');
        }

        this.closeBtn.addEventListener('click', () => this.emit('success:close'));
    }

    render(data?: { id: string; total: number }): HTMLElement {
        if (data) {
            this.titleEl.textContent = data.id ? `Заказ оформлен №${data.id}` : 'Заказ оформлен';
            this.descEl.textContent = `Списано ${data.total} синапсов`;
        }
        return this.container;
    }

    emit<T extends object>(event: string, data?: T): void {
        this.events.emit(event, data);
    }

    on<T extends object>(event: string, cb: (data: T) => void): void {
        this.events.on(event, cb);
    }
}