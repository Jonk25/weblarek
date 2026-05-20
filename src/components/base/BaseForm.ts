import { Component } from './Component';
import { EventEmitter } from './Events';

export abstract class BaseForm<T extends object> extends Component<T> {
    protected submitBtn: HTMLButtonElement;
    protected errorsEl: HTMLElement;
    protected events = new EventEmitter();

    constructor(container: HTMLElement) {
        super(container);
        this.submitBtn = container.querySelector('button[type="submit"]')!;
        this.errorsEl = container.querySelector('.form__errors')!;

        container.addEventListener('input', () => this.emitChange());
        container.addEventListener('submit', (e) => {
            e.preventDefault();
            this.emit(this.submitEvent);
        });
    }

    protected abstract get submitEvent(): string;

    protected emitChange(): void {
        this.emit('form:change', this.collectFormValues());
    }

    set errors(v: Record<string, string>) {
        this.errorsEl.textContent = Object.values(v).join('; ');
        this.container.querySelectorAll('.field_invalid').forEach(el => el.classList.remove('field_invalid'));
        
        Object.keys(v).forEach(key => {
            this.container.querySelector(`[name="${key}"]`)?.classList.add('field_invalid');
        });

        this.submitBtn.disabled = Object.keys(v).length > 0;
    }

    render(data?: Partial<T>): HTMLElement {
        if (data) {
            this.errors = {};
            this.populateFields(data);
        }
        return this.container;
    }

    protected emit(event: string, data?: object): void {
        this.events.emit(event, data);
    }

    on(event: string, cb: (data?: object) => void): void {
        this.events.on(event, cb);
    }

    protected abstract collectFormValues(): Partial<T>;
    protected abstract populateFields(values: Partial<T>): void;
}