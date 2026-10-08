package com.vedansh.smssync.util;

public class DateUtil {

    private static final long THIRTY_DAYS_IN_MILLIS =
            30L * 24 * 60 * 60 * 1000L;

    /**
     * Checks if the given timestamp is within the past 30 days.
     */
    public static boolean isWithinLastThirtyDays(long smsTimestamp) {
        long currentTime = System.currentTimeMillis();
        return (currentTime - smsTimestamp) <= THIRTY_DAYS_IN_MILLIS;
    }

    /**
     * Backward-compatible alias directing to the 30-day window policy.
     */
    public static boolean isWithinLastTenDays(long smsTimestamp) {
        return isWithinLastThirtyDays(smsTimestamp);
    }
}