package expo.modules.screentime

import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings

object MonitorController {
  fun hasOverlayPermission(context: Context): Boolean {
    return Settings.canDrawOverlays(context)
  }

  fun requireOverlayPermission(context: Context) {
    if (!hasOverlayPermission(context)) {
      throw ScreenTimePermissionException(
        "Draw-over-apps / overlay permission is not granted.",
      )
    }
  }

  fun start(context: Context) {
    val appContext = context.applicationContext
    val intent = Intent(appContext, RestrictionMonitorService::class.java)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      appContext.startForegroundService(intent)
    } else {
      appContext.startService(intent)
    }
  }

  fun stopIfIdle(context: Context) {
    if (ScreenTimeStore.shouldMonitor(context)) {
      return
    }
    val appContext = context.applicationContext
    appContext.stopService(Intent(appContext, RestrictionMonitorService::class.java))
  }

  fun dismissSleepOverlay() {
    BlockOverlayActivity.dismissSleepOrLock()
  }

  fun showOverlay(context: Context, mode: String, title: String, message: String) {
    val intent = Intent(context.applicationContext, BlockOverlayActivity::class.java).apply {
      addFlags(
        Intent.FLAG_ACTIVITY_NEW_TASK or
          Intent.FLAG_ACTIVITY_CLEAR_TOP or
          Intent.FLAG_ACTIVITY_SINGLE_TOP,
      )
      putExtra(BlockOverlayActivity.EXTRA_MODE, mode)
      putExtra(BlockOverlayActivity.EXTRA_TITLE, title)
      putExtra(BlockOverlayActivity.EXTRA_MESSAGE, message)
    }
    context.applicationContext.startActivity(intent)
  }
}
