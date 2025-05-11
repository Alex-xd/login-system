/**
 * @fileoverview WebAuthn operation helper tools, handle the base64 conversion of WebAuthn responses.
 */

// handle the base64 conversion of WebAuthn responses
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window
    .btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
};

export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = window.atob(
    base64.replace(/-/g, "+").replace(/_/g, "/")
  );
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// prepare the WebAuthn registration credential
export const prepareRegistrationCredential = async (
  options: any,
  sessionId: string
) => {
  try {
    // convert the base64 encoded challenge to ArrayBuffer
    // challenge is a base64 encoded string, used for one-time token, to prevent replay attacks
    options.challenge = base64ToArrayBuffer(options.challenge);

    // convert the id of excludeCredentials to ArrayBuffer
    if (options.excludeCredentials) {
      options.excludeCredentials = options.excludeCredentials.map(
        (credential: any) => {
          return {
            ...credential,
            id: base64ToArrayBuffer(credential.id),
          };
        }
      );
    }

    // the user.id also needs to be converted to ArrayBuffer
    if (options.user && options.user.id) {
      options.user.id = base64ToArrayBuffer(options.user.id);
    }
    console.log("options1111111:", options);
    // create the credential
    const credential = (await navigator.credentials.create({
      publicKey: options,
    })) as PublicKeyCredential;
    // prepare the response data
    const response = credential.response as AuthenticatorAttestationResponse;

    return {
      sessionId,
      credential: {
        id: credential.id,
        type: credential.type,
        rawId: arrayBufferToBase64(credential.rawId),
        response: {
          attestationObject: arrayBufferToBase64(response.attestationObject),
          clientDataJSON: arrayBufferToBase64(response.clientDataJSON),
        },
      },
    };
  } catch (error) {
    console.error("WebAuthn Registration Error:", error);
    throw error;
  }
};

// prepare the WebAuthn authentication credential - modified to single device login
export const prepareAuthenticationCredential = async (
  options: any,
  sessionId: string
) => {
  try {
    console.log("options:", options);
    console.log("sessionId:", sessionId);

    // convert the base64 encoded challenge to ArrayBuffer
    options.challenge = base64ToArrayBuffer(options.challenge);

    // convert the id of allowCredentials to ArrayBuffer
    if (options.allowCredentials) {
      options.allowCredentials = options.allowCredentials.map(
        (credential: any) => {
          return {
            ...credential,
            id: base64ToArrayBuffer(credential.id),
          };
        }
      );
    }

    // get the credential
    const credential = (await navigator.credentials.get({
      publicKey: options,
    })) as PublicKeyCredential;

    // prepare the response data
    const response = credential.response as AuthenticatorAssertionResponse;

    return {
      sessionId,
      credential: {
        id: credential.id,
        type: credential.type,
        rawId: arrayBufferToBase64(credential.rawId),
        response: {
          authenticatorData: arrayBufferToBase64(response.authenticatorData),
          clientDataJSON: arrayBufferToBase64(response.clientDataJSON),
          signature: arrayBufferToBase64(response.signature),
          userHandle: response.userHandle
            ? arrayBufferToBase64(response.userHandle)
            : null,
        },
      },
    };
  } catch (error) {
    console.error("WebAuthn Authentication Error:", error);
    throw error;
  }
};
// check if the device supports WebAuthn
export const isWebAuthnSupported = (): boolean => {
  return window.PublicKeyCredential !== undefined;
};

// check if the device is a mobile device
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};
