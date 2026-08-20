package expo.modules.screentime

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build

object SleepScheduler {
  const val ACTION_SLEEP_START = "expo.modules.screentime.SLEEP_START"
  const val ACTION_SLEEP_END = "expo.modules.screentime.SLEEP_END"
  const val ACTION_TEST_NOTIFICATION = "expo.modules.screentime.TEST_NOTIFICATION"
  private const val REQ_SLEEP_START = 5101
  private const val REQ_SLEEP_END = 5102
  private const val REQ_TEST_NOTIFICATION = 5103

  fun canScheduleExactAlarms(context: Context): Boolean {
    val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      alarmManager.canScheduleExactAlarms()
    } else {
      true
    }
  }

  fun scheduleSleep(context: Context, startMs: Long, endMs: Long) {
    if (endMs <= startMs) {
      throw ScreenTimeNativeException("Sleep end must be after sleep start.")
    }
    ScreenTimeStore.setSleepSchedule(context, startMs, endMs)
    ScreenTimeStore.setSleepActive(context, ScreenTimeStore.isInSleepWindow(context))
    scheduleAlarm(context, ACTION_SLEEP_START, REQ_SLEEP_START, startMs)
    scheduleAlarm(context, ACTION_SLEEP_END, REQ_SLEEP_END, endMs)
    MonitorController.start(context)
  }

  fun cancelSleep(context: Context) {
    cancelAlarm(context, ACTION_SLEEP_START, REQ_SLEEP_START)
    cancelAlarm(context, ACTION_SLEEP_END, REQ_SLEEP_END)
    ScreenTimeStore.clearSleepSchedule(context)
    MonitorController.stopIfIdle(context)
  }

  fun restoreAfterBoot(context: Context) {
    val start = ScreenTimeStore.getSleepStartMs(context)
    val end = ScreenTimeStore.getSleepEndMs(context)
    val now = System.currentTimeMillis()

    if (start > now) {
      scheduleAlarm(context, ACTION_SLEEP_START, REQ_SLEEP_START, start)
    }
    if (end > now) {
      scheduleAlarm(context, ACTION_SLEEP_END, REQ_SLEEP_END, end)
    }

    if (ScreenTimeStore.isInSleepWindow(context, now)) {
      ScreenTimeStore.setSleepActive(context, true)
      if (!ScreenTimeStore.isSleepSkipped(context, now)) {
        DeviceLockHelper.enforceSleepLock(context)
      }
    }

    if (ScreenTimeStore.shouldMonitor(context)) {
      MonitorController.start(context)
    }
  }

  fun scheduleTestNotification(context: Context, fireAtMs: Long) {
    scheduleAlarm(context, ACTION_TEST_NOTIFICATION, REQ_TEST_NOTIFICATION, fireAtMs)
  }

  private fun scheduleAlarm(context: Context, action: String, requestCode: Int, triggerAtMs: Long) {
    val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    val pending = pendingIntent(context, action, requestCode)

    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
        alarmManager.setAlarmClock(
          AlarmManager.AlarmClockInfo(triggerAtMs, pending),
          pending,
        )
      } else {
        alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerAtMs, pending)
      }
    } catch (error: SecurityException) {
      alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMs, pending)
    }
  }

  private fun cancelAlarm(context: Context, action: String, requestCode: Int) {
    val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    alarmManager.cancel(pendingIntent(context, action, requestCode))
  }

  private fun pendingIntent(context: Context, action: String, requestCode: Int): PendingIntent {
    val intent = Intent(context, SleepAlarmReceiver::class.java).setAction(action)
    val flags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    return PendingIntent.getBroadcast(context, requestCode, intent, flags)
  }
}

class SleepAlarmReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent?) {
    when (intent?.action) {
      SleepScheduler.ACTION_SLEEP_START -> {
        ScreenTimeStore.setSleepActive(context, true)
        NotificationHelper.showEvent(
          context,
          "Time to sleep",
          "Your scheduled sleep time has started.",
        )
        MonitorController.start(context)
        if (!ScreenTimeStore.isSleepSkipped(context)) {
          MonitorController.showOverlay(
            context,
            BlockOverlayActivity.MODE_SLEEP,
            "Time to sleep",
            "Your sleep schedule has started. Take a break from your phone.",
          )
          DeviceLockHelper.enforceSleepLock(context)
        }
      }
      SleepScheduler.ACTION_SLEEP_END -> {
        ScreenTimeStore.setSleepActive(context, false)
        ScreenTimeStore.clearSleepSkip(context)
        ScreenTimeStore.clearSleepLockState(context)
        NotificationHelper.showEvent(
          context,
          "Sleep ended",
          "Sleep restriction has been lifted.",
        )
        MonitorController.stopIfIdle(context)
      }
      SleepScheduler.ACTION_TEST_NOTIFICATION -> {
        NotificationHelper.showEvent(
          context,
          "Screen Time POC",
          "Native notification fired without React Native.",
        )
      }
    }
  }
}

class BootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent?) {
    val action = intent?.action ?: return
    if (
      action == Intent.ACTION_BOOT_COMPLETED ||
      action == Intent.ACTION_LOCKED_BOOT_COMPLETED ||
      action == "android.intent.action.QUICKBOOT_POWERON"
    ) {
      SleepScheduler.restoreAfterBoot(context)
    }
  }
}
