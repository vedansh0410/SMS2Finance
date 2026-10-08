package com.vedansh.smssync;

import com.vedansh.smssync.filter.BankSmsFilter;
import com.vedansh.smssync.util.DateUtil;
import org.junit.Test;

import static org.junit.Assert.*;

/**
 * Unit tests verifying Algorithm 1 (Edge-Device Level-1 Bank Transaction Filter)
 * and the 30-day temporal sync boundary.
 */
public class ExampleUnitTest {

    @Test
    public void testBankDebitTransaction_IsRetained() {
        String sender = "HDFCBK";
        String message = "Rs. 450.00 debited from A/c XX1234 to Swiggy on 05-10-24. Avl Bal: Rs. 12000.00.";
        assertTrue(BankSmsFilter.isBankTransaction(sender, message));
    }

    @Test
    public void testBankCreditTransaction_IsRetained() {
        String sender = "SBIINB";
        String message = "Your A/c XX9876 credited with INR 2,500.00 on 05-Oct-24 by UPI. Avl Bal: INR 15,400.00.";
        assertTrue(BankSmsFilter.isBankTransaction(sender, message));
    }

    @Test
    public void testOtpMessage_IsDropped() {
        String sender = "ICICIB";
        String message = "Your OTP for transaction of Rs. 999.00 is 582910. Do not share OTP with anyone.";
        assertFalse(BankSmsFilter.isBankTransaction(sender, message));
    }

    @Test
    public void testPromotionalMessage_IsDropped() {
        String sender = "AXISBK";
        String message = "Congratulations! You are pre-approved for personal loan of Rs. 500000. Apply now at axis.com";
        assertFalse(BankSmsFilter.isBankTransaction(sender, message));
    }

    @Test
    public void testNonBankSender_IsDropped() {
        String sender = "FRIEND";
        String message = "I have paid you Rs. 500 for dinner yesterday.";
        assertFalse(BankSmsFilter.isBankTransaction(sender, message));
    }

    @Test
    public void testDateUtil_WithinThirtyDays() {
        long now = System.currentTimeMillis();
        long twentyDaysAgo = now - (20L * 24 * 60 * 60 * 1000L);
        long thirtyFiveDaysAgo = now - (35L * 24 * 60 * 60 * 1000L);

        assertTrue(DateUtil.isWithinLastThirtyDays(twentyDaysAgo));
        assertFalse(DateUtil.isWithinLastThirtyDays(thirtyFiveDaysAgo));
    }
}