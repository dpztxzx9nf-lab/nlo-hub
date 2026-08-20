package io.nlo.coins;

public final class EconomyDepositTest {
    public static void main(String[] args) {
        require(EconomyDeposit.credited(100, 1100, 1000), "exact credit");
        require(EconomyDeposit.credited(0, 1000, 1000), "from zero");
        require(!EconomyDeposit.credited(5000, 5000, 1000), "no change is not a credit");
        require(!EconomyDeposit.credited(5000, 5001, 1000), "tiny bump is not the pack");
        require(!EconomyDeposit.credited(-1, 1000, 1000), "unknown before");
        require(!EconomyDeposit.credited(0, -1, 1000), "unknown after");
        require(EconomyDeposit.expectedAfter(1000, 1000) == 2000L, "expected after");

        EconomyDeposit.Settlement moved = new EconomyDeposit.Settlement(1000, 2000, 71L, 2000L, false);
        require(EconomyDeposit.upToDate(moved, 1000), "ledger after matches account");

        EconomyDeposit.Settlement creditedOnly = new EconomyDeposit.Settlement(1000, 2000, null, null, false);
        require(EconomyDeposit.upToDate(creditedOnly, 1000), "balance delta without ledger is still a credit");

        EconomyDeposit.Settlement ledgerStale = new EconomyDeposit.Settlement(1000, 1000, 71L, 2000L, false);
        require(!EconomyDeposit.upToDate(ledgerStale, 1000), "ledger written but account balance not yet visible");

        EconomyDeposit.Settlement spentAfter = new EconomyDeposit.Settlement(1000, 1500, 71L, 1500L, false);
        require(EconomyDeposit.upToDate(spentAfter, 1000), "later spend is fine if account matches ledger after");

        EconomyDeposit.Settlement none = new EconomyDeposit.Settlement(1000, 1000, null, null, false);
        require(!EconomyDeposit.upToDate(none, 1000), "no ledger and no delta");

        System.out.println("EconomyDepositTest: PASS");
    }

    private static void require(boolean condition, String message) {
        if (!condition) {
            throw new AssertionError(message);
        }
    }
}
