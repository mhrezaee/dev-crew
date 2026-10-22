# Pattern examples (before -> after)

Examples in TypeScript for brevity; the same shapes apply in C#, Java, Kotlin, Python, Go and Dart.

## Strategy - replace a growing switch
Before:
```ts
function shippingCost(order: Order): number {
  switch (order.shippingMethod) {
    case "standard": return 4.99;
    case "express": return order.weightKg * 2 + 9.99;
    case "pickup": return 0;
    // every new method edits this function
  }
}
```
After (idiomatic, no class hierarchy needed):
```ts
type ShippingStrategy = (order: Order) => number;

const shippingStrategies: Record<ShippingMethod, ShippingStrategy> = {
  standard: () => 4.99,
  express: (o) => o.weightKg * 2 + 9.99,
  pickup: () => 0,
};

const shippingCost = (order: Order) => shippingStrategies[order.shippingMethod](order);
```

## Decorator - add caching without touching the client
```ts
interface ExchangeRates { rate(from: string, to: string): Promise<number>; }

class CachedExchangeRates implements ExchangeRates {
  private cache = new Map<string, { value: number; expires: number }>();
  constructor(private inner: ExchangeRates, private ttlMs: number, private now = Date.now) {}

  async rate(from: string, to: string) {
    const key = `${from}:${to}`;
    const hit = this.cache.get(key);
    if (hit && hit.expires > this.now()) return hit.value;
    const value = await this.inner.rate(from, to);
    this.cache.set(key, { value, expires: this.now() + this.ttlMs });
    return value;
  }
}
// wiring: new CachedExchangeRates(new HttpExchangeRates(client), 60_000)
```

## Adapter - isolate a third-party SDK (hexagonal driven port)
```ts
// application port
interface PaymentGateway { charge(amount: Money, token: string): Promise<ChargeResult>; }

// infrastructure adapter
class StripePaymentGateway implements PaymentGateway {
  constructor(private stripe: Stripe) {}
  async charge(amount: Money, token: string) {
    const intent = await this.stripe.paymentIntents.create({
      amount: amount.minorUnits, currency: amount.currency, payment_method: token, confirm: true,
    });
    return intent.status === "succeeded" ? ChargeResult.ok(intent.id) : ChargeResult.declined(intent.status);
  }
}
```

## State - explicit transitions instead of scattered flags
```ts
const transitions: Record<OrderStatus, OrderStatus[]> = {
  Draft: ["Placed", "Cancelled"],
  Placed: ["Paid", "Cancelled"],
  Paid: ["Shipped", "Refunded"],
  Shipped: ["Delivered"],
  Delivered: [], Cancelled: [], Refunded: [],
};

function transition(order: Order, to: OrderStatus): Order {
  if (!transitions[order.status].includes(to))
    throw new DomainError(`Cannot move order from ${order.status} to ${to}`);
  return { ...order, status: to };
}
```

## Specification - composable business rules
```ts
type Spec<T> = (x: T) => boolean;
const and = <T>(...specs: Spec<T>[]): Spec<T> => (x) => specs.every((s) => s(x));

const isAdult: Spec<Passenger> = (p) => age(p.birthDate) >= 18;
const hasValidPassport: Spec<Passenger> = (p) => p.passport.expiresAt > today();
const canTravelUnaccompanied = and(isAdult, hasValidPassport);
```

## Builder for tests (test data builder)
```ts
class BookingBuilder {
  private props: BookingProps = { status: "Confirmed", passengers: [aPassenger()], total: Money.eur(100) };
  withStatus(status: BookingStatus) { this.props.status = status; return this; }
  withTotal(total: Money) { this.props.total = total; return this; }
  build() { return Booking.restore(this.props); }
}
export const aBooking = () => new BookingBuilder();
```
