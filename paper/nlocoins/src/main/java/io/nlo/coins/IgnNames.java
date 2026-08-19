package io.nlo.coins;

final class IgnNames {
    private IgnNames() {}

    static String key(String name) {
        if (name == null) {
            return "";
        }
        return name.strip().replaceFirst("^\\.+", "").toLowerCase();
    }

    static boolean matches(String claimed, String online) {
        String left = key(claimed);
        String right = key(online);
        return !left.isEmpty() && left.equals(right);
    }
}
