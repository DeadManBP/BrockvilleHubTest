package ca.brockvillehub.test

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat

const val REMINDER_ACTION = "ca.brockvillehub.test.ACTION_EVENT_REMINDER"

data class Reminder(
    val id: String,
    val title: String,
    val triggerAt: Long,
    val location: String,
    val whenText: String
)

object ReminderStore {
    private const val PREFS = "hub_event_reminders"

    fun save(ctx: Context, r: Reminder) {
        ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
            .putString("rem_" + r.id, r.triggerAt.toString() + "\n" + r.title + "\n" + r.location + "\n" + r.whenText)
            .apply()
    }

    fun remove(ctx: Context, id: String) {
        ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
            .remove("rem_$id").apply()
    }

    fun all(ctx: Context): List<Reminder> {
        val prefs = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        return prefs.all.mapNotNull { (k, v) ->
            if (!k.startsWith("rem_") || v !is String) return@mapNotNull null
            val parts = v.split("\n")
            if (parts.size < 4) return@mapNotNull null
            val at = parts[0].toLongOrNull() ?: return@mapNotNull null
            Reminder(k.removePrefix("rem_"), parts[1], at, parts[2], parts[3])
        }
    }

    /** Re-arm alarms after a reboot or an app update; drop ones whose time passed. */
    fun rescheduleAll(ctx: Context) {
        val now = System.currentTimeMillis()
        for (r in all(ctx)) {
            if (r.triggerAt > now) ReminderAlarm.schedule(ctx, r)
            else remove(ctx, r.id)
        }
    }
}

object ReminderAlarm {
    private fun pendingIntent(ctx: Context, r: Reminder): PendingIntent {
        val intent = Intent(ctx, ReminderReceiver::class.java).apply {
            action = REMINDER_ACTION
            putExtra("id", r.id)
            putExtra("title", r.title)
            putExtra("location", r.location)
            putExtra("when", r.whenText)
        }
        return PendingIntent.getBroadcast(
            ctx, r.id.hashCode(), intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    fun schedule(ctx: Context, r: Reminder): Boolean {
        if (r.triggerAt <= System.currentTimeMillis()) return false
        val am = ctx.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, r.triggerAt, pendingIntent(ctx, r))
        ReminderStore.save(ctx, r)
        return true
    }

    fun cancel(ctx: Context, id: String) {
        val blank = Reminder(id, "", 0, "", "")
        val am = ctx.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val pi = pendingIntent(ctx, blank)
        am.cancel(pi)
        pi.cancel()
        ReminderStore.remove(ctx, id)
    }
}

class ReminderReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            Intent.ACTION_BOOT_COMPLETED -> ReminderStore.rescheduleAll(context)
            REMINDER_ACTION -> {
                val id = intent.getStringExtra("id") ?: return
                val title = intent.getStringExtra("title") ?: "Brockville event"
                val location = intent.getStringExtra("location").orEmpty()
                val whenText = intent.getStringExtra("when").orEmpty()
                ReminderStore.remove(context, id)
                showNotification(context, id, title, location, whenText)
            }
        }
    }

    private fun showNotification(ctx: Context, id: String, title: String, location: String, whenText: String) {
        val nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val ch = NotificationChannel("hub_reminders", "Event reminders", NotificationManager.IMPORTANCE_DEFAULT)
            ch.description = "Reminders for Brockville events you asked to be reminded about"
            nm.createNotificationChannel(ch)
        }
        val open = PendingIntent.getActivity(
            ctx, 0,
            Intent(ctx, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
            },
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val detail = listOf(whenText, location).filter { it.isNotBlank() }.joinToString(" · ")
        val text = if (detail.isBlank()) "Starting soon in Brockville" else detail
        val notif = NotificationCompat.Builder(ctx, "hub_reminders")
            .setSmallIcon(R.drawable.ic_bell)
            .setContentTitle(title)
            .setContentText(text)
            .setStyle(NotificationCompat.BigTextStyle().bigText(text))
            .setContentIntent(open)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .build()
        nm.notify(id.hashCode(), notif)
    }
}
