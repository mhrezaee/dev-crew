---
name: bdd
description: "BDD: example mapping, declarative Gherkin and automation with Reqnroll, Cucumber, behave, pytest-bdd or godog. Use for Gherkin or feature files."
---

# Behaviour-Driven Development

BDD = **Discovery** (shared understanding) -> **Formulation** (Gherkin) -> **Automation** (executable specs). Most of the value is in discovery; automation keeps the documentation true.

## 1. Discovery - example mapping (per story, ~25 min)
Produce four lists:
- **Story** (yellow): the user story.
- **Rules** (blue): business rules / acceptance criteria.
- **Examples** (green): concrete examples illustrating each rule, including edge cases.
- **Questions** (red): unknowns -> must be answered before development.

Too many rules -> split the story. Too many questions -> not ready.

## 2. Formulation - writing good Gherkin
```gherkin
Feature: Free cancellation
  Customers may cancel a booking free of charge shortly after booking,
  so that they can correct mistakes without contacting support.

  Rule: Bookings can be cancelled for free within 24 hours of creation

    Scenario: Cancelling within the free cancellation window
      Given Maria booked flight OS101 for 250.00 EUR 2 hours ago
      When she cancels the booking
      Then the booking is cancelled
      And she is refunded 250.00 EUR

    Scenario: Cancelling after the free cancellation window
      Given Maria booked flight OS101 for 250.00 EUR 25 hours ago
      When she cancels the booking
      Then the booking is cancelled
      And she is refunded according to the fare conditions

  Rule: Already-flown bookings cannot be cancelled

    Scenario: Attempting to cancel a flown booking
      Given Maria's booking for flight OS101 has been flown
      When she tries to cancel the booking
      Then the cancellation is rejected with "Booking already used"
```

### Style rules
- **Declarative, not imperative**: describe *what* in business language, not *how* (no "click", "fill field", URLs, CSS selectors, SQL).
- One behaviour per scenario; 3-7 steps; one `When`.
- Concrete, realistic data with named personas; only data that matters for the rule.
- Use `Rule:` to group scenarios by business rule; `Background` only for truly shared context; `Scenario Outline` + `Examples` for data variations of the same rule.
- Domain language from the glossary (`domain-driven-design` ubiquitous language).
- Feature files live with the code and are reviewed by business/product.

## 3. Automation
| Stack | Tool |
|---|---|
| .NET | **Reqnroll** (SpecFlow successor) + xUnit/NUnit |
| Java/Kotlin | Cucumber-JVM + JUnit Platform |
| JS/TS | @cucumber/cucumber, playwright-bdd for UI |
| Python | behave, pytest-bdd |
| Go | godog |
| Flutter | bdd_widget_test / flutter_gherkin |

### Step definition rules
- Steps are thin: translate Gherkin to calls on a **driver/application layer** (use cases or API), not UI clicks, unless the behaviour is UI-specific.
- Prefer testing below the UI (application or API level) - faster and more stable; keep a few UI scenarios for critical journeys.
- Share state via the framework's context/world object, not static fields.
- Reuse steps through parameters (`{string}`, `{int}`, custom parameter types for `Money`, dates), not copy-paste.
- Deterministic: fixed clock, seeded data, isolated DB per scenario.

### Example (Reqnroll, C#)
```csharp
[Binding]
public class CancellationSteps(BookingDriver driver)
{
    [Given("{word} booked flight {word} for {decimal} EUR {int} hours ago")]
    public void GivenBooked(string customer, string flight, decimal price, int hoursAgo) =>
        driver.CreateBooking(customer, flight, Money.Eur(price), driver.Clock.Now.AddHours(-hoursAgo));

    [When("she cancels the booking")]
    public Task WhenCancels() => driver.CancelCurrentBooking();

    [Then("she is refunded {decimal} EUR")]
    public void ThenRefunded(decimal amount) =>
        driver.LastRefund.Should().Be(Money.Eur(amount));
}
```

## Relationship to TDD
BDD scenarios define *outside-in* acceptance; TDD drives the inner implementation. Workflow: write scenario (fails) -> TDD the domain/use case until it passes -> refactor.

## Living documentation
Publish feature results in CI (Cucumber HTML reports, Reqnroll LivingDoc, Allure). The feature files become the up-to-date specification of business rules.
