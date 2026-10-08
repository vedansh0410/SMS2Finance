# FinSight AI (SMS2Finance) — Setup & Operational Runbook

> **Document Scope**: Prerequisites checklist, end-to-end local startup guide, commands for Windows PowerShell and Linux, and troubleshooting procedures.  
> **Repository Root**: [FinSight-AI](file:///c:/Users/HP/Downloads/SMS2Finance)

---

## 1. Prerequisites Checklist

Ensure the following runtimes and tools are installed:

| Requirement | Recommended Version | Verification Command |
|---|---|---|
| **Java Development Kit (JDK)** | **Java 21 LTS** | `java -version` |
| **Python** | **Python 3.10 - 3.12** | `python --version` |
| **Node.js & npm** | **Node.js 18+ LTS** | `node -v && npm -v` |
| **PostgreSQL** | **PostgreSQL 14 - 16** | `psql --version` |
| **Apache Maven** | **Maven 3.9+** | `mvn -v` |
| **Android Studio** | **Iguana / Hedgehog (API 34)** | Open SDK Manager |

---

## 2. Step-by-Step Local Startup Sequence

Services must be initialized in the following order:

```text
1. PostgreSQL Database ──> 2. Python ML Service ──> 3. Spring Boot API ──> 4. React Dashboard ──> 5. Android Client
   (Port 5432)                (Port 8000)             (Port 8080)           (Port 3000)          (Mobile Edge)
```

---

### Step 1: PostgreSQL Database Initialization
1. Ensure the PostgreSQL service is active.
2. Create the target application database:
```sql
CREATE DATABASE sms_sync_db;
```
3. Verify connection configuration in [`smssyncserverBACKEND/src/main/resources/application.properties`](file:///c:/Users/HP/Downloads/SMS2Finance/smssyncserverBACKEND/src/main/resources/application.properties):
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/sms_sync_db
spring.datasource.username=postgres
spring.datasource.password=12345678
```

---

### Step 2: Python AI/ML Service (`ai-ml`)
1. Navigate to the `ai-ml` directory:
```bash
cd ai-ml
```
2. Create and activate a Python virtual environment:
```powershell
# Windows PowerShell
python -m venv venv
.\venv\Scripts\Activate.ps1
```
```bash
# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```
3. Install package dependencies:
```bash
pip install -r requirements.txt
```
4. Start the FastAPI microservice:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
5. **Verify Health**: Open `http://localhost:8000/health` in your browser. Expected response:
```json
{"status":"UP","service":"sms2finance-ml","version":"1.0.0-hybrid"}
```

---

### Step 3: Spring Boot Core Backend (`smssyncserverBACKEND`)
1. Navigate to the backend directory:
```bash
cd smssyncserverBACKEND
```
2. Compile and run the service via Maven:
```bash
mvn clean compile
mvn spring-boot:run
```
3. **Verify API**: Open `http://localhost:8080/api/sms` in your browser. Expected response: `[]` (empty JSON array).

---

### Step 4: React Analytics Dashboard (`frontend`)
1. Navigate to the frontend directory:
```bash
cd frontend
```
2. Install Node dependencies:
```bash
npm install
```
3. Start the Vite development server:
```bash
npm run dev
```
4. **Access Dashboard**: Open `http://localhost:3000` in your web browser.

---

### Step 5: Android Edge Client (`sms-android`)
1. Open the `sms-android/` folder in **Android Studio**.
2. Configure your workstation's IP in [`RetrofitClient.java`](file:///c:/Users/HP/Downloads/SMS2Finance/sms-android/app/src/main/java/com/vedansh/smssync/network/RetrofitClient.java):
   - For **Android Emulator**: Use `http://10.0.2.2:8080/`
   - For **Physical Android Device**: Use your workstation's local WiFi IP (e.g., `http://192.168.1.105:8080/`). Ensure phone and PC are on the same WiFi network.
3. Build and launch the application on your test device.
4. When prompted, grant the `READ_SMS` permission.
5. Tap **Sync SMS** to initiate edge filtering and sequential ingestion.

---

## 3. Deep Troubleshooting Guide

### Failure Mode 1: PostgreSQL Connection Refused
* **Symptom**: Spring Boot fails to start with `PSQLException: Connection to localhost:5432 refused`.
* **Fix**: Ensure PostgreSQL is running (`net start postgresql-x64-16` on Windows or `sudo systemctl start postgresql` on Linux). Verify the password in `application.properties`.

### Failure Mode 2: Python ML Service Connection Timeout
* **Symptom**: Spring Boot logs `Python ML parser service unreachable or returned error for SMS ID ...`.
* **Fix**: Check that `uvicorn` is actively running on port 8000. Test with `curl http://localhost:8000/health`.

### Failure Mode 3: Android Network Error / CleartEXT Permitted
* **Symptom**: Android logs `CLEARTEXT communication to ... not permitted by network security policy`.
* **Fix**: Check [`network_security_config.xml`](file:///c:/Users/HP/Downloads/SMS2Finance/sms-android/app/src/main/res/xml/network_security_config.xml) to verify cleartext traffic is permitted for your local IP subnet, and check Windows Firewall settings for port 8080.

### Failure Mode 4: Port Conflicts (8080, 8000, 3000)
* **Symptom**: `Web server failed to start. Port 8080 was already in use.`
* **Fix**: Run `Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess | Stop-Process` in PowerShell to terminate existing processes.
