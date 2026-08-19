package io.nlo.coins;

import java.util.ArrayList;
import java.util.List;

final class GrantModels {
    record Grant(long id, String ign, long coins, String stripeSessionId) {}

    static List<Grant> parsePending(String json) {
        List<Grant> out = new ArrayList<>();
        int grantsAt = json.indexOf("\"grants\"");
        if (grantsAt < 0) {
            return out;
        }
        int cursor = json.indexOf('[', grantsAt);
        if (cursor < 0) {
            return out;
        }
        while (true) {
            int obj = json.indexOf('{', cursor);
            if (obj < 0) {
                return out;
            }
            int end = json.indexOf('}', obj);
            if (end < 0) {
                return out;
            }
            String body = json.substring(obj, end + 1);
            Long id = readLong(body, "id");
            Long coins = readLong(body, "coins");
            String ign = readString(body, "ign");
            String session = readString(body, "stripe_session_id");
            if (id != null && coins != null && coins > 0 && ign != null && !ign.isBlank()) {
                out.add(new Grant(id, ign, coins, session == null ? "" : session));
            }
            cursor = end + 1;
            if (json.indexOf('{', cursor) < 0) {
                return out;
            }
        }
    }

    private static String readString(String json, String key) {
        String needle = "\"" + key + "\"";
        int at = json.indexOf(needle);
        if (at < 0) {
            return null;
        }
        int colon = json.indexOf(':', at + needle.length());
        if (colon < 0) {
            return null;
        }
        int i = colon + 1;
        while (i < json.length() && Character.isWhitespace(json.charAt(i))) {
            i += 1;
        }
        if (i < json.length() && json.startsWith("null", i)) {
            return null;
        }
        if (i >= json.length() || json.charAt(i) != '"') {
            return null;
        }
        int end = i + 1;
        StringBuilder text = new StringBuilder();
        while (end < json.length()) {
            char ch = json.charAt(end);
            if (ch == '\\' && end + 1 < json.length()) {
                text.append(json.charAt(end + 1));
                end += 2;
                continue;
            }
            if (ch == '"') {
                return text.toString();
            }
            text.append(ch);
            end += 1;
        }
        return null;
    }

    private static Long readLong(String json, String key) {
        String needle = "\"" + key + "\"";
        int at = json.indexOf(needle);
        if (at < 0) {
            return null;
        }
        int colon = json.indexOf(':', at + needle.length());
        if (colon < 0) {
            return null;
        }
        int i = colon + 1;
        while (i < json.length() && Character.isWhitespace(json.charAt(i))) {
            i += 1;
        }
        int end = i;
        if (end < json.length() && json.charAt(end) == '-') {
            end += 1;
        }
        while (end < json.length() && Character.isDigit(json.charAt(end))) {
            end += 1;
        }
        if (end == i) {
            return null;
        }
        try {
            return Long.parseLong(json.substring(i, end));
        } catch (NumberFormatException ignored) {
            return null;
        }
    }
}
