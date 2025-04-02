
import { toast } from "sonner";
import { AuthData } from "./types";
import { getApiBaseUrl, API_PATHS } from "./config";

/**
 * Get authentication token from PayLink
 * @param apiKey - The PayLink API key
 * @param secretKey - The PayLink secret key
 * @returns Authentication token or null if authentication fails
 */
export const getAuthToken = async (apiKey: string, secretKey: string): Promise<string | null> => {
  try {
    const apiBase = getApiBaseUrl(apiKey);
    const isTestMode = apiKey.toLowerCase().startsWith('test_');
    
    console.log(`Getting PayLink auth token in ${isTestMode ? 'test' : 'production'} mode`);
    console.log(`Auth URL: ${apiBase}${API_PATHS.auth}`);

    // Build authentication data as per PHP code
    const authData: AuthData = {
      apiId: apiKey,
      secretKey: secretKey,
      persistToken: false
    };

    console.log("Auth request data:", JSON.stringify(authData));

    // Send authentication request
    const response = await fetch(`${apiBase}${API_PATHS.auth}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(authData)
    });

    if (!response.ok) {
      let errorText;
      try {
        const errorData = await response.json();
        errorText = JSON.stringify(errorData);
      } catch (jsonError) {
        errorText = await response.text();
      }
      
      console.error("PayLink Auth API error:", errorText);
      throw new Error(`فشل في المصادقة مع PayLink: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("PayLink auth response:", data);
    
    // Check if authentication token exists
    if (!data.id_token) {
      throw new Error("لم يتم الحصول على رمز المصادقة من PayLink");
    }

    return data.id_token;
  } catch (error) {
    console.error("Error getting auth token:", error);
    toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء المصادقة مع مزود الدفع");
    return null;
  }
};
