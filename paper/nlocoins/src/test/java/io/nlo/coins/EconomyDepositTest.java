package io.nlo.coins;

public final class EconomyDepositTest {
    public static void main(String[] args) {
        require(EconomyDeposit.credited(100, 1100, 1000), "exact credit");
        require(EconomyDeposit.credited(0, 1000, 1000), "from zero");
        require(!EconomyDeposit.credited(5000, 5000, 1000), "no change is not a credit");
        require(!EconomyDeposit.credited(5000, 5001, 1000), "tiny bump is not the pack");
        require(!EconomyDeposit.credited(-1, 1000, 1000), "unknown before");
        require(!EconomyDeposit.credited(0, -1, 1000), "unknown after");
        System.out.println("EconomyDepositTest: PASS");
    }

    private static void require(boolean condition, String message) {
        if (!condition) {
            throw new AssertionError(message);
        }
    }
}
