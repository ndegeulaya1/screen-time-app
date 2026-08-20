package expo.modules.screentime

import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.Handler
import android.os.HandlerThread
import android.os.IBinder
import android.util.Log

class RestrictionMonitorService : Service() {
  private var handlerThread: HandlerThread? = null
  private var handler: Handler? = null

  private val tick = object : Runnable {
    override fun run() {
      try {
        tickOnce()
      } catch (error: Exception) {
        Log.e(TAG, "Monitor tick failed", error)
      }
      handler?.postDelayed(this, POLL_MS)
    }
  }

  override fun onCreate() {
    super.onCreate()
    NotificationHelper.ensureChannel(this)
    if (Build.VERSION.SDK_INT >= 34) {
      startForeground(
        NotificationHelper.MONITOR_NOTIFICATION_ID,
        NotificationHelper.monitorNotification(this),
        ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE,
      )
    } else {
      startForeground(
        NotificationHelper.MONITOR_NOTIFICATION_ID,
        NotificationHelper.monitorNotification(this),
      )
    }

    handlerThread = HandlerThread("ScreenTimeMonitor").apply { start() }
    handler = Handler(handlerThread!!.looper)
    handler?.post(tick)
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    return START_STICKY
  }

  override fun onDestroy() {
    handler?.removeCallbacks(tick)
    handlerThread?.quitSafely()
    handler = null
    handlerThread = null
    super.onDestroy()
  }

  override fun onBind(intent: Intent?): IBinder? = null

  private fun tickOnce() {
    val now = System.currentTimeMillis()
    if (ScreenTimeStore.isInSleepWindow(this, now) && !ScreenTimeStore.isSleepActive(this)) {
      ScreenTimeStore.setSleepActive(this, true)
      if (!ScreenTimeStore.isSleepSkipped(this, now)) {
        NotificationHelper.showEvent(
          this,
          "Time to sleep",
          "Your scheduled sleep time has started.",
        )
      }
    }

    if (!ScreenTimeStore.isInSleepWindow(this, now) && ScreenTimeStore.isSleepActive(this)) {
      ScreenTimeStore.setSleepActive(this, false)
      ScreenTimeStore.clearSleepSkip(this)
      ScreenTimeStore.clearSleepLockState(this)
    }

    for ((limitPackage, limitMs) in ScreenTimeStore.getLimitWatches(this)) {
      if (limitMs <= 0L) {
        continue
      }
      val usage = UsageStatsHelper.getUsageForApp(this, limitPackage)
      val duration = (usage["durationMs"] as? Long) ?: 0L
      if (duration >= limitMs) {
        ScreenTimeStore.addRestrictedPackage(this, limitPackage)
      } else {
        ScreenTimeStore.removeRestrictedPackage(this, limitPackage)
      }
    }

    if (ScreenTimeStore.isSleepEnforced(this, now)) {
      MonitorController.showOverlay(
        this,
        BlockOverlayActivity.MODE_SLEEP,
        "Time to sleep",
        "Your sleep schedule has started. Take a break from your phone.",
      )
      DeviceLockHelper.enforceSleepLock(this)
      return
    }

    val foreground = UsageStatsHelper.getForegroundPackage(this) ?: return
    if (foreground == packageName) {
      return
    }

    if (ScreenTimeStore.getRestrictedPackages(this).contains(foreground)) {
      val appName = UsageStatsHelper.getUsageForApp(this, foreground)["appName"] as? String
        ?: foreground
      MonitorController.showOverlay(
        this,
        BlockOverlayActivity.MODE_APP,
        "Time's up",
        "$appName has reached today's limit. Come back tomorrow.",
      )
    }
  }

  companion object {
    private const val TAG = "ScreenTimeMonitor"
    private const val POLL_MS = 800L
  }
}
