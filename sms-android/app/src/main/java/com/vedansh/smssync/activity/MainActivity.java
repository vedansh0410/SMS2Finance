package com.vedansh.smssync.activity;

import android.content.pm.PackageManager;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.vedansh.smssync.R;
import com.vedansh.smssync.model.SmsModel;
import com.vedansh.smssync.service.SmsReaderService;
import com.vedansh.smssync.service.SmsUploadService;
import com.vedansh.smssync.storage.SyncPreference;
import com.vedansh.smssync.util.PermissionUtil;

import java.util.List;

public class MainActivity extends AppCompatActivity {

    private TextView txtPermission;
    private TextView txtResult;

    private Button btnPermission;
    private Button btnReadSms;
    private Button btnSyncAll30Days;

    private SmsReaderService smsReaderService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_main);

        // Initialize UI
        txtPermission = findViewById(R.id.txtPermission);
        txtResult = findViewById(R.id.txtResult);

        btnPermission = findViewById(R.id.btnPermission);
        btnReadSms = findViewById(R.id.btnReadSms);
        btnSyncAll30Days = findViewById(R.id.btnSyncAll30Days);

        // Initialize SMS reader
        smsReaderService = new SmsReaderService();

        // Check current permission
        updatePermissionStatus();

        // Permission button
        btnPermission.setOnClickListener(v -> {

            if (!PermissionUtil.hasSmsPermission(this)) {

                PermissionUtil.requestSmsPermission(this);

            } else {

                txtPermission.setText(
                        "Permission Status : Granted"
                );

                Toast.makeText(
                        this,
                        "SMS permission already granted.",
                        Toast.LENGTH_SHORT
                ).show();
            }
        });

        // Read SMS button (Incremental sync for past 30 days)
        btnReadSms.setOnClickListener(v -> {
            syncSms(false);
        });

        // Force Re-Scan All Past 30 Days (Resets checkpoint to ensure all past 30 days are read)
        btnSyncAll30Days.setOnClickListener(v -> {
            SyncPreference.resetLastSync(this);
            syncSms(true);
        });
    }

    private void syncSms(boolean forceAllThirtyDays) {
        // Check permission
        if (!PermissionUtil.hasSmsPermission(this)) {

            Toast.makeText(
                    this,
                    "Please grant SMS permission first.",
                    Toast.LENGTH_SHORT
            ).show();

            return;
        }

        // Read SMS
        List<SmsModel> smsList =
                smsReaderService.readInbox(this, forceAllThirtyDays);

        // Show number of bank transaction SMS found
        txtResult.setText(
                "SMS Count : " + smsList.size()
        );

        if (smsList.isEmpty()) {
            Toast.makeText(
                    this,
                    "0 new SMS found. Tap 'Force Re-Scan' to check entire 30-day inbox.",
                    Toast.LENGTH_LONG
            ).show();
            return;
        }

        Toast.makeText(
                this,
                "Found " + smsList.size() + " bank transaction SMS. Uploading...",
                Toast.LENGTH_SHORT
        ).show();

        // Upload SMS sequentially
        SmsUploadService uploadService =
                new SmsUploadService(this);

        uploadService.uploadSmsList(smsList);
    }

    /**
     * Update permission status on screen.
     */
    private void updatePermissionStatus() {

        if (PermissionUtil.hasSmsPermission(this)) {

            txtPermission.setText(
                    "Permission Status : Granted"
            );

        } else {

            txtPermission.setText(
                    "Permission Status : Not Granted"
            );
        }
    }

    /**
     * Called after Android permission dialog.
     */
    @Override
    public void onRequestPermissionsResult(
            int requestCode,
            @NonNull String[] permissions,
            @NonNull int[] grantResults) {

        super.onRequestPermissionsResult(
                requestCode,
                permissions,
                grantResults
        );

        if (requestCode == PermissionUtil.SMS_PERMISSION_CODE) {

            if (grantResults.length > 0 &&
                    grantResults[0] ==
                            PackageManager.PERMISSION_GRANTED) {

                txtPermission.setText(
                        "Permission Status : Granted"
                );

                Toast.makeText(
                        this,
                        "SMS permission granted.",
                        Toast.LENGTH_SHORT
                ).show();

            } else {

                txtPermission.setText(
                        "Permission Status : Permission Denied"
                );

                Toast.makeText(
                        this,
                        "SMS permission denied.",
                        Toast.LENGTH_SHORT
                ).show();
            }
        }
    }
}