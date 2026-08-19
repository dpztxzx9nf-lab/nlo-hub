package io.nlo.coins;

import java.util.List;

public final class GrantModelsTest {
    public static void main(String[] args) {
        List<GrantModels.Grant> grants = GrantModels.parsePending(
                "{\"grants\":[{\"id\":12,\"ign\":\"Steve\",\"coins\":1000,\"stripe_session_id\":\"cs_test_1\"},"
                        + "{\"id\":13,\"ign\":null,\"coins\":50}]}");
        require(grants.size() == 1, "skip null ign");
        require(grants.get(0).id() == 12L, "id");
        require(grants.get(0).coins() == 1000L, "coins");
        require("Steve".equals(grants.get(0).ign()), "ign");
        require("cs_test_1".equals(grants.get(0).stripeSessionId()), "session");
        require(GrantModels.parsePending("{}").isEmpty(), "empty");
        System.out.println("GrantModelsTest: PASS");
    }

    private static void require(boolean condition, String message) {
        if (!condition) {
            throw new AssertionError(message);
        }
    }
}
