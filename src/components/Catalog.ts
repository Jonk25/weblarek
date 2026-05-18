import { Component } from './base/Component';
import { IProduct } from '../types';
import { EventEmitter } from './base/Events';

export class Catalog extends Component<IProduct[]> {
    private grid: HTMLElement;
    private events = new EventEmitter();

    constructor(container: HTMLElement) {
        super(container);
        this.grid = container;
    }

    render(data?: IProduct[]): HTMLElement {
        if (data) this.grid.innerHTML = '';
        return this.container;
    }

    addCard(card: HTMLElement): void {
        this.grid.appendChild(card);
    }

    clear(): void {
        this.grid.innerHTML = '';
    }

    on<T extends object>(event: string, cb: (data: T) => void): void {
        this.events.on(event, cb);
    }

    emit<T extends object>(event: string, data?: T): void {
        this.events.emit(event, data);
    }
}