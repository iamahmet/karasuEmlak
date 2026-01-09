declare module 'web-push' {
  interface VapidDetails {
    subject: string;
    publicKey: string;
    privateKey: string;
  }

  interface PushSubscription {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }

  interface SendResult {
    statusCode: number;
    body: string;
    headers: Record<string, string>;
  }

  interface RequestOptions {
    headers?: Record<string, string>;
    gcmAPIKey?: string;
    vapidDetails?: VapidDetails;
    TTL?: number;
    contentEncoding?: string;
    proxy?: string;
    agent?: any;
    timeout?: number;
  }

  function setVapidDetails(
    subject: string,
    publicKey: string,
    privateKey: string
  ): void;

  function setGCMAPIKey(apiKey: string): void;

  function sendNotification(
    subscription: PushSubscription,
    payload?: string | Buffer | null,
    options?: RequestOptions
  ): Promise<SendResult>;

  function generateVAPIDKeys(): {
    publicKey: string;
    privateKey: string;
  };

  export {
    setVapidDetails,
    setGCMAPIKey,
    sendNotification,
    generateVAPIDKeys,
    VapidDetails,
    PushSubscription,
    SendResult,
    RequestOptions,
  };

  export default {
    setVapidDetails,
    setGCMAPIKey,
    sendNotification,
    generateVAPIDKeys,
  };
}
