#  Onhandl

**Automate what your money does ```INSTANTLY```**

Onhandl lets you create **financial automations** that execute the moment funds hit your wallet.

No dashboards. No scripts. No babysitting.

Just:

> **“When money arrives → do X”**

---

##  What you can do

* Auto-split incoming funds (save, send, invest)
* Trigger actions on-chain instantly
* Route funds across wallets automatically
* Get real-time Telegram notifications
* Build programmable financial behavior without writing contracts

---

##  Example

You receive **10,000 CKB**

Onhandl executes instantly:

```
→ Send 4,000 to savings wallet
→ Stake 2,000
→ Swap 1,000 to ""
→ Keep 3,000
→ Notify you on Telegram
```

No manual steps. No clicks.

---

##  How it works

1. **Create an automation (agent)**
2. **Fund your wallet**
3. **Onhandl executes instantly on-chain**

Behind the scenes:

* Watches blockchain activity
* Converts events → actions
* Executes transactions
* Emits notifications

---

##  Architecture

Onhandl is built as an **event-driven financial runtime**

```
Event Source (Blockchain)
        ↓
Runtime Engine
        ↓
Policy Engine
        ↓
Action Planner
        ↓
Action Executors (CKB, EVM, etc)
        ↓
Notifications (Telegram, etc)
```

---

##  Core Concepts

| Concept  | Description                             |
| -------- | --------------------------------------- |
| Event    | Something happens (e.g. FUNDS.RECEIVED) |
| Policy   | Rules that decide what to do            |
| Action   | Transfer, swap, retain, invest          |
| Executor | Chain-specific execution logic          |
| Runtime  | Orchestrates everything                 |

---

##  Quick Start

```bash
git clone https://github.com/FadhilMulinya/Onhandl.git
cd Onhandl
pnpm install
cp server/.env.example server/.env
pnpm dev
```

* Frontend → [http://localhost:3000](http://localhost:3000)
* Backend → [http://localhost:3001](http://localhost:3001)

---

##  Example API Flow

### 1. Create automation

```json
{
  "name": "Auto Savings",
  "prompt": "When I receive CKB, send 40% to savings wallet"
}
```

---

### 2. Fund wallet

Send funds to your generated wallet.

---

### 3. System executes

* Detects transaction
* Matches policy
* Executes actions
* Sends notification

---

##  Event System

Supported events:

* `FUNDS.RECEIVED`
* `PAYMENT_LINK.PAID`
* `APPROVAL.GRANTED`
* `TIME.MONTH_STARTED`

---

##  Extensibility

Add your own executors:

```
ActionExecutors/
  blockchain/
    ckb/
      CkbTransferExecutor.ts
    evm/
      EvmSwapExecutor.ts
  internal/
  web2/
```

Each executor handles:

```ts
canHandle(action)
execute(context)
```

---

##  Safety

* Idempotent execution (no double execution)
* Approval layer for risky actions
* Event-based tracking for full auditability

---

##  Notifications

Currently supported:

* Telegram

Coming:

* WhatsApp
* Email
* Webhooks

---

##  Why this exists

Managing money manually is hectic.

Onhandl turns money into something that **acts on your behalf**.

---

##  Vision

> Money shouldn’t sit idle.
> It should **react, move, and optimize itself.**

---

##  Contributing

If you like:

* event-driven systems
* blockchain infra
* automation engines

This is for you.

---

## Real-World Use Cases

### 1. Automatic Savings

> “Every time I get paid, save before I spend.”

```text
Receive 10,000 CKB  
→ Send 40% to savings wallet  
→ Keep 60% for usage  
```

**Who this hits:**

* freelancers
* crypto earners
* anyone with zero discipline (most people)

---

### 2. Treasury Management

> “Don’t let idle funds sit and rot.”

```text
Funds received  
→ Move 30% to cold wallet  
→ Allocate 50% to operations wallet  
→ Keep 20% liquid  
```

**Why this matters:**
Manual treasury ops are slow and error-prone. This removes humans from the loop.

---

### 3. Auto-Invest / Yield Strategy

> “Put money to work instantly.”

```text
Funds received  
→ Stake 50%  
→ Swap 20% to stablecoin  
→ Retain 30%  
```

**Who cares:**

* DeFi users
* funds
* degens (they move fast)

---

### 4. Payment Routing 

> “Split income automatically across stakeholders.”

```text
Client pays 1,000  
→ Send 70% to main wallet  
→ Send 20% to partner  
→ Send 10% to tax wallet  
```

**Why this wins:**
No more manual splitting. No disputes.

---

### 5. Smart Budgeting

> “Control spending without thinking.”

```text
Funds received  
→ Allocate:
   - 50% expenses  
   - 30% savings  
   - 20% investments  
```

This is basically:

> **banking automation without a bank**

---

### 6. Risk Management

> “Move funds instantly when thresholds are hit.”

```text
If balance > 50,000  
→ Move excess to cold wallet  
```

**This is HUGE for:**

* traders
* DAOs
* treasury managers

---

### 7. Real-Time Notifications

> “Know what your money is doing.”

```text
Funds received  
→ Execute actions  
→ Send Telegram notification  
```

You turn:

> blind wallets → observable systems

---

### 8. Multi-Wallet Orchestration

> “One brain controlling multiple wallets.”

```text
Wallet A receives funds  
→ Distribute across Wallet B, C, D  
```

This is:

> **wallet orchestration layer**

---

### 9. Recurring Financial Logic

> “Automate time-based actions.”

```text
Every month  
→ Move 1,000 to savings  
→ Invest 500  
```

---

### 10. Dev / Power User Use Case

> “Programmable money workflows”

```text
Event → Condition → Action pipeline
```