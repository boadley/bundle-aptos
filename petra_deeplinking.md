[Developers](https://petra.app/docs)

Deep Linking to Mobile App

# Deep Linking to Mobile App

A deep link is a specialized URL that directs users to a specific location or content within a mobile app. It enables smooth navigation, allowing users to move seamlessly from a website, email, or another app directly to a particular section or page within a mobile app.

## Supported Deep Links [Permalink for this section](https://petra.app/docs/mobile-deeplinks\#supported-deep-links)

Petra mobile app supports the following deep links:

### 1\. Open a dApp [Permalink for this section](https://petra.app/docs/mobile-deeplinks\#1-open-a-dapp)

Redirect users to a specific dApp within the Explore tab of the Petra app. If your dApp is a mobile app, see the [Mobile 2 Mobile communication](https://petra.app/docs/mobile-deeplinks#mobile-2-mobile-communication) section.

**Format:**

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
https://petra.app/explore?link=<dapp_url>
```

> Ensure the `<dapp_url>` is a valid and accessible URL.

**Example:**

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
https://petra.app/explore?link=https://app.ariesmarkets.xyz
```

In this example, users are redirected to the Aries Markets dApp ( [https://app.ariesmarkets.xyz (opens in a new tab)](https://app.ariesmarkets.xyz/)) within the Explore tab of the Petra app.

### 2\. Send Coins [Permalink for this section](https://petra.app/docs/mobile-deeplinks\#2-send-coins)

Redirect users to the Petra app to select the coin and amount to send to the specified wallet address.

**Format:**

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
https://petra.app/receive?address=<wallet_address>
```

> Ensure the `<wallet_address>` is a valid wallet address.

**Example:**

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
https://petra.app/receive?address=0x0000000000000000000000000000000000000000000000000000000000000001
```

In this example, users are redirected to the Petra app to select the coin and amount to send to the wallet address `0x0000000000000000000000000000000000000000000000000000000000000001`.

## Mobile 2 Mobile Communication [Permalink for this section](https://petra.app/docs/mobile-deeplinks\#mobile-2-mobile-communication)

If your dApp is a mobile app and you want to sign transactions through Petra wallet, you can use deep links to establish a secure connection between your dApp and the Petra wallet. This provides a comprehensive guide for implementing deep link connections between your mobile decentralized application (dApp) and the Petra wallet. The goal is to enable secure interactions such as connecting, disconnecting, and signing transactions with the Petra wallet. While the provided example is in React Native, the concepts and steps are applicable to any language.

### Prerequisites [Permalink for this section](https://petra.app/docs/mobile-deeplinks\#prerequisites)

1. **Petra Wallet**: Make sure you have the [Petra mobile wallet (opens in a new tab)](https://petra.app/) installed and configured on your device.
2. **Deep Links**: Ensure you are familiar with how deep linking works on your target platform and make sure it's already working on your dApp. Here's a comprehensive guide for [React Native deep linking setup (opens in a new tab)](https://reactnavigation.org/docs/deep-linking/#set-up-with-bare-react-native-projects).
3. **Cryptography**: Basic understanding of public-private key pairs, encryption, and decryption.

### Petra Deep Link Structure [Permalink for this section](https://petra.app/docs/mobile-deeplinks\#petra-deep-link-structure)

Petra utilizes a specific deep link format to handle communication between your dApp and the wallet. Here's the breakdown:

- **Base URL:**
  - `petra://api/v1`: This is the base URL used for all Petra deep link interactions.
- **Endpoints:**
  - `/connect`: Initiates a connection request between your dApp and the Petra wallet.
  - `/disconnect`: Terminates the existing connection between your dApp and the Petra wallet.
  - `/signAndSubmit`: Allows your dApp to send a transaction for signing and submission through the Petra wallet.
- **Data Parameter:**
  - Petra expects data to be passed as a base64 encoded JSON string attached to the deep link using the `data` parameter. This data provides context and instructions for the specific action.

### Constants [Permalink for this section](https://petra.app/docs/mobile-deeplinks\#constants)

The following constants are used throughout the implementation and mentioned in the example code:

- **Deep Link Base URLs**: The base URLs for initiating connections and transactions.
  - `PETRA_LINK_BASE`: The base URL for the Petra wallet - `petra://api/v1`.
  - `DAPP_LINK_BASE`: The base URL for your dApp - `<your-dapp-domain>:///api/<version>`.
- **App Info**: Information about your dApp, serving as an identifier for Petra.
  - `APP_INFO`: An object containing your dApp's domain and name. Note that users will see this information in the Petra wallet when approving requests.
    - `domain`: Your dApp's domain name.
    - `name`: A descriptive name for your dApp.

**Format:**

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
const PETRA_LINK_BASE = 'petra://api/v1';
const DAPP_LINK_BASE = '<your-dapp-domain>:///api/<version>';

const APP_INFO = {
  domain: 'https://your-dapp-domain.com',
  name: 'your-dapp-name',
};
```

**Example:**

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
const PETRA_LINK_BASE = 'petra://api/v1';
const DAPP_LINK_BASE = 'mobile2mobile-example:///api/v1';

const APP_INFO = {
  domain: 'https://mobile2mobile-example.petra.app',
  name: 'mobile2mobile-example',
};
```

### Generate Key Pair [Permalink for this section](https://petra.app/docs/mobile-deeplinks\#generate-key-pair)

Create a key pair using a cryptographic library like [tweetnacl (opens in a new tab)](https://tweetnacl.cr.yp.to/). This key pair consists of a secret key (private) and a public key. The secret key is essential for secure communication and should be stored securely within your dApp. The public key will be shared with Petra to establish a secure connection.

**Example:**

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
import nacl from 'tweetnacl';

const generateAndSaveKeyPair = () => {
  const keyPair = nacl.box.keyPair();

  setSecretKey(keyPair.secretKey);
  setPublicKey(keyPair.publicKey);

  return keyPair;
};
```

### Connect [Permalink for this section](https://petra.app/docs/mobile-deeplinks\#connect)

To initiate a connection, create a deep link with the `PETRA_LINK_BASE` at the `/connect` endpoint, where the data parameter is a base64 encoded JSON object. The data should include your dApp's information, a redirect link, and your dApp's public encryption key as a hex string.

**Example:**

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
const connect = async () => {
  const keyPair = generateAndSaveKeyPair();

  const data = {
    appInfo: APP_INFO,
    redirectLink: `${DAPP_LINK_BASE}/connect`,
    dappEncryptionPublicKey: Buffer.from(keyPair.publicKey).toString('hex'),
  };

  await Linking.openURL(
    `${PETRA_LINK_BASE}/connect?data=${btoa(JSON.stringify(data))}`,
  );
};
```

When the function above is called, it will open the Petra wallet with the connection request, and users will see your dApp's information. They can then approve or reject the connection request. If the user rejects the request, Petra will discard the connection and redirect back to your dApp through the provided redirect link with the response set to `"rejected"`. If the user approves the request, Petra will generate a shared encryption key, encrypt it with the dApp's public key, and save it for future encrypted communication. Then Petra will redirect back to your dApp through the provided redirect link with the response set to `"approved"` and the shared encryption key encrypted with the dApp's public key.

### Handling Petra Response [Permalink for this section](https://petra.app/docs/mobile-deeplinks\#handling-petra-response)

When Petra redirects back to your dApp through the deep link, you need to handle the URL.

**Example:**

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
useEffect(() => {
  const handleConnectionApproval = (data: string | null) => {...};

  const handleConnectionRejection = () => {...};

  const handleConnection = (params: URLSearchParams) => {...};

  const handleUrl = (url: string | null) => {...};

  Linking.getInitialURL().then(handleUrl);

  Linking.addEventListener('url', ({url}) => handleUrl(url));

  return () => {
    Linking.removeAllListeners('url');
  };
}, [secretKey]);
```

> The above code snippet is a React Native example that uses the `Linking` API to handle deep links.

When connecting to Petra, you need to handle the `response` parameter to determine if the connection was `approved` or `rejected`. If approved, you should parse the base64 encoded `data` parameter to extract the `petraPublicEncryptedKey` and decrypt it using your dApp's secret key to get the shared encryption key. This shared key will be used for secure communication between your dApp and Petra for subsequent actions, so make sure to store it securely. If rejected, you should handle the rejection accordingly, such as displaying an error message or taking appropriate action.

**Example:**

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
const handleConnectionApproval = (data: string | null) => {
  if (data === null) {
    throw new Error('Missing data from Petra response');
  }

  if (!secretKey) {
    throw new Error('Missing key pair');
  }

  const { petraPublicEncryptedKey } = JSON.parse(atob(data));

  const sharedEncryptionSecretKey = nacl.box.before(
    Buffer.from(petraPublicEncryptedKey.slice(2), 'hex'),
    secretKey,
  );
  setSharedPublicKey(sharedEncryptionSecretKey);
};

const handleConnectionRejection = () => {
  // TODO: Handle rejection
};

const handleConnection = (params: URLSearchParams) => {
  if (params.get('response') === 'approved') {
    handleConnectionApproval(params.get('data'));
  } else {
    handleConnectionRejection();
  }
};

const handleUrl = (url: string | null) => {
  if (!url) {
    return;
  }

  const urlObject = new URL(url);
  const params = new URLSearchParams(urlObject.search);

  switch (urlObject.pathname) {
    case '/api/v1/connect': {
      handleConnection(params);
      break;
    }
    default:
      break;
  }
};
```

### Sign and Submit Transaction [Permalink for this section](https://petra.app/docs/mobile-deeplinks\#sign-and-submit-transaction)

To sign and submit a transaction through the Petra mobile wallet, create a deep link with the `PETRA_LINK_BASE` at the `/signAndSubmit` endpoint, where the data parameter is a base64 encoded JSON object. The data should include your dApp's information, a redirect link, your dApp's public encryption key as a hex string, the transaction payload, and a nonce. The payload should be a hex string of an entry function or script payload encrypted using the shared encryption key generated during the connection process and the nonce. The nonce is a unique identifier for the transaction and should be generated randomly for each transaction.

**Example:**

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
const signAndSubmitTransaction = () => {
  if (!sharedPublicKey) {
    throw new Error('Missing shared public key');
  }

  if (!publicKey) {
    throw new Error('Missing public key');
  }

  const payload = btoa(
    JSON.stringify({
      arguments: [\
        '0x0000000000000000000000000000000000000000000000000000000000000001',\
        10000000, // 0.1 APT\
      ],
      function: '0x1::coin::transfer',
      type: 'entry_function_payload',
      type_arguments: ['0x1::aptos_coin::AptosCoin'],
    }),
  );

  const nonce = nacl.randomBytes(24);

  const encryptedPayload = nacl.box.after(
    Buffer.from(JSON.stringify(payload)),
    nonce,
    sharedPublicKey,
  );

  const data = btoa(
    JSON.stringify({
      appInfo: APP_INFO,
      payload: Buffer.from(encryptedPayload).toString('hex'),
      redirectLink: `${DAPP_LINK_BASE}/response`,
      dappEncryptionPublicKey: Buffer.from(publicKey).toString('hex'),
      nonce: Buffer.from(nonce).toString('hex'),
    }),
  );

  Linking.openURL(`${PETRA_LINK_BASE}/signAndSubmit?data=${data}`);
};
```

> The above code snippet demonstrates how to sign and submit a transaction to transfer 0.1 APT to `0x0000000000000000000000000000000000000000000000000000000000000001` using the `coin::transfer` entry function.

When the function above is called, it will open the Petra wallet with the transaction request, and users will see your dApp's information, the transaction details, and the amount to be signed.

### Sign Message [Permalink for this section](https://petra.app/docs/mobile-deeplinks\#sign-message)

To sign an arbitrary message through the Petra mobile wallet, create a deep link with the `PETRA_LINK_BASE` at the `/signMessage` endpoint. The `data` parameter should be a base64-encoded JSON object containing your dApp's information, a redirect link, your dApp's public encryption key, the message payload (as a hex string), and a unique nonce. The payload should be encrypted using the shared encryption key established during the connection step.

#### Example [Permalink for this section](https://petra.app/docs/mobile-deeplinks\#example)

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
const signMessage = () => {
  if (!sharedPublicKey) {
    throw new Error('Missing shared public key');
  }

  if (!publicKey) {
    throw new Error('Missing public key');
  }

  const message = 'I am signing this message with Petra Wallet!';
  const nonce = nacl.randomBytes(24);

  const encryptedPayload = nacl.box.after(
    Buffer.from(message),
    nonce,
    sharedPublicKey,
  );

  const data = btoa(
    JSON.stringify({
      appInfo: APP_INFO,
      payload: Buffer.from(encryptedPayload).toString('hex'),
      redirectLink: `${DAPP_LINK_BASE}/response`,
      dappEncryptionPublicKey: Buffer.from(publicKey).toString('hex'),
      nonce: Buffer.from(nonce).toString('hex'),
    }),
  );

  Linking.openURL(`${PETRA_LINK_BASE}/signMessage?data=${data}`);
};
```

### Disconnect [Permalink for this section](https://petra.app/docs/mobile-deeplinks\#disconnect)

To terminate the connection, create a deep link with the `PETRA_LINK_BASE` at the `/disconnect` endpoint, where the data parameter is a base64 encoded JSON object. The data should include your dApp's information, a redirect link, and your dApp's public encryption key as a hex string, exactly like the connect function. Petra will disconnect with the dApp, clearing the shared encryption key, and redirect back to your dApp through the provided redirect link. You should also clear the saved secret key, public key, and shared public key from your dApp as they are no longer valid.

**Example:**

```nx-border-black nx-border-opacity-[0.04] nx-bg-opacity-[0.03] nx-bg-black nx-break-words nx-rounded-md nx-border nx-py-0.5 nx-px-[.25em] nx-text-[.9em] dark:nx-border-white/10 dark:nx-bg-white/10
const disconnect = () => {
  if (!publicKey) {
    throw new Error('Missing public key');
  }

  const data = {
    appInfo: APP_INFO,
    redirectLink: `${DAPP_LINK_BASE}/disconnect`,
    dappEncryptionPublicKey: Buffer.from(publicKey).toString('hex'),
  };

  Linking.openURL(
    `${PETRA_LINK_BASE}/disconnect?data=${btoa(JSON.stringify(data))}`,
  );

  setSecretKey(null);
  setPublicKey(null);
  setSharedPublicKey(null);
};
```

### Example [Permalink for this section](https://petra.app/docs/mobile-deeplinks\#example-1)

For a complete implementation of the deep linking functionality described in this guide, including connecting, disconnecting, and signing transactions through the Petra wallet, you can refer to the example code available on GitHub. The repository provides detailed examples using React Native:

[https://github.com/aptos-labs/mobile2mobile-example (opens in a new tab)](https://github.com/aptos-labs/mobile2mobile-example)

[Connecting to Petra Wallet](https://petra.app/docs/connect-to-petra "Connecting to Petra Wallet") [Event Listening](https://petra.app/docs/event-listening "Event Listening")