package expo.modules.screentime

import android.app.Activity
import android.app.admin.DeviceAdminReceiver
import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.provider.Settings

class ScreenTimeDeviceAdminReceiver : DeviceAdminReceiver()

object DeviceLockHelper {
  fun isAdminActive(context: Context): Boolean {
    val dpm = context.getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
    return dpm.isAdminActive(component(context))
  }

  fun openDeviceAdminSettings(activity: Activity): Map<String, Any?> {
    val activation = Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN).apply {
      putExtra(DevicePolicyManager.EXTRA_DEVICE_ADMIN, component(activity))
      putExtra(
        DevicePolicyManager.EXTRA_ADD_EXPLANATION,
        "Optional. Bedtime lock uses overlay. Device Admin is only needed for lockNow() and may be hidden on this phone.",
      )
    }

    if (activation.resolveActivity(activity.packageManager) != null) {
      activity.startActivity(activation)
      return mapOf(
        "opened" to "activation",
        "deviceAdminActive" to isAdminActive(activity),
        "note" to "Activation UI requested. Samsung One UI may hide Device Admin for ordinary apps.",
      )
    }

    val security = Intent(Settings.ACTION_SECURITY_SETTINGS)
    if (security.resolveActivity(activity.packageManager) != null) {
      activity.startActivity(security)
      return mapOf(
        "opened" to "security-settings",
        "deviceAdminActive" to isAdminActive(activity),
        "note" to "Device Admin activation is unavailable. Opened Security settings instead. Overlay remains the V1 lock.",
      )
    }

    return mapOf(
      "opened" to "unavailable",
      "deviceAdminActive" to isAdminActive(activity),
      "note" to "Device Admin is unavailable on this device. Bedtime restriction uses overlay.",
    )
  }

  fun lockDevice(context: Context): Map<String, Any?> {
    MonitorController.showOverlay(
      context,
      BlockOverlayActivity.MODE_LOCK,
      "Time to sleep",
      "Your scheduled sleep time has started.",
    )

    val lockNow = tryLockNow(context)
    val lockNowReason = if (lockNow) {
      "lockNow() succeeded"
    } else if (isAdminActive(context)) {
      "lockNow() failed"
    } else {
      "Device admin is not active. Overlay is the V1 lock. lockNow() needs Device Admin."
    }

    return mapOf(
      "overlayShown" to true,
      "lockNow" to lockNow,
      "lockNowReason" to lockNowReason,
      "verdict" to "Supported (overlay) / Permission required (device admin for lockNow) / OEM-dependent",
    )
  }

  fun tryLockNow(context: Context): Boolean {
    return try {
      val dpm = context.getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
      if (!dpm.isAdminActive(component(context))) {
        false
      } else {
        dpm.lockNow()
        true
      }
    } catch (_: Exception) {
      false
    }
  }

  fun enforceSleepLock(context: Context) {
    if (ScreenTimeStore.isSleepSkipped(context)) {
      return
    }
    if (ScreenTimeStore.didLockThisSleepWindow(context)) {
      return
    }
    tryLockNow(context)
    ScreenTimeStore.setDidLockThisSleepWindow(context, true)
  }

  private fun component(context: Context) =
    ComponentName(context, ScreenTimeDeviceAdminReceiver::class.java)
}
