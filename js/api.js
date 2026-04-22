/**
 * Feishu API Module
 * Connect to Feishu Open Platform API
 */

class FeishuAPI {
    constructor() {
        this.appId = CONFIG.FEISHU_APP_ID;
        this.appSecret = CONFIG.FEISHU_APP_SECRET;
        this.baseUrl = 'https://open.feishu.cn/open-apis';
        this.accessToken = null;
        this.tokenExpireTime = 0;
    }

    /**
     * Get tenant_access_token
     */
    async getAccessToken() {
        if (this.accessToken && Date.now() < this.tokenExpireTime) {
            return this.accessToken;
        }

        const url = `${this.baseUrl}/auth/v3/tenant_access_token/internal`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                app_id: this.appId,
                app_secret: this.appSecret
            })
        });

        const data = await response.json();
        
        if (data.code !== 0) {
            throw new Error(`Get Access Token Failed: ${data.msg}`);
        }

        this.accessToken = data.tenant_access_token;
        this.tokenExpireTime = Date.now() + (data.expire - 300) * 1000;
        
        return this.accessToken;
    }

    /**
     * Get Bitable Records
     */
    async getRecords(appToken, tableId, options = {}) {
        const token = await this.getAccessToken();
        
        const params = new URLSearchParams();
        
        if (options.pageToken) {
            params.append('page_token', options.pageToken);
        }
        
        if (options.pageSize) {
            params.append('page_size', options.pageSize);
        }

        const url = `${this.baseUrl}/bitable/v1/apps/${appToken}/tables/${tableId}/records?${params.toString()}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        
        if (data.code !== 0) {
            throw new Error(`Get Records Failed: ${data.msg}`);
        }

        return data.data;
    }

    /**
     * Get All Records (Auto Pagination)
     */
    async getAllRecords(appToken, tableId, filter = null) {
        const allRecords = [];
        let pageToken = null;
        const pageSize = 100;

        do {
            const options = {
                pageToken: pageToken,
                pageSize: pageSize
            };

            if (filter) {
                options.filter = this.buildFilterParam(filter);
            }

            const data = await this.getRecords(appToken, tableId, options);
            
            if (data.items && data.items.length > 0) {
                allRecords.push(...data.items);
            }

            pageToken = data.has_more ? data.next_page_token : null;
            
            if (allRecords.length >= 1000) {
                console.warn('Records exceeded 1000, stop fetching');
                break;
            }

        } while (pageToken);

        return allRecords;
    }

    /**
     * Build Filter Parameter
     */
    buildFilterParam(filter) {
        const conditions = [];
        
        for (const [fieldName, value] of Object.entries(filter)) {
            if (value === '' || value === null || value === undefined) {
                continue;
            }

            if (typeof value === 'object' && value.min !== undefined) {
                if (value.min !== '') {
                    conditions.push({
                        field_name: fieldName,
                        operator: 'numberGreaterThan',
                        value: [parseInt(value.min)]
                    });
                }
                if (value.max !== '') {
                    conditions.push({
                        field_name: fieldName,
                        operator: 'numberLessThan',
                        value: [parseInt(value.max)]
                    });
                }
            } else {
                const operator = typeof value === 'string' && value.includes('%') ? 'contains' : 'is';
                conditions.push({
                    field_name: fieldName,
                    operator: operator,
                    value: [value]
                });
            }
        }

        if (conditions.length === 0) {
            return '';
        }

        const filterObj = {
            conjunction: 'and',
            conditions: conditions
        };

        return encodeURIComponent(JSON.stringify(filterObj));
    }

    /**
     * Search Records
     */
    async searchRecords(appToken, tableId, searchWord) {
        const token = await this.getAccessToken();
        
        const params = new URLSearchParams({
            search_word: searchWord
        });

        const url = `${this.baseUrl}/bitable/v1/apps/${appToken}/tables/${tableId}/records/search?${params.toString()}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        
        if (data.code !== 0) {
            throw new Error(`Search Failed: ${data.msg}`);
        }

        return data.data;
    }
}

// Create Global API Instance
const feishuAPI = new FeishuAPI();
