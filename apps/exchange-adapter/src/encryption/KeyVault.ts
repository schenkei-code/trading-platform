/**
 * KeyVault — AES-256-GCM encryption for exchange API keys.
 *
 * Provides secure storage of exchange credentials at rest.
 * Keys are encrypted before being stored in the database and
 * decrypted only when needed to make API calls.
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

// ─── Types ───────────────────────────────────────────────────────────

export interface EncryptedPayload {
  /** Base64-encoded ciphertext */
  ciphertext: string;
  /** Base64-encoded initialization vector (12 bytes for GCM) */
  iv: string;
  /** Base64-encoded auth tag (16 bytes for GCM) */
  authTag: string;
  /** Base64-encoded salt used for key derivation */
  salt: string;
}

export interface ExchangeCredentials {
  exchangeName: string;
  apiKey: string;
  apiSecret: string;
  passphrase?: string; // Some exchanges (Coinbase) require a passphrase
}

// ─── Constants ───────────────────────────────────────────────────────

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits recommended for GCM
const SALT_LENGTH = 32;
const KEY_LENGTH = 32; // 256 bits
const SCRYPT_COST = 16384; // N parameter

// ─── KeyVault Class ──────────────────────────────────────────────────

export class KeyVault {
  private masterPassword: string;

  /**
   * @param masterPassword - The master password used to derive encryption keys.
   *   In production, this should come from an environment variable or a secrets
   *   manager (e.g., AWS Secrets Manager, HashiCorp Vault), never hardcoded.
   */
  constructor(masterPassword: string) {
    if (!masterPassword || masterPassword.length < 16) {
      throw new Error("Master password must be at least 16 characters");
    }
    this.masterPassword = masterPassword;
  }

  /**
   * Derive an AES-256 key from the master password and a salt using scrypt.
   */
  private deriveKey(salt: Buffer): Buffer {
    return scryptSync(this.masterPassword, salt, KEY_LENGTH, {
      N: SCRYPT_COST,
      r: 8,
      p: 1,
    });
  }

  /**
   * Encrypt plaintext using AES-256-GCM.
   *
   * Each call generates a fresh salt and IV, so encrypting the same
   * plaintext twice produces different ciphertexts.
   */
  encrypt(plaintext: string): EncryptedPayload {
    const salt = randomBytes(SALT_LENGTH);
    const key = this.deriveKey(salt);
    const iv = randomBytes(IV_LENGTH);

    const cipher = createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plaintext, "utf8"),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return {
      ciphertext: encrypted.toString("base64"),
      iv: iv.toString("base64"),
      authTag: authTag.toString("base64"),
      salt: salt.toString("base64"),
    };
  }

  /**
   * Decrypt an AES-256-GCM encrypted payload back to plaintext.
   *
   * @throws Error if the auth tag is invalid (tampered data or wrong password)
   */
  decrypt(payload: EncryptedPayload): string {
    const salt = Buffer.from(payload.salt, "base64");
    const key = this.deriveKey(salt);
    const iv = Buffer.from(payload.iv, "base64");
    const authTag = Buffer.from(payload.authTag, "base64");
    const ciphertext = Buffer.from(payload.ciphertext, "base64");

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  }

  /**
   * Encrypt exchange credentials (API key + secret + optional passphrase).
   * Serializes to JSON before encrypting.
   */
  encryptCredentials(credentials: ExchangeCredentials): EncryptedPayload {
    return this.encrypt(JSON.stringify(credentials));
  }

  /**
   * Decrypt and deserialize exchange credentials.
   */
  decryptCredentials(payload: EncryptedPayload): ExchangeCredentials {
    const json = this.decrypt(payload);
    return JSON.parse(json) as ExchangeCredentials;
  }
}
