package expo.modules.screentime

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager

object InstalledAppsHelper {
  fun getInstalledApps(context: Context): List<Map<String, Any?>> {
    val packageManager = context.packageManager
    val launcherIntent = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)
    val resolved = packageManager.queryIntentActivities(
      launcherIntent,
      PackageManager.MATCH_DEFAULT_ONLY,
    )

    val seen = linkedSetOf<String>()
    val apps = mutableListOf<Map<String, Any?>>()

    for (info in resolved) {
      val packageName = info.activityInfo?.packageName ?: continue
      if (!seen.add(packageName)) {
        continue
      }

      val name = info.loadLabel(packageManager).toString()
      val isSystem = (info.activityInfo.applicationInfo.flags and
        android.content.pm.ApplicationInfo.FLAG_SYSTEM) != 0

      apps.add(
        mapOf(
          "packageName" to packageName,
          "name" to name,
          "isSystem" to isSystem,
        ),
      )
    }

    return apps.sortedBy { (it["name"] as String).lowercase() }
  }
}
