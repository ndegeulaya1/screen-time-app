package expo.modules.screentime

import expo.modules.kotlin.exception.CodedException

class ScreenTimePermissionException(message: String) :
  CodedException("ERR_ST_PERMISSION", message, null)

class ScreenTimeNativeException(message: String, cause: Throwable? = null) :
  CodedException("ERR_ST_NATIVE", message, cause)

class ScreenTimeUnavailableException(message: String) :
  CodedException("ERR_ST_UNAVAILABLE", message, null)
