# Trust and safety in ReLoop

The hard question for any pickup service is: **who is at the door, and where does the device really end up?**
This page explains who ReLoop expects collectors to be, how the prototype checks them, and what it still cannot prevent.

## Who should the collectors be?

In India, e-waste is covered by the E-Waste (Management) Rules, 2022 (in force since 1 April 2023). As we understand them,
producers, manufacturers, refurbishers and recyclers have to register on the Central Pollution Control Board (CPCB) portal,
and registered entities are expected to deal only with other registered entities. Ordinary citizens are not covered by the registration
requirement; they are expected to hand their e-waste to registered or authorised parties.
**Check the CPCB portal for the current rules before relying on this page.**

So in ReLoop a collector should be one of:

| Collector type in the app | Who it is | Registration number to enter |
|---|---|---|
| Registered recycler | A recycler registered with CPCB | The registration number |
| Registered refurbisher | A refurbisher registered with CPCB | The registration number |
| Authorised collection partner | A local collector who hands everything to a registered recycler | Their own or their recycler's registration |
| Delivery partner (transport only) | Delivery staff who carry the device to a registered facility | Their company's partner / vendor ID |

A delivery partner moves the device. They are not a recycler, which is why the app asks every collector to record the facility that finally received it.

## How the prototype checks a collector

1. **Apply.** At sign-up a collector gives their type, organization and registration (or partner) ID. Their account is **PENDING**.
2. **Admin review.** An admin opens *Collectors & trust*, compares the number with the official register, and approves or rejects it (a reason is required to reject).
   ReLoop does **not** call any government API: the check is done by a person.
3. **Only approved collectors act.** Pending, rejected and suspended collectors cannot see open requests, accept pickups or change a pickup's status.
4. **Ongoing monitoring.** Admins can suspend a collector at any time, with a reason. Each collector's completed pickups, average rating and flagged pickups are listed next to their name.

## What protects a single pickup

| Step | Control |
|---|---|
| Accept | The citizen's address and phone are shared only with the assigned collector, and only after the citizen consented when requesting. |
| Handover | The citizen gets a 6-digit **handover code** and gives it only at the door. The collector must enter it to mark the pickup as picked up. Five wrong codes flag the pickup for admin review. |
| Recycled | The collector must record the **facility** that received the device and a **receipt number**. The citizen sees both. Credits are released only at this step, and only once. |
| After | The citizen **rates** the pickup (1 to 5 stars) and can **report a problem**, which flags it for an admin. |
| Abuse | A citizen can have at most 5 open pickups at a time. |

## What it does not prevent (yet)

- A **fake registration number** that an admin fails to catch. The check is manual.
- A **collector and a citizen working together** to fake a pickup and farm credits. The code, receipt, ratings and admin review make this harder to hide, but do not stop it. Real receipts could be verified with the facility.
- **Data on the device.** ReLoop gives no data-erasure certificate; citizens should wipe their devices first.
- The **handover code can be brute-forced** by a dishonest collector with scripts. Wrong attempts are counted and flagged after five, but not blocked.
- **Demo registration numbers** (those starting with `DEMO-`) are samples and not real registrations.

## Ideas for the next version

- Verify registration numbers against the official list automatically, and require a document upload.
- Photo proof at pickup and a weighing record at the facility.
- Receipts confirmed by the facility itself.
- Notifications to the citizen at each stage.

## Who could pay for rewards?

Credits are redeemed for vouchers, which cost real money. A possible model: producers have legal recycling targets that they meet by buying recycling certificates
from registered recyclers, so recyclers and producers have a reason to fund collection. A share of that could fund citizen rewards. This is an idea, not something the prototype does:
the vouchers in the demo are fake codes.
