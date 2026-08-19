package io.nlo.coins;

public final class IgnNamesTest {
    public static void main(String[] args) {
        require(IgnNames.matches("Steve", "Steve"), "exact");
        require(IgnNames.matches("Steve", "steve"), "case");
        require(IgnNames.matches("Steve", ".Steve"), "floodgate prefix online");
        require(IgnNames.matches(".Steve", "Steve"), "floodgate prefix claimed");
        require(IgnNames.matches(".Alex", ".alex"), "both prefixed");
        require(!IgnNames.matches("Steve", "Alex"), "different names");
        require(!IgnNames.matches("", "Steve"), "empty claimed");
        require("steve".equals(IgnNames.key(".Steve")), "key strips prefix");
        System.out.println("IgnNamesTest: PASS");
    }

    private static void require(boolean condition, String message) {
        if (!condition) {
            throw new AssertionError(message);
        }
    }
}
