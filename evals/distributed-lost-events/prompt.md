---
description: The dual-write problem (DB commit succeeds, event publish lost) should lead to the transactional outbox plus idempotent consumers.
tags: [architecture, distributed]
max_turns: 8
allowed_tools: [Read, Glob, Grep, Skill, Agent]
---

In our order service (Spring Boot, PostgreSQL, Kafka) we do this:

```java
@Transactional
public Order placeOrder(PlaceOrder cmd) {
    Order order = orders.save(Order.from(cmd));
    kafkaTemplate.send("orders", new OrderPlaced(order.getId(), order.getTotal()));
    return order;
}
```

About once a week the shipping service never hears about an order, and occasionally it receives an `OrderPlaced` for an order that doesn't exist in our database. Retries on the Kafka producer are already enabled. What's the root cause and how do we fix it properly?
