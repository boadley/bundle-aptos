// backend/src/routes/apiRoutes.js
console.log("--- 2. Loading apiRoutes.js ---");

const express = require("express");
const router = express.Router();
const aptosService = require("../services/aptosService");
const {
    resolveBankAccount,
    executeBankTransfer,
    executeAirtimePurchase,
} = require("../services/paymentProviderService");

 // Bank name to code mapping for fiat payment providers (unchanged)
const BANK_CODES = {
    'GTBank': '058',
    'Zenith Bank': '057',
    'Access Bank': '044',
    'UBA': '033'
};

// Helper function to get bank code from name (for fiat transfers)
function getBankCode(bankName) {
    const code = BANK_CODES[bankName];
    if (!code) {
        throw new Error(`Invalid bank name: ${bankName}`);
    }
    return code;
}

// [REMOVED] Sponsorship endpoint removed as part of EVM migration

// POST /initiate-payment
router.post("/initiate-payment", async (req, res) => {
    try {
        console.log("Route started - req.body:", JSON.stringify(req.body, null, 2));
        
        const { paymentType, details, transactionHash, userAddress } = req.body;
        
        if (!paymentType || !details || !transactionHash || !userAddress) {
            console.log("Validation failed - missing fields");
            return res.status(400).json({ 
                error: "paymentType, details, transactionHash, and userAddress are required" 
            });
        }

        console.log("Validating transaction...");
        
        // Get treasury address from environment
        const treasuryAddress = process.env.TREASURY_ADDRESS;
        if (!treasuryAddress) {
            throw new Error('Treasury address not configured');
        }

        console.log("Confirming Aptos transaction...");

        // Use Aptos service to confirm transaction via Nodit API
        const txResult = await aptosService.confirmTransaction(transactionHash);
        
        if (!txResult.success) {
            console.log("Transaction confirmation failed:", txResult.error);
            return res.status(400).json({ 
                error: txResult.error || "Transaction confirmation failed" 
            });
        }

        console.log("Transaction confirmed, processing payment...");

        let result;
        if (paymentType === "airtime") {
            // details: { phoneNumber, amount }
            console.log("Processing airtime purchase...");
            result = await executeAirtimePurchase(details.phoneNumber, details.amount);
        } else if (paymentType === "bank") {
            // details: { accountNumber, bankName, amount, accountName }
            console.log("Processing bank transfer...");
            const bankCode = getBankCode(details.bankName);
            const amountInKobo = Math.round(Number(details.amount) * 100);
            result = await executeBankTransfer(
                details.accountNumber,
                bankCode,
                amountInKobo,
                details.accountName
            );
        } else {
            console.log(`Invalid payment type: ${paymentType}`);
            return res.status(400).json({ 
                error: "Invalid payment type. Must be 'bank' or 'airtime'" 
            });
        }

        console.log("Payment processed successfully");
        res.json({ success: true, result });
    } catch (err) {
        console.error('Payment initiation error:', err);
        res.status(500).json({ 
            error: err.message || "Internal server error"
        });
    }
});

 // POST /resolve-account
router.post("/resolve-account", async (req, res) => {
    try {
        const { accountNumber, bankName } = req.body;
        if (!accountNumber || !bankName) {
            return res.status(400).json({ error: "accountNumber and bankName are required" });
        }
        
        // Convert bank name to code if needed by your payment provider
        const bankCode = getBankCode(bankName);
        const result = await resolveBankAccount(accountNumber, bankCode);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Note: Aptos transactions are signed and submitted client-side via wallet
// No need for server-side transaction creation/signing endpoints

// GET /get-balance/:accountId
router.get("/get-balance/:accountId", async (req, res) => {
    try {
        const { accountId } = req.params;
        if (!accountId) {
            return res.status(400).json({ error: "accountId is required" });
        }
        const balance = await aptosService.getAccountBalance(accountId);
        res.json({ balance });
    } catch (err) {
        console.error('Error getting balance:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
