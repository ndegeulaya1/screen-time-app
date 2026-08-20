package expo.modules.screentime

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat

object NotificationHelper {
  const val CHANNEL_ID = "screen_time_poc"
  const val MONITOR_NOTIFICATION_ID = 4101
  const val EVENT_NOTIFICATION_ID = 4102

  fun hasNotificationPermission(context: Context): Boolean {
    if (Build.VERSION.SDK_INT < 33) {
      return true
    }
    return ContextCompat.checkSelfPermission(
      context,
      Manifest.permission.POST_NOTIFICATIONS,
    ) == PackageManager.PERMISSION_GRANTED
  }

  fun ensureChannel(context: Context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return
    }
    val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    val channel = NotificationChannel(
      CHANNEL_ID,
      "Screen Time",
      NotificationManager.IMPORTANCE_HIGH,
    ).apply {
      description = "Screen Time POC monitoring, limits, and sleep alerts"
    }
    manager.createNotificationChannel(channel)
  }

  fun monitorNotification(context: Context): Notification {
    ensureChannel(context)
    return NotificationCompat.Builder(context, CHANNEL_ID)
      .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
      .setContentTitle("Screen Time is monitoring")
      .setContentText("Usage limits and sleep restrictions stay active in the background.")
      .setOngoing(true)
      .setPriority(NotificationCompat.PRIORITY_LOW)
      .build()
  }

  fun showEvent(context: Context, title: String, message: String) {
    ensureChannel(context)
    val notification = NotificationCompat.Builder(context, CHANNEL_ID)
      .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
      .setContentTitle(title)
      .setContentText(message)
      .setStyle(NotificationCompat.BigTextStyle().bigText(message))
      .setPriority(NotificationCompat.PRIORITY_HIGH)
      .setAutoCancel(true)
      .build()

    val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    manager.notify(EVENT_NOTIFICATION_ID, notification)
  }
}
