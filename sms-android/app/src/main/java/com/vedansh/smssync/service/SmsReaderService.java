package com.vedansh.smssync.service;

import android.content.Context;
import android.database.Cursor;
import android.provider.Telephony;
import android.util.Log;

import com.vedansh.smssync.filter.BankSmsFilter;
import com.vedansh.smssync.model.SmsModel;
import com.vedansh.smssync.storage.SyncPreference;
import com.vedansh.smssync.util.DateUtil;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class SmsReaderService {

    public List<SmsModel> readInbox(Context context) {
        return readInbox(context, false);
    }

    public List<SmsModel> readInbox(Context context, boolean ignoreLastSync) {

        List<SmsModel> smsList =
                new ArrayList<>();

        long lastSync =
                ignoreLastSync ? 0 : SyncPreference.getLastSync(context);

        Log.d(
                "SMS_SYNC",
                "================================"
        );

        Log.d(
                "SMS_SYNC",
                "LAST SYNC CHECKPOINT = " + lastSync + " (ignoreLastSync=" + ignoreLastSync + ")"
        );

        String[] projection = {
                Telephony.Sms.ADDRESS,
                Telephony.Sms.BODY,
                Telephony.Sms.DATE
        };

        Cursor cursor =
                context.getContentResolver().query(
                        Telephony.Sms.CONTENT_URI,
                        projection,
                        null,
                        null,
                        Telephony.Sms.DEFAULT_SORT_ORDER
                );

        if (cursor == null) {

            Log.e(
                    "SMS_SYNC",
                    "Cursor is NULL"
            );

            return smsList;
        }

        int totalRead = 0;
        int olderThanThirtyDays = 0;
        int alreadySynced = 0;
        int nonBankSms = 0;
        int bankSms = 0;

        try {

            int addressIndex =
                    cursor.getColumnIndexOrThrow(
                            Telephony.Sms.ADDRESS
                    );

            int bodyIndex =
                    cursor.getColumnIndexOrThrow(
                            Telephony.Sms.BODY
                    );

            int dateIndex =
                    cursor.getColumnIndexOrThrow(
                            Telephony.Sms.DATE
                    );

            while (cursor.moveToNext()) {

                totalRead++;

                String sender =
                        cursor.getString(addressIndex);

                String message =
                        cursor.getString(bodyIndex);

                long timestamp =
                        cursor.getLong(dateIndex);

                /*
                 * Only process SMS from
                 * the last 30 days.
                 */
                if (!DateUtil.isWithinLastThirtyDays(
                        timestamp)) {

                    olderThanThirtyDays++;
                    continue;
                }

                /*
                 * Ignore SMS already synchronized if incremental sync.
                 */
                if (!ignoreLastSync && timestamp <= lastSync) {

                    alreadySynced++;
                    continue;
                }

                /*
                 * Ignore non-bank SMS (Algorithm 1 Filter).
                 */
                if (!BankSmsFilter.isBankTransaction(
                        sender,
                        message)) {

                    nonBankSms++;
                    continue;
                }

                bankSms++;

                smsList.add(
                        new SmsModel(
                                sender,
                                message,
                                timestamp
                        )
                );

            }

        } finally {

            cursor.close();
        }

        /*
         * ContentResolver gives newest -> oldest.
         *
         * Synchronization must happen oldest -> newest.
         */
        smsList.sort(
                Comparator.comparingLong(
                        SmsModel::getTimestamp
                )
        );

        Log.d(
                "SMS_SYNC",
                "================================"
        );

        Log.d(
                "SMS_SYNC",
                "TOTAL SMS READ       = "
                        + totalRead
        );

        Log.d(
                "SMS_SYNC",
                "OLDER THAN 30 DAYS   = "
                        + olderThanThirtyDays
        );

        Log.d(
                "SMS_SYNC",
                "ALREADY SYNCED       = "
                        + alreadySynced
        );

        Log.d(
                "SMS_SYNC",
                "NON BANK SMS         = "
                        + nonBankSms
        );

        Log.d(
                "SMS_SYNC",
                "BANK SMS TO UPLOAD   = "
                        + bankSms
        );

        Log.d(
                "SMS_SYNC",
                "UPLOAD ORDER         = OLDEST -> NEWEST"
        );

        Log.d(
                "SMS_SYNC",
                "================================"
        );

        return smsList;
    }
}