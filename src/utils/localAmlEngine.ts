import { Account, Transaction } from '../types';
import { formatINR } from './riskEngine';

export function generateLocalAmlResponse(
  query: string,
  transactions: Transaction[],
  accounts: Account[]
): string {
  const q = query.toLowerCase();
  const flagged = transactions.filter((t) => t.label === 'suspicious');
  const chainTxns = transactions.filter((t) => t.is_fraud_chain_part);
  const totalVolume = transactions.reduce((acc, t) => acc + t.amount, 0);

  // 1. Fraud Chain / Mule Ring query
  if (q.includes('chain') || q.includes('mule') || q.includes('hop') || q.includes('layer') || q.includes('forward')) {
    return `### 🔍 Multi-Hop Fraud Chain Telemetry (4-Hop Rapid Layering Ring)

Our graph engine detected a textbook high-velocity laundering chain draining **₹5,00,000** down to **₹4,50,000** in **under 15 minutes**:

1. **Hop 1 (Victim Inflow)**: \`TXN-0103\` — Amit Sharma (Victim) ➔ Vikas Malhotra (Phishing Collector)
   • Amount: ₹5,00,000 via UPI at 09:14 AM
   • Ground: Reported on 1930 NCRP Portal (*NCRP-2025-88392*)
2. **Hop 2 (Rapid Layer 1)**: \`TXN-0104\` — Vikas Malhotra ➔ Rohan Verma (Student Mule)
   • Amount: ₹4,80,000 (Forwarded in **4 minutes**)
   • Trigger: Profile Mismatch (Student monthly ceiling is ₹30,000)
3. **Hop 3 (Rapid Layer 2)**: \`TXN-0105\` — Rohan Verma ➔ Sunita Devi (Homemaker Mule)
   • Amount: ₹4,65,000 (Forwarded in **6 minutes**)
   • Trigger: Profile Mismatch (Homemaker monthly ceiling is ₹50,000)
4. **Hop 4 (Cash-Out Sink)**: \`TXN-0106\` — Sunita Devi ➔ Bharat Crypto Traders
   • Amount: ₹4,50,000 (Forwarded in **3 minutes**)
   • Disposition: P2P Merchant Sink / Cash-out point

**Forensic Assessment**: 90% of stolen funds moved across 4 accounts in 13 minutes. Immediate nodal account freeze advised on Hop 2 and Hop 3 accounts.`;
  }

  // 2. Profile Mismatch / Student / Homemaker
  if (q.includes('profile') || q.includes('mismatch') || q.includes('student') || q.includes('homemaker') || q.includes('kyc')) {
    return `### ⚠️ Trigger 1: KYC Profile Mismatch Analysis

The risk engine checks incoming credits against the account's historical KYC credit ceiling:

• **Student Account (\`ACC-003\` - Rohan Verma)**:
  - Usual Monthly Inward Range: ₹5,000 – ₹30,000
  - Inward Credit Received: **₹4,80,000** (16× monthly ceiling)
  - Anomaly Factor: **+1,500% over limit**
  - Score Impact: \`+20 pts\` (PROFILE_MISMATCH) + \`+20 pts\` (RAPID_FORWARD)

• **Homemaker Account (\`ACC-004\` - Sunita Devi)**:
  - Usual Monthly Inward Range: ₹10,000 – ₹50,000
  - Inward Credit Received: **₹4,65,000** (9.3× monthly ceiling)
  - Anomaly Factor: **+830% over limit**

**Regulatory Compliance**: Under RBI Master Directions on KYC & AML, incoming credits exceeding 300% of declared profile require immediate proof-of-funds verification.`;
  }

  // 3. Cyber Complaint / 1930 / Evidence Request
  if (q.includes('complaint') || q.includes('1930') || q.includes('ncrp') || q.includes('evidence') || q.includes('proof')) {
    return `### 🚨 Trigger 2: 1930 NCRP Cyber Complaint & Evidence Protocol

When an analyst or cyber cell logs a complaint against a transaction:
1. **Automated Evidence Request**: An SMS/Email advisory is dispatched to the beneficiary asking for invoice, contract, or rationale.
2. **Corporate & Current Account Scrutiny**: High-value business accounts face zero-tolerance scrutiny (even 1 complaint mandates formal invoice upload).
3. **Additive Score Elevation**:
   - Customer Confirms with Valid Invoice ➔ Case marked **Customer Confirmed**
   - Customer Denies Knowledge ➔ \`+40 pts\` added immediately, elevating score into **Critical (76-100)** band.
   - No response within 24h ➔ Auto-escalation to nodal fraud cell.`;
  }

  // 4. Risk Scoring Engine / Weights
  if (q.includes('score') || q.includes('formula') || q.includes('additive') || q.includes('weight') || q.includes('signals')) {
    return `### 🧮 Additive Risk Scoring Architecture

FraudChain Guard computes scores on a clean **0–100 spectrum** using transparent additive rules:

| Signal Name | Weight | Condition Triggered |
| :--- | :---: | :--- |
| **CUSTOMER_DENIES** | \`+40\` | Recipient explicitly denies recognizing the deposit |
| **SENDER_SUSPICIOUS** | \`+30\` | Sending counterparty already has active AML flags |
| **LINKED_TO_SUSPICIOUS** | \`+30\` | Graph distance ≤ 2 from a known mule/complaint node |
| **PROFILE_MISMATCH** | \`+20\` | Inward credit exceeds 2× declared monthly ceiling |
| **RAPID_MULTIHOP** | \`+20\` | Inward funds forwarded out in < 15 minutes |
| **NEW_SENDER** | \`+10\` | Counterparty has no prior transaction history |
| **UNUSUAL_TIME** | \`+5\` | Execution between 01:00 AM – 05:00 AM |

**Risk Bands**: Low (0–25) | Medium (26–50) | High (51–75) | Critical (76–100)`;
  }

  // 5. SAR Report / Regulatory filing
  if (q.includes('sar') || q.includes('suspicious activity') || q.includes('fiu') || q.includes('report') || q.includes('draft')) {
    return `### 📋 FIU-IND Suspicious Activity Report (SAR) Briefing Draft

**Filing Reference**: SAR-EXP-${Date.now().toString().slice(-6)}
**Reporting Entity**: FraudChain Guard Core Banking AML Unit
**Subjects of Interest**:
1. Vikas Malhotra (\`ACC-002\`, Phishing Inflow Mule)
2. Rohan Verma (\`ACC-003\`, Student Tier-1 Mule)
3. Sunita Devi (\`ACC-004\`, Homemaker Tier-2 Mule)

**Grounds for Suspicion**:
• Rapid velocity layering: ₹5,00,000 transferred across 4 accounts in 13 mins.
• Extreme profile divergence on student/homemaker accounts (>900% above historical profile).
• Origin linked to 1930 Cyber Cell victim complaint (*NCRP-2025-88392*).
• Immediate liquidation attempt via P2P crypto merchant (*Bharat Crypto Traders*).

**Recommended Action**: Issue Section 91 CrPC freeze advisory and dispatch STR to Financial Intelligence Unit (FIU-IND).`;
  }

  // General overview
  return `### 🛡️ FraudChain Guard Real-Time System Intelligence

**Active Monitored Ledger Telemetry**:
• Total Monitored Volume: **₹${formatINR(totalVolume)}** across **${transactions.length} transactions**
• Flagged High-Risk Transactions: **${flagged.length} cases**
• Critical Mule Chain Path: **${chainTxns.length} hops detected** (₹5,00,000 victim inflow)
• Accounts Under Surveillance: **${accounts.filter((a) => a.risk_status !== 'Normal').length} accounts**

You can inspect any transaction in the **Fraud Chain Graph** view, simulate customer SMS verification, or test additive weight combinations in the **Risk Engine Simulator**!`;
}
