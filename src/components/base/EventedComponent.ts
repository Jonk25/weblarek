import { Component } from './Component';
import { EventEmitter } from './Events';

export abstract class EventedComponent<T extends object> extends Component<T> {
    protected events = new EventEmitter();

    constructor(container: HTMLElement) {
        super(container);
    }

    protected emit<U extends object>(event: string, data?: U): void {
        this.events.emit(event, data);
    }

    public on<U extends object>(event: string, cb: (data: U) => void): void {
        this.events.on(event, cb);
    }
}