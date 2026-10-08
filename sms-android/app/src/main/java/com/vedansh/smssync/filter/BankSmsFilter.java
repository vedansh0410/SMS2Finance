package com.vedansh.smssync.filter;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Implements Algorithm 1: Edge-Device Level-1 Bank Transaction Filter.
 * Formally defined in 17_FORMAL_ALGORITHMS.md.
 *
 * Robustly handles all Indian financial institutions, unicode Rupee symbol (₹),
 * diverse transaction phrasing, and prevents false drops due to safety OTP disclaimers.
 */
public class BankSmsFilter {

    private static final Set<String> BANK_SENDERS = new HashSet<>(Arrays.asList(
            "HDFC", "HDFCBK", "HDFCCC", "HDFCLO",
            "SBI", "SBIINB", "SBISMS", "SBIPSG", "SBICRD", "SBIUPI", "SBIPAY", "CBSSBI", "ATMSBI",
            "ICICI", "ICICIB", "ICICIT", "ICICIS", "ICICIP",
            "AXIS", "AXISBK", "AXISBC", "AXISMF",
            "KOTAK", "KOTAKB",
            "PNB", "PNBSMS", "PNBBNK",
            "BOB", "BOBTXN", "BARODA", "BOBSMS",
            "BOI", "BOIIND", "BOISMS",
            "UNION", "UNIONB", "UBISMS",
            "CANBNK", "CANARA",
            "CENTBK", "CBISMS",
            "INDBNK", "INDIANB", "INDUSB", "INDUS",
            "IOBCHN", "IOBSMS",
            "PSBBNK", "UCOBNK",
            "FEDBNK", "FEDERAL",
            "SIBLTD", "KVBANK", "KTKBNK",
            "YESBNK", "YESBK",
            "IDFC", "IDFCFB", "IDFCBK",
            "RBLBNK", "RBLCRD", "RBL",
            "SCBANK", "HSBC", "HSBCBK", "CITIBK", "CITI", "DBS", "DBSBNK",
            "AUBANK", "AUFINB", "EQUTAS", "UJJIVN",
            "PAYTM", "PAYTMB", "AIRTEL", "AIRBNK", "IPPB", "JIOBNK",
            "CRED", "CREDBK", "ONECRD", "SLICE", "JUPITR", "FIMONY",
            "NPCI", "UPI", "BHIM", "GPAY", "PHONPE"
    ));

    private static final String[] PROMOTIONAL_TRIGGERS = {
            "apply now",
            "pre-approved loan",
            "pre approved loan",
            "instant personal loan",
            "call to apply",
            "claim now",
            "congratulations! you are eligible for loan",
            "congratulations! you are pre-approved"
    };

    private static final String[] TRANSACTION_KEYWORDS = {
            "debited",
            "debit",
            "credited",
            "credit",
            "spent",
            "transferred",
            "transfer",
            "paid",
            "pay",
            "payment",
            "received",
            "withdrawn",
            "withdrawal",
            "purchase",
            "sent",
            "txn",
            "transaction",
            "dr",
            "cr",
            "refund",
            "deposited",
            "deducted",
            "auto-debit",
            "autodebit"
    };

    // Regex matching Rs., Rs, INR, and Rupee symbol ₹ (\u20B9)
    private static final Pattern PATTERN_CURRENCY_AMOUNT = Pattern.compile(
            "(?:rs\\.?|inr|inr\\.|[\\u20B9\\u20A8])\\s*([0-9]+(?:,[0-9]+)*(?:\\.[0-9]{1,2})?)|" +
            "([0-9]+(?:,[0-9]+)*(?:\\.[0-9]{1,2})?)\\s*(?:rs\\.?|inr|[\\u20B9\\u20A8])|" +
            "(?:debited|credited|paid|spent|transferred|withdrawn|refund|dr|cr|txn)\\s+(?:by|with|for|of)?\\s*(?:rs\\.?|inr|[\\u20B9\\u20A8])?\\s*([0-9]+(?:,[0-9]+)*(?:\\.[0-9]{1,2})?)",
            Pattern.CASE_INSENSITIVE
    );

    public static boolean isBankTransaction(String sender, String message) {
        if (sender == null || message == null || message.trim().isEmpty()) {
            return false;
        }

        String normalizedSender = sender.toUpperCase(Locale.ROOT);
        String normalizedBody = message.toLowerCase(Locale.ROOT);

        // 1. Bank Header Validation or Banking-Related Text
        boolean isBankHeader = false;
        for (String bank : BANK_SENDERS) {
            if (normalizedSender.contains(bank)) {
                isBankHeader = true;
                break;
            }
        }

        boolean isBankRelatedBody = normalizedBody.contains("bank") ||
                normalizedBody.contains("a/c") ||
                normalizedBody.contains("account") ||
                normalizedBody.contains("upi ref") ||
                normalizedBody.contains("rrn") ||
                normalizedBody.contains("utr") ||
                normalizedBody.contains("vpa") ||
                normalizedBody.contains("card ending") ||
                normalizedBody.contains("ending in");

        if (!isBankHeader && !isBankRelatedBody) {
            return false;
        }

        // 2. Distractor Exclusion: Drop Promotional Spam
        for (String promo : PROMOTIONAL_TRIGGERS) {
            if (normalizedBody.contains(promo)) {
                return false;
            }
        }

        // 3. Distractor Exclusion: Drop Pure Authentication OTPs
        // (Do NOT drop if the message merely includes a security warning like "Never share OTP")
        if (normalizedBody.contains("otp") || normalizedBody.contains("verification code") || normalizedBody.contains("one time password")) {
            boolean isOtpDelivery = normalizedBody.contains("your otp") ||
                    normalizedBody.contains("is the otp") ||
                    normalizedBody.contains("otp is") ||
                    normalizedBody.contains("use otp") ||
                    normalizedBody.contains("otp for") ||
                    normalizedBody.contains("verification code");

            boolean isExecutedTransaction = (normalizedBody.contains("debited from") ||
                    normalizedBody.contains("credited to") ||
                    normalizedBody.contains("spent on") ||
                    normalizedBody.contains("withdrawn from") ||
                    normalizedBody.contains("has been debited") ||
                    normalizedBody.contains("has been credited") ||
                    normalizedBody.contains("transfer to") ||
                    normalizedBody.contains("paid to") ||
                    normalizedBody.contains("sent to")) &&
                    (normalizedBody.contains("never share") || normalizedBody.contains("not share") || normalizedBody.contains("bank never asks"));

            if (isOtpDelivery && !isExecutedTransaction) {
                return false;
            }
        }

        // 4. Transaction Intent Check
        boolean hasTxnKeyword = false;
        for (String kw : TRANSACTION_KEYWORDS) {
            if (normalizedBody.contains(kw)) {
                hasTxnKeyword = true;
                break;
            }
        }
        if (!hasTxnKeyword) {
            return false;
        }

        // 5. Currency Amount Verification
        return PATTERN_CURRENCY_AMOUNT.matcher(normalizedBody).find();
    }
}