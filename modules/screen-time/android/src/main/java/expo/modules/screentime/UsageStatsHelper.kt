package expo.modules.screentime

import android.app.AppOpsManager
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.os.Build
import android.os.Process
import java.util.Calendar

object UsageStatsHelper {
  fun hasUsagePermission(context: Context): Boolean {
    val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
    val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      appOps.unsafeCheckOpNoThrow(
        AppOpsManager.OPSTR_GET_USAGE_STATS,
        Process.myUid(),
        context.packageName,
      )
    } else {
      @Suppress("DEPRECATION")
      appOps.checkOpNoThrow(
        AppOpsManager.OPSTR_GET_USAGE_STATS,
        Process.myUid(),
        context.packageName,
      )
    }
    return mode == AppOpsManager.MODE_ALLOWED
  }

  fun requireUsagePermission(context: Context) {
    if (!hasUsagePermission(context)) {
      throw ScreenTimePermissionException(
        "Usage access is not granted. Open Android Usage Access settings.",
      )
    }
  }

  fun startOfTodayMs(): Long {
    return Calendar.getInstance().apply {
      set(Calendar.HOUR_OF_DAY, 0)
      set(Calendar.MINUTE, 0)
      set(Calendar.SECOND, 0)
      set(Calendar.MILLISECOND, 0)
    }.timeInMillis
  }

  fun getUsageToday(context: Context): List<Map<String, Any?>> {
    requireUsagePermission(context)
    val manager = usageManager(context)
    val now = System.currentTimeMillis()
    val stats = manager.queryAndAggregateUsageStats(startOfTodayMs(), now)
    val packageManager = context.packageManager

    return stats.values
      .filter { it.totalTimeInForeground > 0L }
      .sortedByDescending { it.totalTimeInForeground }
      .map { usage ->
        val label = try {
          packageManager.getApplicationLabel(
            packageManager.getApplicationInfo(usage.packageName, 0),
          ).toString()
        } catch (_: Exception) {
          usage.packageName
        }
        mapOf(
          "packageName" to usage.packageName,
          "appName" to label,
          "durationMs" to usage.totalTimeInForeground,
        )
      }
  }

  fun getUsageForApp(context: Context, packageName: String): Map<String, Any?> {
    requireUsagePermission(context)
    val today = getUsageToday(context).firstOrNull { it["packageName"] == packageName }
    if (today != null) {
      return today
    }

    val label = try {
      val packageManager = context.packageManager
      packageManager.getApplicationLabel(
        packageManager.getApplicationInfo(packageName, 0),
      ).toString()
    } catch (_: Exception) {
      packageName
    }

    return mapOf(
      "packageName" to packageName,
      "appName" to label,
      "durationMs" to 0L,
    )
  }

  fun getForegroundPackage(context: Context): String? {
    if (!hasUsagePermission(context)) {
      return null
    }

    val manager = usageManager(context)
    val end = System.currentTimeMillis()
    val begin = end - 10_000
    val events = manager.queryEvents(begin, end)
    val event = UsageEvents.Event()
    var last: String? = null

    while (events.hasNextEvent()) {
      events.getNextEvent(event)
      val isForeground = event.eventType == UsageEvents.Event.MOVE_TO_FOREGROUND ||
        (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q &&
          event.eventType == UsageEvents.Event.ACTIVITY_RESUMED)
      if (isForeground) {
        last = event.packageName
      }
    }

    return last
  }

  private fun usageManager(context: Context): UsageStatsManager {
    return context.getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager
      ?: throw ScreenTimeUnavailableException("UsageStatsManager is not available on this device.")
  }
}
