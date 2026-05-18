import { Component } from './base/Component';
import { EventEmitter } from './base/Events';

export class Modal extends Component<HTMLElement> {
    private content: HTMLElement;
    private closeBtn: HTMLElement;
    private events = new EventEmitter();

    constructor(container: HTMLElement) {
        super(container);
        
        this.content = container.querySelector('.modal__content')!;
        this.closeBtn = container.querySelector('.modal__close')!;

        if (!this.content || !this.closeBtn) {
            throw new Error('Modal: отсутствуют обязательные элементы (.modal__content, .modal__close)');
        }

        this.setupCloseHandlers();
    }

    private setupCloseHandlers(): void {
        this.closeBtn.addEventListener('click', () => this.close());
        
        this.container.addEventListener('click', (e) => {
            if (e.target === this.container) {
                this.close();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.container.classList.contains('modal_active')) {
                this.close();
            }
        });
    }

    render(content?: HTMLElement): HTMLElement {
        if (content) {
            this.content.innerHTML = '';
            this.content.appendChild(content);
        }
        return this.container;
    }

    open(): void {
        this.container.classList.add('modal_active');
        document.body.style.overflow = 'hidden';
    }

    close(): void {
        this.container.classList.remove('modal_active');
        document.body.style.overflow = '';
    }

    on<T extends object>(event: string, cb: (data: T) => void): void {
        this.events.on(event, cb);
    }

    emit<T extends object>(event: string, data?: T): void {
        this.events.emit(event, data);
    }
}