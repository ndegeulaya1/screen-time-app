# Screen Time POC Results

Architecture Standard Version: 0.1
Expo SDK Baseline: SDK 57
Last Reviewed: 2026-08-20
Owner: Mobile Engineering

This file is the Phase 0 exit document, updated after Samsung SM_A075F testing.

V1 lock: **overlay restriction**. Device Admin / `lockNow()` is optional and OEM-dependent.

Native compile check: `./gradlew :app:compileDebugKotlin` succeeded on 2026-08-20 (Expo SDK 57, compileSdk 36, Kotlin 2.1.20). `screen-time` autolinked as `0.1.0`.

## How to run the POC

Expo Go cannot run this app.

```bash
cd screen
npx expo run:android --device
```

Then:

1. Grant Usage Access, Overlay, and Notifications from the harness.
2. Use **Test Usage** and **Test Installed Apps**.
3. Use **Test Restriction (2 min watch)** and open the target app. Do not rely on an in-app route.
4. Use **Test Notification (10s)** and background/kill the app.
5. Use **Test Sleep (now + 2m → +5m)** and kill or reboot.
6. Use **Test Lock**. Device Admin is optional and only needed for `lockNow()`.
7. Revoke Usage Access in system settings and reopen the app. The harness must show a real error, not a silent failure.

## Implementation status

| Capability | Native mechanism | Code status |
| --- | --- | --- |
| Usage today / per-app | `UsageStatsManager` | Implemented |
| Installed apps | Launcher `PackageManager` query (no `QUERY_ALL_PACKAGES`) | Implemented |
| Limit math | TypeScript `src/utils/limits.ts` | Implemented |
| Limit watch | Native SharedPreferences + FGS poll (~800ms) | Implemented |
| App restriction | `SYSTEM_ALERT_WINDOW` + `BlockOverlayActivity` from FGS | Implemented |
| Sleep schedule | `AlarmManager.setAlarmClock` | Implemented |
| Sleep skip (tonight only) | Overlay hours/minutes → `sleep_skip_until_ms`; app-limit overlay has no skip | Implemented |
| Time-to-sleep notification | Native `NotificationManager` from `BroadcastReceiver` | Implemented |
| Reboot restore | `BOOT_COMPLETED` → restore alarms + FGS | Implemented |
| Device lock overlay | Same overlay Activity | Implemented |
| `lockNow()` | Device Admin only; fails closed if admin is inactive | Implemented |
| JS `setInterval` enforcement | Forbidden | Not used |
| In-app `/blocked` fake | Forbidden | Not used |

## Desired TypeScript interface vs Android reality

| Method | Ordinary Play-distributed app |
| --- | --- |
| `getInstalledApps` | Supported (launcher apps) |
| `getUsageToday` / `getUsageForApp` | Supported with Usage Access |
| `hasUsagePermission` / `openUsageSettings` | Supported |
| `hasOverlayPermission` / `openOverlaySettings` | Supported |
| `restrictApp` / `unrestrictApp` | Overlay-based restriction. Not a true OS disable. |
| `scheduleSleepMode` / `cancelSleepMode` | Supported via AlarmManager; exact alarms may need user grant on Android 12+ |
| `lockDevice` overlay | Supported if overlay permission is granted |
| `lockDevice` `lockNow()` | Optional. Permission required (Device Admin). Often unavailable on Samsung One UI. |
| `openDeviceAdminSettings` | Must start from the current Activity. Returns `{ opened, deviceAdminActive, note }`. Void `null` in the old harness was not a failure. |
| AccessibilityService | Not implemented. Fallback only if overlay/usage polling fails on device. |

## Test matrix

| Test | Expected | Device result |
| --- | --- | --- |
| Read usage | Pass | Yes (SM_A075F) |
| Read today's usage | Pass | Yes (SM_A075F) |
| Read historical usage (today aggregate) | Pass | Yes (SM_A075F) |
| Detect installed apps | Pass | Yes (SM_A075F) |
| Identify package names | Pass | Yes (SM_A075F) |
| Detect limit reached | Pass | Yes (SM_A075F) |
| Schedule future event | Pass | Yes (SM_A075F) |
| Notification while app closed | Pass | Pending |
| Sleep restriction | High risk | Yes overlay (SM_A075F) |
| App restriction | High risk | Yes overlay (SM_A075F) |
| Raise limit after block | Pass | Pending (native unrestrict when usage is under the new limit) |
| Sleep skip tonight | Pass | Pending (sleep overlay only; hours/minutes; capped at sleep end) |
| Device lock (`lockNow`) | High risk | OEM-dependent / not required for V1 |
| Survive app termination | High risk | Pending |
| Survive reboot | High risk | Pending |
| Recover after permission revoked | High risk | Pending |

Fill Device result with **Yes**, **No**, or **OEM-dependent** after a real-device run.

## Exit questions

Copy the answers here after device testing:

- Can we reliably obtain per-app usage? **Yes**
- Can sleep events happen without React Native being active? **Pending**
- Can we prevent access to a selected app with a supported mechanism for a normal Play-distributed app? **Yes (overlay)**
- Can we trigger the desired device-lock behavior? **Overlay yes. Device Admin `lockNow()` OEM-dependent; not required for V1.**
- Do schedules/restrictions recover after reboot? **Pending**
- Does enforcement work when the RN app is not open? **Pending (overlay path implemented natively)**

## Known Android limitations (research, confirm on device)

- Ordinary apps cannot disable another app. Overlay + foreground detection is the Play-friendlier path; it can be bypassed via Recents or OEM quirks (especially Pixel recents).
- `UsageStatsManager` foreground detection is polled (~800ms), not instant.
- `QUERY_ALL_PACKAGES` is Play-restricted; the POC lists launcher apps only.
- `USE_EXACT_ALARM` / `SCHEDULE_EXACT_ALARM` may be policy-sensitive for Play. The POC falls back to inexact alarms if exact scheduling is denied.
- Device Admin `lockNow()` is legacy and often hidden on Samsung One UI. V1 bedtime lock is overlay. `ACTION_ADD_DEVICE_ADMIN` must be started from the current Activity; a JS `null` result only meant the old method returned void.
- AccessibilityService is more reliable for blocking and lock-screen, but is the harder Play review path. Do not enable it unless the primary path fails on device.
- Battery saver and OEM task killers can still stop a foreground service. That is a Phase 7 reliability concern.

## Verdict key

Use this when filling device results:

- Supported
- Permission required
- Role required
- Unavailable to ordinary apps
- Manufacturer-dependent
