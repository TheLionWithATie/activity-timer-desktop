
export abstract class Emitter<events extends string> {

  private subscribers: {
    [ key: string ]: Function[]
  } = {};

  protected emit(event: events, value?: any) {
    if (this.subscribers[event]) {
      this.subscribers[event].forEach(function async (f) { f(value) });
    }
  }

  public subscribe(event: events, handler: Function) {
    if (this.subscribers[event]) {
      this.subscribers[event].push(handler);
      return;
    }
    this.subscribers[event] = [handler];
  }

}
