// backend/src/services/paymentProviderService.js
console.log("--- 4. Loading paymentProviderService.js ---");

const axios = require("axios");

let uuidv4;

// (async () => {
//   const { v4 } = await import("uuid");
//   uuidv4 = v4;
// })();

// const paystack = axios.create({
//     baseURL: "https://api.paystack.co",
//     headers: {
//         Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//         "Content-Type": "application/json",
//     },
// });

// /**
//  * Resolve a Nigerian bank account using Paystack API.
//  * @param {string} accountNumber
//  * @param {string} bankCode
//  * @returns {Promise<object>} - { account_name, account_number, bank_id, ... }
//  */
// async function resolveBankAccount(accountNumber, bankCode) {
//     try {
//         const response = await paystack.get("/bank/resolve", {
//             params: {
//                 account_number: accountNumber,
//                 bank_code: bankCode,
//             },
//         });
//         if (response.data && response.data.status) {
//             return response.data.data;
//         } else {
//             throw new Error(response.data.message || "Failed to resolve account");
//         }
//     } catch (err) {
//         return { error: true, message: err.response?.data?.message || err.message };
//     }
// }
// --- REPLACED FUNCTION --- IN PLACE OF PAYSTACK API FOR THOROUGH TESTING
async function resolveBankAccount(accountNumber, bankCode) {
    console.log(`[SIMULATION] Resolving account: ${accountNumber}, bankCode: ${bankCode}`);

    // Magic number to trigger a failure simulation
    if (accountNumber === '9999999999') {
        throw new Error('Account not found');
    }

    // For other numbers, simulate success with a mock response
    return {
        accountName: `Kevin O. Ikeduba`,
        accountNumber: accountNumber
    };
}

module.exports = {
    resolveBankAccount,
    executeBankTransfer,
    executeAirtimePurchase
};


// --- REPLACED FUNCTION --- IN PLACE OF PAYSTACK API FOR THOROUGH TESTING
async function executeBankTransfer(accountNumber, bankCode, amountInKobo, accountName, reason) {
    console.log(`[SIMULATION] Initiating transfer of ${amountInKobo} kobo to ${accountName} (${accountNumber})`);

    // Magic number to trigger a failure simulation
    if (accountNumber === '9999999999') {
        // Simulate the exact error you received from Paystack
        return Promise.resolve({
            status: 'completed',
            paymentResult: {
                error: true,
                message: "SIMULATED ERROR: You cannot initiate third party payouts as a starter business"
            }
        });
    }

    // For any other account number, simulate a successful transfer
    return Promise.resolve({
        status: 'completed',
        paymentResult: {
            error: false,
            status: true,
            message: "Transfer successful",
            data: {
                integration: 100073,
                domain: "test",
                amount: amountInKobo,
                currency: "NGN",
                source: "balance",
                reason: reason,
                recipient: 987654, // Mock recipient code
                status: "success",
                transfer_code: `TRF_SIM_${Date.now()}`, // Generate a unique mock code
                id: 123456,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        }
    });
}


// /**
//  * Execute a bank transfer using Paystack API.
//  * @param {string} accountNumber
//  * @param {string} bankCode
//  * @param {number} amountInKobo
//  * @param {string} accountName
//  * @param {string} reason
//  * @returns {Promise<object>} - Transfer result
//  */
// async function executeBankTransfer(accountNumber, bankCode, amountInKobo, accountName, reason) {
//     try {
//         // Step 1: Create Transfer Recipient
//         const recipientRes = await paystack.post("/transferrecipient", {
//             type: "nuban",
//             name: accountName,
//             account_number: accountNumber,
//             bank_code: bankCode,
//             currency: "NGN",
//         });
//         if (!recipientRes.data.status) {
//             throw new Error(recipientRes.data.message || "Failed to create transfer recipient");
//         }
//         const recipientCode = recipientRes.data.data.recipient_code;

//         // Step 2: Initiate Transfer
//         const reference = "acv_" + uuidv4().replace(/-/g, "").slice(0, 24); // 28 chars, unique
//         const transferRes = await paystack.post("/transfer", {
//             source: "balance",
//             amount: amountInKobo,
//             recipient: recipientCode,
//             reason: reason || "Bundle bank transfer",
//             reference,
//         });
//         if (!transferRes.data.status) {
//             throw new Error(transferRes.data.message || "Failed to initiate transfer");
//         }
//         const transferData = transferRes.data.data;
//         // Handle OTP, pending, and success statuses
//         if (transferData.status === "otp") {
//             return {
//                 status: "otp_required",
//                 message: "OTP required to finalize transfer. Complete this step in your Paystack dashboard.",
//                 transfer_code: transferData.transfer_code,
//                 reference: transferData.reference,
//             };
//         } else if (transferData.status === "pending") {
//             return {
//                 status: "pending",
//                 message: "Transfer is pending. Awaiting processing by Paystack.",
//                 transfer_code: transferData.transfer_code,
//                 reference: transferData.reference,
//             };
//         } else if (transferData.status === "success") {
//             return {
//                 status: "success",
//                 message: "Transfer successful.",
//                 transfer_code: transferData.transfer_code,
//                 reference: transferData.reference,
//             };
//         } else {
//             return {
//                 status: transferData.status,
//                 message: "Transfer status: " + transferData.status,
//                 transfer_code: transferData.transfer_code,
//                 reference: transferData.reference,
//             };
//         }
//     } catch (err) {
//         return { error: true, message: err.response?.data?.message || err.message };
//     }
// }

/**
 * Simulate an airtime purchase (Paystack does not provide a public API).
 * @param {string} phoneNumber
 * @param {number} amountInNaira
 * @returns {object}
 */
function executeAirtimePurchase(phoneNumber, amountInNaira) {
    console.log(`SIMULATING AIRTIME PURCHASE: Sent NGN ${amountInNaira} to ${phoneNumber}.`);
    return { status: "success", message: "Airtime purchase simulated." };
}

module.exports = {
    resolveBankAccount,
    executeBankTransfer,
    executeAirtimePurchase,
};
