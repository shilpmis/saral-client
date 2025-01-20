import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
// import CryptoJS from 'crypto-js'

const BASE_URL = "http://localhost:3333/api/v1/";

/**
 * @description Service to call HTTP requests via Axios
 */
class ApiService {
    /**
     * @description Property to share in Axios Instance 
     */
    static axiosInstance: any;
    static cancelTokens: any[] = [];
    static access_token: string | null;
    static userId: string | null;

    /**
     * @description Initialize Axios instance
     */
    static init(): void {
        ApiService.axiosInstance = axios.create({
            baseURL: BASE_URL,
            timeout: 10000,
        });
        this.access_token = localStorage.getItem('access_token');
        if (this.access_token) {
            this.setHeader(this.access_token);
        }

        ApiService.axiosInstance.interceptors.response.use(
            (response: AxiosResponse) => {
                if (response.status === 200 || response.status === 201) {
                    // response.data = this.decryptData(response.data); // Decrypt response data
                    // if (typeof response.data === 'string') response.data = JSON.parse(response.data);
                    // console.log("Check After Decryption", response.data, typeof response.data);
                    return response;
                }
                return Promise.reject(response);
            },
            (error: any) => {
                return Promise.reject(error);
            }
        );

        ApiService.axiosInstance.interceptors.request.use(
            (config: AxiosRequestConfig) => {
                // if (config.data) {
                //     config.data = this.encryptData(config.data); // Encrypt request data
                // }
                return config;
            },
            (error: any) => {
                return Promise.reject(error);
            }
        );
    }

    static initForServerSideRendering(): void {
        ApiService.axiosInstance = axios.create({
            baseURL: '',
            timeout: 10000,
        });

        ApiService.axiosInstance.interceptors.response.use(
            (response: AxiosResponse) => {
                if (response.status === 200 || response.status === 201) {
                    return response;
                }
                return Promise.reject(response);
            }
        );
    }

    /**
     * @description Set the default HTTP request headers
     */
    static setHeader(access_token: string): void {
        if (!this.access_token) this.access_token = access_token;
        // if (!this.userId) this.setUserId();

        ApiService.axiosInstance.defaults.headers.common['x-access-token'] = access_token;
        ApiService.axiosInstance.defaults.headers.common['Accept'] = 'application/json';
    }

    static setTokenInLocal(token: string): void {
        localStorage.setItem('access_token', token);
        this.access_token = localStorage.getItem('access_token');
        this.setHeader(token);
        // this.setUserId();
    }

    // static setUserId(): void {
    //     const currentUser = localStorage.getItem('currentUser');
    //     if (currentUser) {
    //         const tempBytes = CryptoJS.AES.decrypt(
    //             currentUser,
    //             'gcsajdfghdfghgjqrwvdgdebndjskfhs'
    //         );
    //         const decryptedUser = JSON.parse(tempBytes.toString(CryptoJS.enc.Utf8));
    //         this.userId = decryptedUser.id;
    //     }
    // }

    static removeTokenFromLocal(): void {
        localStorage.removeItem('access_token');
        this.access_token = null;
        this.setHeader('');
    }

    static getAccessToken(): string | null {
        return ApiService.access_token;
    }

    /**
     * @description Send the GET HTTP request
     * @param resource - string
     * @param params - AxiosRequestConfig
     * @returns Promise<AxiosResponse>
     */
    static async query(resource: string, params: AxiosRequestConfig): Promise<AxiosResponse> {
        const source = axios.CancelToken.source();
        ApiService.cancelTokens.push(source);
        try {
            return await ApiService.axiosInstance.get(resource, {
                ...params,
                cancelToken: source.token,
            });
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }

    /**
     * @description Send the GET HTTP request
     * @param resource - string
     * @returns Promise<AxiosResponse>
     */
    static async get(resource: string): Promise<AxiosResponse> {
        try {
            return ApiService.axiosInstance.get(resource);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * @description Send the POST HTTP request
     * @param resource - string
     * @param data - Data object to pass in request body
     * @param config - AxiosRequestConfig
     * @returns Promise<AxiosResponse>
     */
    static async post(resource: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
        try {
            return ApiService.axiosInstance.post(resource, data, config);
        } catch (error) {
            console.log("Check Error from ApiService's post", error);
            return Promise.reject(error);
        }
    }

    /**
     * @description Send the UPDATE HTTP request
     * @param resource - string
     * @param slug - string
     * @param data - any
     * @param config - AxiosRequestConfig
     * @returns Promise<AxiosResponse>
     */
    static async update(resource: string, slug: string, data: any, config: AxiosRequestConfig = {}): Promise<AxiosResponse> {
        try {
            return ApiService.axiosInstance.put(`${resource}/${slug}`, data, config);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * @description Send the PUT HTTP request
     * @param resource - string
     * @param data - any
     * @param config - AxiosRequestConfig
     * @returns Promise<AxiosResponse>
     */
    static async put(resource: string, data: any, config: AxiosRequestConfig = {}): Promise<AxiosResponse> {
        try {
            return ApiService.axiosInstance.put(resource, data, config);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * @description Send the DELETE HTTP request
     * @param resource - string
     * @returns Promise<AxiosResponse>
     */
    static async delete(resource: string): Promise<AxiosResponse> {
        try {
            return ApiService.axiosInstance.delete(resource);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * @description Encrypt data before sending to server.
     * @param data - Outgoing text
     * @returns Encrypted text
     */
    // static encryptData(data: any): string {
    //     try {
    //         let secretKey = "3a1c7f4e5b8c9e7f2d6e0b8a1c4e2a7f5b8c9e7f2d6e0b8a1c4e2a7f5b8c9e7f"; // (32 bytes for AES)
    //         const iv = "d41d8cd98f00b204e9800998ecf8427e"; // Initialization vector (16 bytes for AES)

    //         if (this.userId && this.access_token) secretKey = secretKey.concat(this.userId);

    //         const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), secretKey.concat(iv)).toString();
    //         return encrypted;
    //     } catch (error) {
    //         console.log("Error During Encryption ==>", error);
    //         return "";
    //     }
    // }

    /**
     * @description Decrypt data coming from server.
     * @param data - Incoming text
     * @returns Decrypted text
     */
    // static decryptData(data: string): any {
    //     try {
    //         let secretKey = "3a1c7f4e5b8c9e7f2d6e0b8a1c4e2a7f5b8c9e7f2d6e0b8a1c4e2a7f5b8c9e7f"; // (32 bytes for AES)
    //         const iv = "d41d8cd98f00b204e9800998ecf8427e"; // Initialization vector (16 bytes for AES)

    //         if (this.userId && this.access_token) secretKey = secretKey.concat(this.userId);

    //         const bytes = CryptoJS.AES.decrypt(data, secretKey.concat(iv));
    //         const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    //         return decryptedData;
    //     } catch (error) {
    //         console.log("Error during Decryption ==>", error, data);
    //         return null;
    //     }
    // }
}

export default ApiService;