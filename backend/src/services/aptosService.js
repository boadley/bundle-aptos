// aptosService.js - Backend service for Aptos blockchain interactions
// Refactored from hederaService.js: Handles transaction confirmation via Nodit API polling
// Frontend submits signed tx hash; here we poll Nodit until success or timeout
// No signing on backend; user wallet signs frontend-side
console.log('--- 3. Loading aptosService.js ---');

const { Aptos, AptosConfig, Network, AccountAddress } = require('@aptos-labs/ts-sdk');
const axios = require('axios');
require('dotenv').config();

// Aptos client (for queries/simulations if needed later; main use is Nodit polling)
const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);

// Nodit API base URL (testnet; switch to mainnet via env)
const NODIT_BASE_URL = process.env.APTOS_NETWORK === 'mainnet' ? 'https://aptos-mainnet.nodit.io/v1' : 'https://aptos-testnet.nodit.io/v1';
const NODIT_API_KEY = process.env.NODIT_API_KEY || 'nodit-demo'; // Default for dev; use real key for production

// Poll interval and timeout for tx confirmation (in ms)
const POLL_INTERVAL = 2000; // 2s
const POLL_TIMEOUT = 6000; // 6s
const MAX_RETRIES = 3; // Maximum retries for network errors

class AptosService {
  // Confirm transaction by polling Nodit API with enhanced error handling
  // Input: txnHash from frontend
  // Returns: { success: bool, version: string, timestamp: string, error?: string }
  async confirmTransaction(txnHash) {
    const startTime = Date.now();
    let lastError = null;
    let retryCount = 0;

    console.log(`Starting transaction confirmation for ${txnHash}`);

    while (Date.now() - startTime < POLL_TIMEOUT) {
      try {
        // GET /transactions/by_hash/{txn_hash} from Nodit API
        const response = await axios.get(`${NODIT_BASE_URL}/transactions/by_hash/${txnHash}`, {
          headers: {
            'X-API-KEY': NODIT_API_KEY,
          },
          timeout: 2000, // 2 second timeout for API calls
        });

        const txn = response.data;
        retryCount = 0; // Reset retry count on successful API call

        // Handle pending transaction (from mempool)
        if (txn.type === 'pending_transaction') {
          console.log(`Transaction ${txnHash} is pending in mempool...`);
          await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
          continue;
        }

        // Handle user transaction (committed)
        if (txn.type === 'user_transaction') {
          if (txn.success) {
            console.log(`Transaction ${txnHash} confirmed successfully: version ${txn.version}`);
            return {
              success: true,
              version: txn.version,
              timestamp: txn.timestamp,
              gasUsed: txn.gas_used,
            };
          } else {
            const vmStatus = txn.vm_status || 'Unknown VM error';
            lastError = `Transaction failed on-chain: ${vmStatus}`;
            console.error(lastError);
            return {
              success: false,
              error: lastError,
              timestamp: txn.timestamp,
            };
          }
        }

        // Other types (genesis, block metadata, etc.) - likely not user tx
        lastError = `Unexpected transaction type: ${txn.type}`;
        console.warn(lastError);
        return {
          success: false,
          error: lastError,
          timestamp: null,
        };
      } catch (error) {
        if (error.response?.status === 404) {
          // Transaction not found (yet in mempool or pruned)
          console.log(`Transaction ${txnHash} not found, polling again...`);
          await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
          continue;
        }

        // Handle network errors with retry logic
        if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND' || error.response?.status >= 500) {
          retryCount++;
          if (retryCount <= MAX_RETRIES) {
            console.warn(`Network error (attempt ${retryCount}/${MAX_RETRIES}): ${error.message}. Retrying...`);
            await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL * retryCount)); // Exponential backoff
            continue;
          }
        }

        // Handle API key errors
        if (error.response?.status === 401 || error.response?.status === 403) {
          lastError = 'Invalid Nodit API key or insufficient permissions';
          console.error(lastError);
          return {
            success: false,
            error: lastError,
            timestamp: null,
          };
        }

        // Handle rate limiting
        if (error.response?.status === 429) {
          console.warn('Rate limited by Nodit API, waiting longer...');
          await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL * 2));
          continue;
        }

        lastError = error.response?.data?.message || error.message || 'Nodit API error';
        console.error(`API error: ${lastError}`, error.response?.status);
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
      }
    }

    // Timeout or persistent error
    const timeoutError = `Transaction confirmation timeout after ${POLL_TIMEOUT/1000}s`;
    console.error(timeoutError);
    return {
      success: false,
      error: lastError || timeoutError,
      timestamp: null,
    };
  }

  // Optional: Query account balance or resources (using Aptos client)
  async getAccountBalance(accountAddress) {
    try {
      const balance = await aptos.getAccountAptosBalance({
        accountAddress: AccountAddress.from(accountAddress),
      });
      return balance;
    } catch (error) {
      console.error('Balance query failed:', error);
      throw error;
    }
  }
}

module.exports = new AptosService();
