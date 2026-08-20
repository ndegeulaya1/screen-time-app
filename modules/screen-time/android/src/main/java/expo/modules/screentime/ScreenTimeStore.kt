package expo.modules.screentime

import android.content.Context
import org.json.JSONObject

object ScreenTimeStore {
  private const val PREFS = "screen_time_poc"
  private const val KEY_RESTRICTED = "restricted_packages"
  private const val KEY_SLEEP_START = "sleep_start_ms"
  private const val KEY_SLEEP_END = "sleep_end_ms"
  private const val KEY_SLEEP_ACTIVE = "sleep_active"
  private const val KEY_SLEEP_SKIP_UNTIL = "sleep_skip_until_ms"
  private const val KEY_SLEEP_DID_LOCK = "sleep_did_lock"
  private const val KEY_LIMIT_PACKAGE = "limit_watch_package"
  private const val KEY_LIMIT_MS = "limit_watch_ms"
  private const val KEY_LIMIT_WATCHES = "limit_watches"

  private fun prefs(context: Context) =
    context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

  fun getRestrictedPackages(context: Context): MutableSet<String> {
    return prefs(context).getStringSet(KEY_RESTRICTED, emptySet())?.toMutableSet()
      ?: mutableSetOf()
  }

  fun setRestrictedPackages(context: Context, packages: Set<String>) {
    prefs(context).edit().putStringSet(KEY_RESTRICTED, packages).apply()
  }

  fun addRestrictedPackage(context: Context, packageName: String) {
    val next = getRestrictedPackages(context)
    next.add(packageName)
    setRestrictedPackages(context, next)
  }

  fun removeRestrictedPackage(context: Context, packageName: String) {
    val next = getRestrictedPackages(context)
    next.remove(packageName)
    setRestrictedPackages(context, next)
  }

  fun setSleepSchedule(context: Context, startMs: Long, endMs: Long) {
    val editor = prefs(context).edit()
      .putLong(KEY_SLEEP_START, startMs)
      .putLong(KEY_SLEEP_END, endMs)
    val skipUntil = prefs(context).getLong(KEY_SLEEP_SKIP_UNTIL, 0L)
    if (skipUntil > endMs) {
      editor.putLong(KEY_SLEEP_SKIP_UNTIL, endMs)
    }
    editor.apply()
  }

  fun getSleepStartMs(context: Context) = prefs(context).getLong(KEY_SLEEP_START, 0L)

  fun getSleepEndMs(context: Context) = prefs(context).getLong(KEY_SLEEP_END, 0L)

  fun setSleepActive(context: Context, active: Boolean) {
    prefs(context).edit().putBoolean(KEY_SLEEP_ACTIVE, active).apply()
  }

  fun isSleepActive(context: Context) = prefs(context).getBoolean(KEY_SLEEP_ACTIVE, false)

  fun clearSleepSchedule(context: Context) {
    prefs(context).edit()
      .remove(KEY_SLEEP_START)
      .remove(KEY_SLEEP_END)
      .remove(KEY_SLEEP_SKIP_UNTIL)
      .putBoolean(KEY_SLEEP_ACTIVE, false)
      .putBoolean(KEY_SLEEP_DID_LOCK, false)
      .apply()
  }

  fun getSleepSkipUntilMs(context: Context) = prefs(context).getLong(KEY_SLEEP_SKIP_UNTIL, 0L)

  fun clearSleepSkip(context: Context) {
    prefs(context).edit().remove(KEY_SLEEP_SKIP_UNTIL).apply()
  }

  fun applySleepSkip(context: Context, durationMs: Long): Long {
    val now = System.currentTimeMillis()
    val end = getSleepEndMs(context)
    val requested = now + durationMs.coerceAtLeast(60_000L)
    val until = if (end > now) minOf(requested, end) else requested
    prefs(context).edit()
      .putLong(KEY_SLEEP_SKIP_UNTIL, until)
      .putBoolean(KEY_SLEEP_DID_LOCK, false)
      .apply()
    return until
  }

  fun isSleepSkipped(context: Context, nowMs: Long = System.currentTimeMillis()): Boolean {
    return getSleepSkipUntilMs(context) > nowMs
  }

  fun isSleepEnforced(context: Context, nowMs: Long = System.currentTimeMillis()): Boolean {
    if (isSleepSkipped(context, nowMs)) {
      return false
    }
    return isSleepActive(context) || isInSleepWindow(context, nowMs)
  }

  fun didLockThisSleepWindow(context: Context) =
    prefs(context).getBoolean(KEY_SLEEP_DID_LOCK, false)

  fun setDidLockThisSleepWindow(context: Context, locked: Boolean) {
    prefs(context).edit().putBoolean(KEY_SLEEP_DID_LOCK, locked).apply()
  }

  fun clearSleepLockState(context: Context) {
    prefs(context).edit().putBoolean(KEY_SLEEP_DID_LOCK, false).apply()
  }

  fun getLimitWatches(context: Context): Map<String, Long> {
    val raw = prefs(context).getString(KEY_LIMIT_WATCHES, null)
    if (!raw.isNullOrBlank()) {
      val parsed = mutableMapOf<String, Long>()
      val json = JSONObject(raw)
      val keys = json.keys()
      while (keys.hasNext()) {
        val key = keys.next()
        parsed[key] = json.optLong(key)
      }
      return parsed
    }

    val legacyPackage = prefs(context).getString(KEY_LIMIT_PACKAGE, null)
    val legacyMs = prefs(context).getLong(KEY_LIMIT_MS, 0L)
    if (!legacyPackage.isNullOrBlank() && legacyMs > 0L) {
      return mapOf(legacyPackage to legacyMs)
    }

    return emptyMap()
  }

  fun setLimitWatch(context: Context, packageName: String, limitMs: Long) {
    val next = getLimitWatches(context).toMutableMap()
    next[packageName] = limitMs
    saveLimitWatches(context, next)
  }

  fun removeLimitWatch(context: Context, packageName: String) {
    val next = getLimitWatches(context).toMutableMap()
    next.remove(packageName)
    saveLimitWatches(context, next)
  }

  fun getLimitWatchPackage(context: Context): String? =
    getLimitWatches(context).keys.firstOrNull()

  fun getLimitWatchMs(context: Context): Long =
    getLimitWatches(context).values.firstOrNull() ?: 0L

  fun clearLimitWatch(context: Context) {
    saveLimitWatches(context, emptyMap())
  }

  private fun saveLimitWatches(context: Context, watches: Map<String, Long>) {
    val json = JSONObject()
    for ((packageName, limitMs) in watches) {
      json.put(packageName, limitMs)
    }
    prefs(context).edit()
      .putString(KEY_LIMIT_WATCHES, json.toString())
      .remove(KEY_LIMIT_PACKAGE)
      .remove(KEY_LIMIT_MS)
      .apply()
  }

  fun shouldMonitor(context: Context): Boolean {
    return getRestrictedPackages(context).isNotEmpty() ||
      getLimitWatches(context).isNotEmpty() ||
      isSleepActive(context) ||
      (getSleepStartMs(context) > 0L && getSleepEndMs(context) > 0L)
  }

  fun isInSleepWindow(context: Context, nowMs: Long = System.currentTimeMillis()): Boolean {
    val start = getSleepStartMs(context)
    val end = getSleepEndMs(context)
    if (start <= 0L || end <= 0L) {
      return false
    }
    return nowMs >= start && nowMs < end
  }
}
