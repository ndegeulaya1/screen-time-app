package expo.modules.screentime

import android.app.Activity
import android.content.Intent
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.text.InputFilter
import android.text.InputType
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import java.lang.ref.WeakReference

class BlockOverlayActivity : Activity() {
  @Volatile
  private var mode: String = MODE_APP

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      setShowWhenLocked(true)
      setTurnScreenOn(true)
    }

    mode = intent.getStringExtra(EXTRA_MODE) ?: MODE_APP
    current = WeakReference(this)
    val title = intent.getStringExtra(EXTRA_TITLE) ?: "Time's up"
    val message = intent.getStringExtra(EXTRA_MESSAGE) ?: "Come back tomorrow."

    val layout = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      setBackgroundColor(Color.parseColor("#0B0B0C"))
      setPadding(dp(32), dp(96), dp(32), dp(32))
      gravity = Gravity.CENTER_HORIZONTAL
    }

    layout.addView(
      TextView(this).apply {
        text = title
        setTextColor(Color.parseColor("#F5F1E8"))
        setTextSize(TypedValue.COMPLEX_UNIT_SP, 32f)
        gravity = Gravity.CENTER
      },
    )
    layout.addView(
      TextView(this).apply {
        text = message
        setTextColor(Color.parseColor("#8A8680"))
        setTextSize(TypedValue.COMPLEX_UNIT_SP, 16f)
        gravity = Gravity.CENTER
        setPadding(0, dp(16), 0, 0)
      },
    )

    if (mode == MODE_SLEEP) {
      addSleepSkipControls(layout)
    } else if (mode == MODE_LOCK) {
      addLockDismissControls(layout)
    }

    setContentView(layout)
  }

  override fun onDestroy() {
    if (current?.get() === this) {
      current = null
    }
    super.onDestroy()
  }

  private fun addSleepSkipControls(layout: LinearLayout) {
    val hoursField = numberField("0")
    val minutesField = numberField("15")

    val skipForm = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      setPadding(0, dp(32), 0, 0)
    }

    skipForm.addView(
      TextView(this).apply {
        text = "Need the phone?"
        setTextColor(Color.parseColor("#F5F1E8"))
        setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
        letterSpacing = 0.08f
        setPadding(0, 0, 0, dp(8))
      },
    )
    skipForm.addView(
      TextView(this).apply {
        text = "Enter how long, then continue using your phone. Sleep restriction returns after that."
        setTextColor(Color.parseColor("#8A8680"))
        setTextSize(TypedValue.COMPLEX_UNIT_SP, 15f)
        gravity = Gravity.CENTER
        setPadding(0, 0, 0, dp(16))
      },
    )

    val fields = LinearLayout(this).apply {
      orientation = LinearLayout.HORIZONTAL
      gravity = Gravity.CENTER_VERTICAL
    }
    val fieldParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)

    fields.addView(labeledField("Hours", hoursField), fieldParams)
    fields.addView(View(this), LinearLayout.LayoutParams(dp(16), 1))
    fields.addView(labeledField("Minutes", minutesField), fieldParams)
    skipForm.addView(fields)

    val continueWrap = LinearLayout(this).apply {
      setPadding(0, dp(20), 0, 0)
    }
    continueWrap.addView(
      actionButton("Continue using phone", filled = true) {
        val hours = hoursField.text.toString().toIntOrNull() ?: 0
        val minutes = minutesField.text.toString().toIntOrNull() ?: 0
        val durationMs = (hours * 60L + minutes) * 60_000L
        if (durationMs < 60_000L) {
          Toast.makeText(this, "Enter at least 1 minute", Toast.LENGTH_SHORT).show()
          return@actionButton
        }
        ScreenTimeStore.applySleepSkip(this, durationMs)
        finish()
      },
      LinearLayout.LayoutParams(
        LinearLayout.LayoutParams.MATCH_PARENT,
        LinearLayout.LayoutParams.WRAP_CONTENT,
      ),
    )
    skipForm.addView(continueWrap)

    val sleepWrap = LinearLayout(this).apply {
      setPadding(0, dp(12), 0, 0)
    }
    sleepWrap.addView(
      actionButton("I'll sleep now", filled = false) {
        goHome()
      },
      LinearLayout.LayoutParams(
        LinearLayout.LayoutParams.MATCH_PARENT,
        LinearLayout.LayoutParams.WRAP_CONTENT,
      ),
    )
    skipForm.addView(sleepWrap)

    layout.addView(skipForm)
  }

  private fun addLockDismissControls(layout: LinearLayout) {
    val unlockWrap = LinearLayout(this).apply {
      setPadding(0, dp(32), 0, 0)
    }
    unlockWrap.addView(
      actionButton("Unlock", filled = true) {
        finish()
      },
      LinearLayout.LayoutParams(
        LinearLayout.LayoutParams.MATCH_PARENT,
        LinearLayout.LayoutParams.WRAP_CONTENT,
      ),
    )
    layout.addView(unlockWrap)
  }

  private fun labeledField(label: String, field: EditText): LinearLayout {
    return LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      addView(
        TextView(this@BlockOverlayActivity).apply {
          text = label.uppercase()
          setTextColor(Color.parseColor("#8A8680"))
          setTextSize(TypedValue.COMPLEX_UNIT_SP, 12f)
          setPadding(0, 0, 0, dp(8))
        },
      )
      addView(field)
    }
  }

  private fun numberField(initial: String): EditText {
    return EditText(this).apply {
      setText(initial)
      hint = "00"
      inputType = InputType.TYPE_CLASS_NUMBER
      filters = arrayOf(InputFilter.LengthFilter(2))
      setTextColor(Color.parseColor("#F5F1E8"))
      setHintTextColor(Color.parseColor("#8A8680"))
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 28f)
      gravity = Gravity.CENTER
      setBackgroundColor(Color.parseColor("#141416"))
      setPadding(dp(12), dp(16), dp(12), dp(16))
      importantForAutofill = View.IMPORTANT_FOR_AUTOFILL_NO
    }
  }

  private fun actionButton(label: String, filled: Boolean, onClick: () -> Unit): TextView {
    return TextView(this).apply {
      text = label
      gravity = Gravity.CENTER
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 17f)
      setPadding(dp(20), dp(16), dp(20), dp(16))
      isClickable = true
      isFocusable = true
      if (filled) {
        setTextColor(Color.parseColor("#0B0B0C"))
        setBackgroundColor(Color.parseColor("#C4A574"))
      } else {
        setTextColor(Color.parseColor("#F5F1E8"))
        setBackgroundColor(Color.parseColor("#141416"))
      }
      setOnClickListener { onClick() }
    }
  }

  @Deprecated("Deprecated in Java")
  override fun onBackPressed() {
    goHome()
  }

  private fun goHome() {
    val home = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME)
    home.flags = Intent.FLAG_ACTIVITY_NEW_TASK
    startActivity(home)
  }

  private fun dp(value: Int): Int {
    return (value * resources.displayMetrics.density).toInt()
  }

  companion object {
    const val EXTRA_MODE = "mode"
    const val EXTRA_TITLE = "title"
    const val EXTRA_MESSAGE = "message"
    const val MODE_APP = "app"
    const val MODE_SLEEP = "sleep"
    const val MODE_LOCK = "lock"

    @Volatile
    private var current: WeakReference<BlockOverlayActivity>? = null

    fun dismissSleepOverlay() {
      val activity = current?.get() ?: return
      val currentMode = activity.mode
      if (currentMode != MODE_SLEEP) {
        return
      }
      activity.runOnUiThread {
        if (!activity.isFinishing) {
          activity.finish()
        }
      }
    }
  }
}
