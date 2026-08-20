package expo.modules.screentime

import android.Manifest
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.app.ActivityCompat
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoScreenTimeModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoScreenTime")

    AsyncFunction("getInstalledApps") {
      InstalledAppsHelper.getInstalledApps(requireContext())
    }

    AsyncFunction("getUsageToday") {
      UsageStatsHelper.getUsageToday(requireContext())
    }

    AsyncFunction("getUsageForApp") { packageName: String ->
      UsageStatsHelper.getUsageForApp(requireContext(), packageName)
    }

    AsyncFunction("hasUsagePermission") {
      UsageStatsHelper.hasUsagePermission(requireContext())
    }

    AsyncFunction("openUsageSettings") {
      val context = requireContext()
      val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      context.startActivity(intent)
    }

    AsyncFunction("hasOverlayPermission") {
      MonitorController.hasOverlayPermission(requireContext())
    }

    AsyncFunction("openOverlaySettings") {
      val context = requireContext()
      val intent = Intent(
        Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
        Uri.parse("package:${context.packageName}"),
      ).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      context.startActivity(intent)
    }

    AsyncFunction("hasNotificationPermission") {
      NotificationHelper.hasNotificationPermission(requireContext())
    }

    AsyncFunction("requestNotificationPermission") {
      if (Build.VERSION.SDK_INT < 33) {
        return@AsyncFunction true
      }
      val activity = appContext.currentActivity
        ?: throw ScreenTimeNativeException("No current activity to request notification permission.")
      ActivityCompat.requestPermissions(
        activity,
        arrayOf(Manifest.permission.POST_NOTIFICATIONS),
        4103,
      )
      NotificationHelper.hasNotificationPermission(activity)
    }

    AsyncFunction("restrictApp") { packageName: String ->
      val context = requireContext()
      MonitorController.requireOverlayPermission(context)
      UsageStatsHelper.requireUsagePermission(context)
      ScreenTimeStore.addRestrictedPackage(context, packageName)
      MonitorController.start(context)
      mapOf("restricted" to true, "packageName" to packageName)
    }

    AsyncFunction("unrestrictApp") { packageName: String ->
      val context = requireContext()
      ScreenTimeStore.removeRestrictedPackage(context, packageName)
      ScreenTimeStore.removeLimitWatch(context, packageName)
      MonitorController.stopIfIdle(context)
      mapOf("restricted" to false, "packageName" to packageName)
    }

    AsyncFunction("startLimitWatch") { packageName: String, limitMs: Double ->
      val context = requireContext()
      MonitorController.requireOverlayPermission(context)
      UsageStatsHelper.requireUsagePermission(context)
      ScreenTimeStore.setLimitWatch(context, packageName, limitMs.toLong())
      val usage = UsageStatsHelper.getUsageForApp(context, packageName)
      val duration = (usage["durationMs"] as? Long) ?: 0L
      if (duration >= limitMs.toLong()) {
        ScreenTimeStore.addRestrictedPackage(context, packageName)
      } else {
        ScreenTimeStore.removeRestrictedPackage(context, packageName)
      }
      MonitorController.start(context)
      mapOf(
        "packageName" to packageName,
        "limitMs" to limitMs.toLong(),
        "currentUsageMs" to duration,
        "alreadyExceeded" to (duration >= limitMs.toLong()),
      )
    }

    AsyncFunction("stopLimitWatch") {
      val context = requireContext()
      ScreenTimeStore.clearLimitWatch(context)
      MonitorController.stopIfIdle(context)
    }

    AsyncFunction("scheduleSleepMode") { startMs: Double, endMs: Double ->
      val context = requireContext()
      MonitorController.requireOverlayPermission(context)
      SleepScheduler.scheduleSleep(context, startMs.toLong(), endMs.toLong())
      mapOf(
        "startMs" to startMs.toLong(),
        "endMs" to endMs.toLong(),
        "exactAlarms" to SleepScheduler.canScheduleExactAlarms(context),
      )
    }

    AsyncFunction("cancelSleepMode") {
      SleepScheduler.cancelSleep(requireContext())
    }

    AsyncFunction("scheduleTestNotification") { fireAtMs: Double ->
      SleepScheduler.scheduleTestNotification(requireContext(), fireAtMs.toLong())
      mapOf("fireAtMs" to fireAtMs.toLong())
    }

    AsyncFunction("lockDevice") {
      DeviceLockHelper.lockDevice(requireContext())
    }

    AsyncFunction("openDeviceAdminSettings") {
      val activity = appContext.currentActivity
        ?: throw ScreenTimeNativeException("No current activity to open Device Admin settings.")
      DeviceLockHelper.openDeviceAdminSettings(activity)
    }

    AsyncFunction("getNativeStatus") {
      val context = requireContext()
      mapOf(
        "platform" to "android",
        "usagePermission" to UsageStatsHelper.hasUsagePermission(context),
        "overlayPermission" to MonitorController.hasOverlayPermission(context),
        "notificationPermission" to NotificationHelper.hasNotificationPermission(context),
        "exactAlarmPermission" to SleepScheduler.canScheduleExactAlarms(context),
        "deviceAdminActive" to DeviceLockHelper.isAdminActive(context),
        "restrictedPackages" to ScreenTimeStore.getRestrictedPackages(context).toList(),
        "sleepActive" to ScreenTimeStore.isSleepActive(context),
        "sleepStartMs" to ScreenTimeStore.getSleepStartMs(context),
        "sleepEndMs" to ScreenTimeStore.getSleepEndMs(context),
        "sleepSkipUntilMs" to ScreenTimeStore.getSleepSkipUntilMs(context),
        "limitWatchPackage" to ScreenTimeStore.getLimitWatchPackage(context),
        "limitWatchLimitMs" to ScreenTimeStore.getLimitWatchMs(context),
      )
    }
  }

  private fun requireContext() =
    appContext.reactContext ?: throw Exceptions.ReactContextLost()
}
