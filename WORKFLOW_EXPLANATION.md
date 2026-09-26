# FraudChain Guard — System Workflow & Technical Architecture Dossier
**Transaction Risk & Fraud-Chain Detection System for Banking & Payment Rails**

---

## 📌 Executive Summary

Modern financial crime has evolved beyond isolated single-transaction scams. Criminal syndicates today utilize **Money Mule Networks** and **Rapid Forwarding (UPI Smurfing)** — routing stolen funds across 4 to 6 intermediary accounts within 90 to 120 seconds to prevent manual banking intervention before funds exit into untraceable cryptocurrency or ATM cash-outs.

**FraudChain Guard** is an autonomous, high-throughput AML/CFT transaction risk engine and multi-hop graph detection system designed for banks, payment aggregators, and regulatory bodies (RBI / FIU-IND / National Cyber Crime Reporting Portal 1930).

---

## 🏛️ System Architecture Flow

```text
[ Core Payment Switch / UPI Gateway ]
                  │
                  ▼
┌──────────────────────────────────────────────┐
│       Stage 1: Ingestion & Telemetry         │
│  • Transaction Payload (Amount, Sender, Recv)│
│  • Device Fingerprint Hash                   │
│  • IP Geo-Velocity (Speed between logins)    │
│  • Customer Declared KYC Profile Baseline    │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│       Stage 2: Hybrid Risk Engine (<50ms)    │
│  • Dynamic Risk Score Calculator (0 - 100)   │
│  • Mule Account Ring Heuristics              │
│  • Declared Income vs Velocity Mismatch      │
│  • Rapid Forwarding Decay Tracker            │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│       Stage 3: Graph Traversal Engine        │
│  • Recursive Downstream Path Reconstruction  │
│  • Multi-Hop Mule Ring Identification        │
│  • Fan-out & Layering Ratio Detection        │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│       Stage 4: Automated Containment         │
│  • Low Risk (<40): Instant Settlement        │
│  • Medium Risk (40-69): Step-Up 2FA          │
│  • High/Critical (>=70):                     │
│      ├─ 15-Minute Temporary Hold             │
│      ├─ SMS Customer Evidence Gateway        │
│      └─ 1-Click Multi-Node Ring Freeze       │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│       Stage 5: Investigation & Regulatory    │
│  • FIU-IND Suspicious Activity Report (SAR)  │
│  • 1930 Cyber Crime Portal FIR Matching      │
│  • Forensic Audit Trail & Immutable Log      │
└──────────────────────────────────────────────┘
```

---

## 🔬 Core Fraud Detection Engines

### 1. Mule Account Ring Detection
- **Mechanism:** Monitors dormant or low-activity accounts that suddenly receive an abnormal inflow (e.g., student account receiving ₹4.8 Lakhs) followed by immediate fan-out transfers to 3+ newly added payees within 10 minutes.
- **Rule Action:** Automatically flags the intermediary node as `Mule Account (Layer 1 / Layer 2)` and isolates downstream edges.

### 2. Rapid Forwarding & Hop Velocity
- **Mechanism:** When Account B forwards >85% of funds received from Account A to Account C within 120 seconds, the transaction edge is marked with high velocity penalty.
- **Rule Action:** Immediate temporary freeze placed on Account B's debit channel to arrest fund dissipation.

### 3. Profile & Declared Income Mismatch
- **Mechanism:** Cross-references transaction value against declared occupation and income brackets registered during KYC.
- **Rule Action:** E.g., An account registered with `< ₹1.5L Annual Income (Student)` receiving a single transfer of `₹3.75L` triggers an instant `+19.2x KYC Limit Anomaly` alert.

### 4. Device Fingerprinting & Impossible Geo-Velocity
- **Mechanism:** Evaluates physical velocity between consecutive logins.
- **Rule Action:** If a login occurs in Mumbai followed by a transaction request in Singapore 20 minutes later (>800 km/h impossible travel speed), biometric step-up authentication is mandated.

---

## 🎤 How to Explain This Project (Viva / Interview / Evaluator Script)

### 2-Minute Elevator Pitch (Hindi / English):
> *"Sir/Ma'am, traditional banks evaluate fraud on a single transaction basis. But today's cyber criminals use **Money Mule Networks** — unhone ek victim se paisa nikala aur 90 seconds ke andar 4 alag-alag mule accounts me divide (smurf) kar diya.*
>
> *Humne develop kiya hai **FraudChain Guard**: Ek intelligent transaction risk aur multi-hop fraud-chain detection system. Ye transactions ko real-time graph format me visualize karta hai, rapid forwarding identify karta hai, customer ke declared income se mismatch pakadta hai, aur suspicious mule accounts ko 1-click me freeze kar deta hai along with automated SAR (Suspicious Activity Report) generation for RBI and 1930 Cyber Cell."*

---

## ❓ Top 4 Reviewer Questions & Ready Answers

### Q1: How do you prevent blocking genuine customers (False Positives)?
**Answer:** We implement a graded 4-tier risk band. For Medium/High risk, we don't immediately lock the account permanently; instead, we initiate a **Temporary 15-minute Hold** and send a secure Customer Verification SMS. The customer can confirm legitimate high-value purchases with one tap or upload an invoice, immediately restoring the transaction.

### Q2: How does the Graph Engine detect money mules?
**Answer:** Accounts are represented as nodes and transactions as directed weighted edges. When a transaction arrives, we trace downstream path length (hops) and time intervals. A mule account typically exhibits high in-degree followed immediately by high out-degree with minimal balance retention.

### Q3: What technologies are used in this implementation?
**Answer:** Frontend built with modern React 19, TypeScript, and Tailwind CSS. The graph engine renders dynamic multi-hop nodes and animated edges. The risk engine is modular, combining deterministic rule evaluation with Gemini AI copilot for contextual fraud investigation.

### Q4: How does it integrate with Law Enforcement and National Cyber Crime Portal?
**Answer:** It provides a dedicated 1930 / I4C Cyber Crime Complaint simulator. When an FIR or citizen complaint is registered with a Transaction ID, the system matches the chain, freezes all descendant beneficiary accounts, and generates an official Suspicious Activity Report (SAR).

---

## 📄 How to Export / Print PDF

1. In the FraudChain Guard app, click the green **"Workflow PDF"** button in the top header (or the floating button at bottom-left).
2. Click **"Print / Save as PDF"**.
3. In the browser print dialog, choose Destination: **"Save as PDF"** ➔ Click **Save**.
4. You will get a clean, multi-page, formatted PDF ready for submission, viva presentation, or client demonstration!
