import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';

interface JWTPayload {
  iat: number;
  exp: number;
  sub: number;
  gen: number;
  typ: 'access' | 'refresh';
}

interface BaseResponse {
  status: string;
  nativeResponse: Response;
}

interface SuccessResponse<T = null> extends BaseResponse {
  status: 'success';
  data: T;
}

interface FailResponse extends BaseResponse {
  status: 'fail';
  message: string;
  reasons?: string[];
}

interface ErrorResponse extends BaseResponse {
  status: 'error';
  message: string;
  reasons?: string[];
}

export type StandardResponse<T = null> =
  | SuccessResponse<T>
  | FailResponse
  | ErrorResponse;

export const API_URI = 'https://infiniterain.io';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const setAccessToken = async (accessToken: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    console.log('access token set to', accessToken);
  } catch {}
};

export const setRefreshToken = async (refreshToken: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    console.log('refresh token set to', refreshToken);
  } catch {}
};

export const clearTokens = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {}
};

export const checkTokens = async (): Promise<false | [string, string]> => {
  try {
    const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);

    if (accessToken === null || refreshToken === null) {
      await clearTokens();
      return false;
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const decodedData = jwtDecode<JWTPayload>(refreshToken);

    if (currentTimestamp > decodedData.exp) {
      await clearTokens();
      return false;
    }

    return [accessToken, refreshToken];
  } catch {
    await clearTokens();
    return false;
  }
};

const sendRequest = async <REQ = void, RESP = null>(
  endpoint: string,
  method: 'get' | 'post' | 'delete' = 'get',
  body: REQ | null = null,
): Promise<StandardResponse<RESP>> => {
  const trimmedEndpoint = endpoint.trim().replace(/^\/+|\/+$/g, '');
  const tokenResult = await checkTokens();
  let headers: Record<string, string> = {};

  if (tokenResult) {
    headers.Authorization = `Bearer ${tokenResult[0]}`;
  }

  if (body !== null) {
    headers['Content-Type'] = 'application/json';
  }

  let response = await fetch(`${API_URI}/${trimmedEndpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let finalResponseForm = {
    ...(await response.json()),
    nativeResponse: response,
  };

  return finalResponseForm as StandardResponse<RESP>;
};

export const sendEnsuredRequest = async <REQ = void, RESP = null>(
  endpoint: string,
  method: 'get' | 'post' | 'delete' = 'get',
  body: REQ | null = null,
): Promise<StandardResponse<RESP>> => {
  const tokenResult = await checkTokens();

  if (tokenResult) {
    const [accessToken, refreshToken] = tokenResult;

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const accessTokenDecodedData = jwtDecode<JWTPayload>(accessToken);
    const refreshTokenDecodedData = jwtDecode<JWTPayload>(refreshToken);

    const accesAboutToExpire =
      currentTimestamp + 300 > accessTokenDecodedData.exp;
    const refreshAboutToExpire =
      currentTimestamp + 432000 > refreshTokenDecodedData.exp;

    if (accesAboutToExpire || refreshAboutToExpire) {
      const refreshResponse = await sendRequest<
        {refresh_token: string},
        {access_token: string; refresh_token: string}
      >('/auth/refresh', 'post', {
        refresh_token: refreshToken,
      });

      if (refreshResponse.status === 'success') {
        await setAccessToken(refreshResponse.data.access_token);

        if (refreshAboutToExpire) {
          await setRefreshToken(refreshResponse.data.refresh_token);
        }
      }
    }
  }

  return await sendRequest<REQ, RESP>(endpoint, method, body);
};
