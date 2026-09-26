import { Account, DetectedSignal, RiskBand, RiskSignalRule, Transaction } from '../types';

export const RISK_SIGNAL_RULES: Record<string, RiskSignalRule> = {
  SENDER_SUSPICIOUS: {
    code: 'SENDER_SUSPICIOUS',
    name: 'Sender Already Flagged Suspicious',
    points: 30,
    category: 'Entity Risk',
    description: 'Originating account has prior flags, cyber complaints, or an Under Investigation risk status.',
  },
  LINKED_TO_SUSPICIOUS: {
    code: 'LINKED_TO_SUSPICIOUS',
    name: 'Linked to Known Suspicious Account',
    points: 30,
    category: 'Network Link',
    description: 'Transaction shares direct graph connectivity within 2 hops to an identified mule or cyber crime report.',
  },
  CUSTOMER_DENIES: {
    code: 'CUSTOMER_DENIES',
    name: 'Customer Denies Recognizing Payment',
    points: 40,
    category: 'Behavioral',
    description: 'Customer verification query returned denial, or user marked "Did not authorize / Unrecognized sender".',
  },
  UNUSUAL_AMOUNT: {
    code: 'UNUSUAL_AMOUNT',
    name: 'Unusual Amount / Profile Mismatch',
    points: 20,
    category: 'Velocity & Amount',
    description: 'Credit is significantly above KYC monthly credit range ceiling based on occupation (e.g. >200% threshold).',
  },
  RAPID_MULTIHOP: {
    code: 'RAPID_MULTIHOP',
    name: 'Rapid Multi-Hop Forwarding',
    points: 20,
    category: 'Velocity & Amount',
    description: 'Inward credit was drained/forwarded to next downstream account in under 15 minutes (classic mule layer behavior).',
  },
  NEW_SENDER: {
    code: 'NEW_SENDER',
    name: 'New / First-Time Counterparty',
    points: 10,
    category: 'Behavioral',
    description: 'Sender has zero prior transaction history with the receiving account.',
  },
  UNUSUAL_TIME: {
    code: 'UNUSUAL_TIME',
    name: 'Unusual Temporal Window',
    points: 5,
    category: 'Temporal',
    description: 'Transaction initiated between 01:00 AM and 05:00 AM outside standard user activity windows.',
  },
};

export const getRiskBand = (score: number): RiskBand => {
  if (score >= 76) return 'Critical';
  if (score >= 51) return 'High';
  if (score >= 26) return 'Medium';
  return 'Low';
};

export const getRiskBandColor = (band: RiskBand): { bg: string; text: string; border: string; badge: string } => {
  switch (band) {
    case 'Critical':
      return {
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      };
    case 'High':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      };
    case 'Medium':
      return {
        bg: 'bg-yellow-500/10',
        text: 'text-yellow-400',
        border: 'border-yellow-500/30',
        badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
      };
    case 'Low':
    default:
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      };
  }
};

/**
 * Trigger 1: Profile Mismatch Detector
 * Compares incoming credit amount with receiver KYC profile usual range.
 */
export function evaluateProfileMismatch(amount: number, account?: Account) {
  if (!account) return { isMismatch: false, multiplier: 1, maxLimit: 0, reason: '' };
  
  const [, maxLimit] = account.usual_monthly_credit_range;
  // If credit is strictly above max limit and amount is at least 1.5x of the max range
  if (amount > maxLimit * 1.5) {
    const multiplier = Number((amount / maxLimit).toFixed(1));
    const percentAbove = Math.round(((amount - maxLimit) / maxLimit) * 100);
    return {
      isMismatch: true,
      multiplier,
      maxLimit,
      percentAbove,
      reason: `Incoming ₹${formatINR(amount)} is ${multiplier}x (${percentAbove}% above) the KYC monthly credit ceiling of ₹${formatINR(maxLimit)} for ${account.account_type} (${account.kyc_occupation}).`,
    };
  }

  return {
    isMismatch: false,
    multiplier: Number((amount / maxLimit).toFixed(1)),
    maxLimit,
    percentAbove: 0,
    reason: `Within or near expected baseline range (₹${formatINR(account.usual_monthly_credit_range[0])} - ₹${formatINR(maxLimit)}).`,
  };
}

/**
 * Format currency in Indian Rupees format (e.g. ₹4,85,000)
 */
export function formatINR(val: number): string {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(val);
}

/**
 * Recomputes signals and total risk score for a transaction.
 */
export function computeRiskScore(
  tx: Omit<Transaction, 'risk_score' | 'risk_band' | 'detected_signals'>,
  accountsMap: Map<string, Account>,
  activeSignalCodes?: string[]
): { score: number; band: RiskBand; detectedSignals: DetectedSignal[]; label: 'normal' | 'suspicious' } {
  const sender = accountsMap.get(tx.sender_id);
  const receiver = accountsMap.get(tx.receiver_id);
  
  // Use explicitly provided active signals or calculate baseline
  let codes = activeSignalCodes ? [...activeSignalCodes] : [...tx.signals];

  // Automated sanity checks if not provided:
  if (!activeSignalCodes) {
    // 1. Sender suspicious check
    if (sender && (sender.risk_status === 'Under Investigation' || sender.risk_status === 'Potentially Exposed')) {
      if (!codes.includes('SENDER_SUSPICIOUS')) codes.push('SENDER_SUSPICIOUS');
    }
    // 2. Profile mismatch
    if (receiver) {
      const mismatch = evaluateProfileMismatch(tx.amount, receiver);
      if (mismatch.isMismatch && !codes.includes('UNUSUAL_AMOUNT')) {
        codes.push('UNUSUAL_AMOUNT');
      }
    }
    // 3. Customer denies
    if (tx.evidence?.status === 'denied' && !codes.includes('CUSTOMER_DENIES')) {
      codes.push('CUSTOMER_DENIES');
    }
    // 4. Rapid multi-hop
    if (tx.rapid_forward_minutes !== undefined && tx.rapid_forward_minutes <= 15) {
      if (!codes.includes('RAPID_MULTIHOP')) codes.push('RAPID_MULTIHOP');
    }
  }

  // Deduplicate
  codes = Array.from(new Set(codes));

  const detectedSignals: DetectedSignal[] = codes.map((code) => {
    const rule = RISK_SIGNAL_RULES[code];
    let explanation = rule?.description || 'Signal triggered.';
    if (code === 'UNUSUAL_AMOUNT' && receiver) {
      const pm = evaluateProfileMismatch(tx.amount, receiver);
      if (pm.isMismatch) {
        explanation = pm.reason;
      }
    } else if (code === 'RAPID_MULTIHOP' && tx.rapid_forward_minutes) {
      explanation = `Forwarded to downstream mule in ${tx.rapid_forward_minutes} minutes from inward credit time.`;
    } else if (code === 'SENDER_SUSPICIOUS' && sender) {
      explanation = `Sender ${sender.name} (${sender.id}) currently tagged as "${sender.risk_status}".`;
    } else if (code === 'CUSTOMER_DENIES') {
      explanation = tx.evidence?.denialReason || 'Account holder explicitly responded that this transfer was unrecognized or unauthorized.';
    }

    return {
      code,
      name: rule?.name || code,
      points: rule?.points || 0,
      description: rule?.description || '',
      explanation,
    };
  });

  const totalPoints = detectedSignals.reduce((sum, sig) => sum + sig.points, 0);
  const score = Math.min(100, Math.max(0, totalPoints));
  const band = getRiskBand(score);
  const label: 'normal' | 'suspicious' = score >= 35 ? 'suspicious' : 'normal';

  return {
    score,
    band,
    detectedSignals,
    label,
  };
}
