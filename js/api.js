/**
 * Velaa Vehicle Management API Service
 * Professional API integration with comprehensive error handling
 * Version 2.0.0
 */

class VelaaAPI {
    constructor() {
        // Use environment configuration
        this.baseURL = window.envConfig ? window.envConfig.getApiBaseUrl() : 'http://localhost:5001/api';
        this.timeout = 30000; // 30 seconds
        this.registrationData = {}; // Store registration data across steps
        this.defaultCountryCode = '+255'; // Tanzania country code
        this.mockMode = window.envConfig ? window.envConfig.isMockMode() : false; // Set to true for testing without backend
        // Load token from storage instead of hardcoding
        this.token = this.getStoredToken();
    }

    /**
     * Generic API request method with error handling
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise<Object>} API response
     */
    async request(endpoint, options = {}) {
        let url = `${this.baseURL}${endpoint}`;
        // Support query params passed via options.params
        if (options && options.params && typeof options.params === 'object') {
            const qs = new URLSearchParams();
            Object.entries(options.params).forEach(([k, v]) => {
                if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
            });
            const qsStr = qs.toString();
            if (qsStr) url += (url.includes('?') ? '&' : '?') + qsStr;
            // Do not forward params into fetch init
            delete options.params;
        }
        
        const isFormData = (typeof FormData !== 'undefined') && (options && options.body instanceof FormData);

        const defaultOptions = {
            method: 'GET',
            headers: isFormData
                ? { ...(options.headers || {}) }
                : { 'Content-Type': 'application/json', ...(options.headers || {}) },
            timeout: this.timeout
        };

        // Attach Authorization header if token exists
        const authHeaders = {};
        if (this.token) {
            authHeaders['Authorization'] = `Bearer ${this.token}`;
        }

        const config = { ...defaultOptions, ...options };
        config.headers = { ...(config.headers || {}), ...authHeaders };

        // Stringify JSON body if not FormData
        if (config.body && !isFormData && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            console.log('[API][REQUEST] url=', url);
            console.log('[API][REQUEST] options.method=', config.method);
            console.log('[API][REQUEST] options.headers=', config.headers);
            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                ...config,
                cache: 'no-store',
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.log('[API][RESPONSE][ERROR]', response.status, errorData);
                
                // Handle 401 Unauthorized - token expired or invalid
                if (response.status === 401) {
                    console.warn('[API] Token expired or invalid, clearing token and redirecting to login');
                    this.clearToken();
                    // Redirect to login if not already there
                    if (!window.location.pathname.includes('index.html') && !window.location.pathname.endsWith('/')) {
                        setTimeout(() => {
                            window.location.href = '/index.html?expired=true';
                        }, 1000);
                    }
                }
                
                throw new APIError(
                    errorData.message || `HTTP ${response.status}: ${response.statusText}`,
                    response.status,
                    errorData
                );
            }

            const json = await response.json();
            console.log('[API][RESPONSE][OK] status=', response.status, 'dataKeys=', Object.keys(json||{}));
            return json;
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new APIError('Request timeout. Please try again.', 408);
            }
            
            if (error instanceof APIError) {
                console.log('[API][ERROR] APIError message=', error.message, 'status=', error.status, 'data=', error.data);
                throw error;
            }

            // Network or other errors
            console.log('[API][ERROR] Network/Other err=', error && error.stack ? error.stack : error);
            throw new APIError(
                'Network error. Please check your connection and try again.',
                0,
                { originalError: error.message }
            );
        }
    }

    /**
     * Token management helpers
     */
    getStoredToken() {
        try {
            return localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '';
        } catch (_) {
            return '';
        }
    }

    setToken(token, persist = true) {
        this.token = token || '';
        try {
            if (persist) {
                localStorage.setItem('authToken', this.token);
            } else {
                sessionStorage.setItem('authToken', this.token);
            }
        } catch (_) {}
    }

    clearToken() {
        this.token = '';
        try {
            localStorage.removeItem('authToken');
            sessionStorage.removeItem('authToken');
        } catch (_) {}
    }

    /**
     * Client Management APIs
     */

    /**
     * Get All Clients with Pagination and Filtering
     * @param {Object} params - { page, limit, search, type, isActive, sort, sortBy, sortOrder }
     * @returns {Promise<Object>} Paged client list with pagination info
     */
    async getClients(params = {}) {
        console.log('getClients called with params:', params);
        console.log('mockMode:', this.mockMode);
        
        if (this.mockMode) {
            console.log('Using mock data for getClients');
            await new Promise(r => setTimeout(r, 300));
            
            // Mock clients data - expanded for better testing
            const allClients = [
                { _id: 'mock_client_1', name: 'Owen Motors', phone: '+255 754 000001', type: 'Dealer', isActive: true, outstandingBalance: 0, createdAt: new Date('2024-01-15') },
                { _id: 'mock_client_2', name: 'Amani Logistics', phone: '+255 715 000002', type: 'Company', isActive: true, outstandingBalance: 150000, createdAt: new Date('2024-02-10') },
                { _id: 'mock_client_3', name: 'Neema Joseph', phone: '+255 689 000003', type: 'Individual', isActive: true, outstandingBalance: 75000, createdAt: new Date('2024-02-20') },
                { _id: 'mock_client_4', name: 'John Smith', phone: '+255858585811', type: 'Individual', isActive: true, outstandingBalance: 0, createdAt: new Date('2024-03-01') },
                { _id: 'mock_client_5', name: 'Test Client', phone: '+255123456789', type: 'Individual', isActive: true, outstandingBalance: 0, createdAt: new Date('2024-03-05') },
                { _id: 'mock_client_6', name: 'Sarah Wilson', phone: '+255 755 987654', type: 'Individual', isActive: false, outstandingBalance: 25000, createdAt: new Date('2024-03-10') },
                { _id: 'mock_client_7', name: 'Tech Solutions Ltd', phone: '+255 22 1234567', type: 'Company', isActive: true, outstandingBalance: 500000, createdAt: new Date('2024-03-15') },
                { _id: 'mock_client_8', name: 'Auto Parts Co', phone: '+255 754 111222', type: 'Dealer', isActive: true, outstandingBalance: 30000, createdAt: new Date('2024-03-20') },
                { _id: 'mock_client_9', name: 'Mary Johnson', phone: '+255 715 333444', type: 'Individual', isActive: false, outstandingBalance: 10000, createdAt: new Date('2024-03-25') },
                { _id: 'mock_client_10', name: 'Global Motors', phone: '+255 689 555666', type: 'Company', isActive: true, outstandingBalance: 200000, createdAt: new Date('2024-03-30') },
                { _id: 'mock_client_11', name: 'Asad Ali', phone: '+255 754 123456', type: 'Company', isActive: true, outstandingBalance: 50000, createdAt: new Date('2024-04-01') },
                { _id: 'mock_client_12', name: 'Hassan Transport', phone: '+255 715 444555', type: 'Dealer', isActive: true, outstandingBalance: 75000, createdAt: new Date('2024-04-05') },
                { _id: 'mock_client_13', name: 'Fatima Ahmed', phone: '+255 689 666777', type: 'Individual', isActive: true, outstandingBalance: 0, createdAt: new Date('2024-04-10') },
                { _id: 'mock_client_14', name: 'Premium Cars Ltd', phone: '+255 22 888999', type: 'Company', isActive: false, outstandingBalance: 100000, createdAt: new Date('2024-04-15') },
                { _id: 'mock_client_15', name: 'Ahmed Hassan', phone: '+255 754 000111', type: 'Individual', isActive: true, outstandingBalance: 25000, createdAt: new Date('2024-04-20') },
                { _id: 'mock_client_16', name: 'Test Client111', phone: '+255754123456', type: 'Individual', isActive: true, outstandingBalance: 0, createdAt: new Date('2024-04-21') }
            ];
            
            let filteredClients = [...allClients];
            
            // Apply search filter with improved phone number matching
            if (params.search || params.q) {
                const searchTerm = (params.search || params.q).toLowerCase();
                console.log(`Applying search filter: "${searchTerm}"`);
                console.log('Before search filter:', filteredClients.map(c => ({ name: c.name, type: c.type })));
                
                filteredClients = filteredClients.filter(client => {
                    // Always search in name and company name
                    const nameMatch = client.name.toLowerCase().includes(searchTerm);
                    const companyMatch = client.companyName && client.companyName.toLowerCase().includes(searchTerm);
                    
                    // For phone number search, be more specific (matching backend logic)
                    let phoneMatch = false;
                    if (/^[\d\s\-\+\(\)]+$/.test(searchTerm) && searchTerm.length >= 6) {
                        // If search term contains only digits, spaces, dashes, plus, parentheses and is 6+ chars
                        phoneMatch = client.phone.includes(searchTerm);
                    } else if (/^\d{10,}$/.test(searchTerm)) {
                        // If search term is 10+ digits (full phone number)
                        phoneMatch = client.phone.includes(searchTerm);
                    }
                    
                    return nameMatch || companyMatch || phoneMatch;
                });
                
                console.log(`Filtered by search "${searchTerm}":`, filteredClients.length, 'clients');
                console.log('After search filter:', filteredClients.map(c => ({ name: c.name, type: c.type })));
            }
            
            // Apply type filter
            if (params.type) {
                console.log(`Applying type filter: "${params.type}"`);
                console.log('Before type filter:', filteredClients.map(c => ({ name: c.name, type: c.type })));
                filteredClients = filteredClients.filter(client => 
                    client.type.toLowerCase() === params.type.toLowerCase()
                );
                console.log(`Filtered by type "${params.type}":`, filteredClients.length, 'clients');
                console.log('After type filter:', filteredClients.map(c => ({ name: c.name, type: c.type })));
            }
            
            // Apply status filter
            if (params.isActive !== undefined) {
                filteredClients = filteredClients.filter(client => 
                    client.isActive === (params.isActive === 'true' || params.isActive === true)
                );
                console.log(`Filtered by status "${params.isActive}":`, filteredClients.length, 'clients');
            }

            // Apply sorting
            if (params.sort || params.sortBy) {
                const sortField = params.sortBy || (params.sort ? params.sort.replace('-', '') : 'createdAt');
                const sortOrder = params.sortOrder || (params.sort && params.sort.startsWith('-') ? 'desc' : 'asc');
                
                filteredClients.sort((a, b) => {
                    let aVal = a[sortField];
                    let bVal = b[sortField];
                    
                    if (typeof aVal === 'string') {
                        aVal = aVal.toLowerCase();
                        bVal = bVal.toLowerCase();
                    }
                    
                    if (sortOrder === 'desc') {
                        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
                    } else {
                        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
                    }
                });
            }
            
            // Apply pagination
            const page = parseInt(params.page) || 1;
            const limit = parseInt(params.limit) || 10;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedClients = filteredClients.slice(startIndex, endIndex);
            
            const mockData = {
                success: true,
                data: paginatedClients,
                pagination: {
                    total: filteredClients.length,
                    page: page,
                    limit: limit,
                    pages: Math.ceil(filteredClients.length / limit),
                    hasNext: page < Math.ceil(filteredClients.length / limit),
                    hasPrev: page > 1,
                    nextPage: page < Math.ceil(filteredClients.length / limit) ? page + 1 : null,
                    prevPage: page > 1 ? page - 1 : null
                }
            };
            console.log('Mock data response:', mockData);
            return mockData;
        }

        const query = new URLSearchParams();
        Object.entries(params || {}).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
        });
        const qp = query.toString();
        return this.request(`/clients${qp ? `?${qp}` : ''}`, { method: 'GET' });
    }

    /**
     * Create Client
     * @param {Object} clientData - Client data
     * @returns {Promise<Object>} Created client
     */
    async createClient(clientData) {
        if (this.mockMode) {
            await new Promise(r => setTimeout(r, 500));
            return {
                success: true,
                data: {
                    _id: 'mock_client_' + Date.now(),
                    ...clientData,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            };
        }

        return this.request('/clients', {
            method: 'POST',
            body: JSON.stringify(clientData)
        });
    }

    /**
     * Get Client by ID
     * @param {string} clientId - Client ID
     * @returns {Promise<Object>} Client data
     */
    async getClient(clientId) {
        if (this.mockMode) {
            console.log('Using mock data for getClient with ID:', clientId);
            await new Promise(r => setTimeout(r, 300));
            
            // Mock clients data (same as in getClients)
            const allClients = [
                { _id: 'mock_client_1', name: 'Owen Motors', phone: '+255 754 000001', type: 'Dealer', isActive: true, outstandingBalance: 0 },
                { _id: 'mock_client_2', name: 'Amani Logistics', phone: '+255 715 000002', type: 'Company', isActive: true, outstandingBalance: 150000 },
                { _id: 'mock_client_3', name: 'Neema Joseph', phone: '+255 689 000003', type: 'Individual', isActive: true, outstandingBalance: 75000 },
                { _id: 'mock_client_4', name: 'John', phone: '+255858585811', type: 'Individual', isActive: true, outstandingBalance: 0 },
                { _id: 'mock_client_5', name: 'Test Client', phone: '+255123456789', type: 'Individual', isActive: true, outstandingBalance: 0 },
                { _id: 'mock_client_6', name: 'Sarah Wilson', phone: '+255 755 987654', type: 'Individual', isActive: false, outstandingBalance: 25000 },
                { _id: 'mock_client_7', name: 'Tech Solutions Ltd', phone: '+255 22 1234567', type: 'Company', isActive: true, outstandingBalance: 500000 }
            ];
            
            // Find the client by ID
            const client = allClients.find(c => c._id === clientId);
            
            if (client) {
                return {
                    success: true,
                    data: client
                };
            } else {
                // Return a default client if not found
                return {
                    success: true,
                    data: {
                        _id: clientId,
                        name: 'Unknown Client',
                        phone: '+255 000 000000',
                        type: 'Individual',
                        isActive: true,
                        outstandingBalance: 0
                    }
                };
            }
        }

        return this.request(`/clients/${clientId}`, { method: 'GET' });
    }

    /**
     * Update Client
     * @param {string} clientId - Client ID
     * @param {Object} updates - Update data
     * @returns {Promise<Object>} Updated client
     */
    async updateClient(clientId, updates) {
        if (this.mockMode) {
            await new Promise(r => setTimeout(r, 500));
            return {
                success: true,
                data: {
                    _id: clientId,
                    ...updates,
                    updatedAt: new Date().toISOString()
                }
            };
        }

        return this.request(`/clients/${clientId}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    }

    /**
     * Delete Client
     * @param {string} clientId - Client ID
     * @returns {Promise<Object>} Deletion response
     */
    async deleteClient(clientId) {
        if (this.mockMode) {
            await new Promise(r => setTimeout(r, 300));
            return {
                success: true,
                data: { message: 'Client deleted successfully' }
            };
        }

        return this.request(`/clients/${clientId}`, { method: 'DELETE' });
    }

    /**
     * Search Clients with Advanced Filtering
     * @param {Object} params - Search parameters
     * @returns {Promise<Object>} Search results with pagination
     */
    async searchClients(params = {}) {
        console.log('searchClients called with params:', params);
        
        if (this.mockMode) {
            await new Promise(r => setTimeout(r, 300));
            
            // Use the same mock data as getClients for consistency
            const allClients = [
                { _id: 'mock_client_1', name: 'Owen Motors', phone: '+255 754 000001', type: 'Dealer', isActive: true, outstandingBalance: 0, createdAt: new Date('2024-01-15') },
                { _id: 'mock_client_2', name: 'Amani Logistics', phone: '+255 715 000002', type: 'Company', isActive: true, outstandingBalance: 150000, createdAt: new Date('2024-02-10') },
                { _id: 'mock_client_3', name: 'Neema Joseph', phone: '+255 689 000003', type: 'Individual', isActive: true, outstandingBalance: 75000, createdAt: new Date('2024-02-20') },
                { _id: 'mock_client_4', name: 'John Smith', phone: '+255858585811', type: 'Individual', isActive: true, outstandingBalance: 0, createdAt: new Date('2024-03-01') },
                { _id: 'mock_client_5', name: 'Test Client', phone: '+255123456789', type: 'Individual', isActive: true, outstandingBalance: 0, createdAt: new Date('2024-03-05') },
                { _id: 'mock_client_6', name: 'Sarah Wilson', phone: '+255 755 987654', type: 'Individual', isActive: false, outstandingBalance: 25000, createdAt: new Date('2024-03-10') },
                { _id: 'mock_client_7', name: 'Tech Solutions Ltd', phone: '+255 22 1234567', type: 'Company', isActive: true, outstandingBalance: 500000, createdAt: new Date('2024-03-15') },
                { _id: 'mock_client_8', name: 'Auto Parts Co', phone: '+255 754 111222', type: 'Dealer', isActive: true, outstandingBalance: 30000, createdAt: new Date('2024-03-20') },
                { _id: 'mock_client_9', name: 'Mary Johnson', phone: '+255 715 333444', type: 'Individual', isActive: false, outstandingBalance: 10000, createdAt: new Date('2024-03-25') },
                { _id: 'mock_client_10', name: 'Global Motors', phone: '+255 689 555666', type: 'Company', isActive: true, outstandingBalance: 200000, createdAt: new Date('2024-03-30') },
                { _id: 'mock_client_11', name: 'Asad Ali', phone: '+255 754 123456', type: 'Company', isActive: true, outstandingBalance: 50000, createdAt: new Date('2024-04-01') },
                { _id: 'mock_client_12', name: 'Hassan Transport', phone: '+255 715 444555', type: 'Dealer', isActive: true, outstandingBalance: 75000, createdAt: new Date('2024-04-05') },
                { _id: 'mock_client_13', name: 'Fatima Ahmed', phone: '+255 689 666777', type: 'Individual', isActive: true, outstandingBalance: 0, createdAt: new Date('2024-04-10') },
                { _id: 'mock_client_14', name: 'Premium Cars Ltd', phone: '+255 22 888999', type: 'Company', isActive: false, outstandingBalance: 100000, createdAt: new Date('2024-04-15') },
                { _id: 'mock_client_15', name: 'Ahmed Hassan', phone: '+255 754 000111', type: 'Individual', isActive: true, outstandingBalance: 25000, createdAt: new Date('2024-04-20') },
                { _id: 'mock_client_16', name: 'Test Client111', phone: '+255754123456', type: 'Individual', isActive: true, outstandingBalance: 0, createdAt: new Date('2024-04-21') }
            ];
            
            let filtered = [...allClients];
            
            // Apply search filter with improved phone number matching
            if (params.q || params.search) {
                const searchTerm = (params.q || params.search).toLowerCase();
                filtered = filtered.filter(c => {
                    // Always search in name and company name
                    const nameMatch = c.name.toLowerCase().includes(searchTerm);
                    const companyMatch = c.companyName && c.companyName.toLowerCase().includes(searchTerm);
                    
                    // For phone number search, be more specific (matching backend logic)
                    let phoneMatch = false;
                    if (/^[\d\s\-\+\(\)]+$/.test(searchTerm) && searchTerm.length >= 6) {
                        // If search term contains only digits, spaces, dashes, plus, parentheses and is 6+ chars
                        phoneMatch = c.phone.includes(searchTerm);
                    } else if (/^\d{10,}$/.test(searchTerm)) {
                        // If search term is 10+ digits (full phone number)
                        phoneMatch = c.phone.includes(searchTerm);
                    }
                    
                    return nameMatch || companyMatch || phoneMatch;
                });
            }
            
            // Apply type filter
            if (params.type) {
                filtered = filtered.filter(c => c.type.toLowerCase() === params.type.toLowerCase());
            }
            
            // Apply status filter
            if (params.isActive !== undefined) {
                filtered = filtered.filter(c => c.isActive === (params.isActive === 'true' || params.isActive === true));
            }

            // Apply pagination
            const page = parseInt(params.page) || 1;
            const limit = parseInt(params.limit) || 10;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedClients = filtered.slice(startIndex, endIndex);

            return {
                success: true,
                data: paginatedClients,
                pagination: {
                    total: filtered.length,
                    page: page,
                    limit: limit,
                    pages: Math.ceil(filtered.length / limit),
                    hasNext: page < Math.ceil(filtered.length / limit),
                    hasPrev: page > 1,
                    searchQuery: params.q || params.search
                }
            };
        }

        const query = new URLSearchParams();
        Object.entries(params || {}).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
        });
        const qp = query.toString();
        return this.request(`/clients/search${qp ? `?${qp}` : ''}`, { method: 'GET' });
    }

    /**
     * Vehicle Management APIs
     */

    /**
     * Get all vehicles with pagination and filtering
     * @param {Object} params - Query parameters (page, limit, search, brand, status, etc.)
     * @returns {Promise<Object>} Vehicles list with pagination
     */
    async getVehicles(params = {}) {
        console.log('getVehicles called with params:', params);
        
        if (this.mockMode) {
            await new Promise(r => setTimeout(r, 300));
            
            // Mock vehicles data
            const allVehicles = [
                { _id: 'mock_vehicle_1', chassisNumber: 'GYWBR32E779056478', brand: 'Audi', year: 2023, color: 'Black', status: 'Available', marketValue: 45000, purchaseDate: new Date('2025-10-18'), bondExpiryDate: new Date('2025-09-18'), owner: { name: 'Test Client111' }, isActive: true },
                { _id: 'mock_vehicle_2', chassisNumber: 'JTDBR32E720056478', brand: 'Toyota', year: 2022, color: 'White', status: 'Available', marketValue: 35000, purchaseDate: new Date('2025-10-18'), bondExpiryDate: new Date('2025-09-18'), owner: { name: 'John Smith' }, isActive: true },
                { _id: 'mock_vehicle_3', chassisNumber: 'WCT79827962718MLK', brand: 'Benz', year: 2024, color: 'Silver', status: 'Sold', marketValue: 75000, purchaseDate: new Date('2025-10-18'), bondExpiryDate: new Date('2025-09-18'), owner: { name: 'ABC Company' }, isActive: true },
                { _id: 'mock_vehicle_4', chassisNumber: 'TCT79027962718MXV', brand: 'Toyota', year: 2023, color: 'Blue', status: 'Sold', marketValue: 38000, purchaseDate: new Date('2025-10-18'), bondExpiryDate: new Date('2025-09-18'), owner: { name: 'Mary Johnson' }, isActive: true },
                { _id: 'mock_vehicle_5', chassisNumber: 'GYWBR32E779056478', brand: 'Nissan', year: 2023, color: 'Red', status: 'Available', marketValue: 42000, purchaseDate: new Date('2025-10-18'), bondExpiryDate: new Date('2025-09-18'), owner: { name: 'XYZ Motors' }, isActive: true },
                { _id: 'mock_vehicle_6', chassisNumber: 'JTDBR32E720056478', brand: 'Nissan', year: 2022, color: 'Black', status: 'Sold', marketValue: 40000, purchaseDate: new Date('2025-10-18'), bondExpiryDate: new Date('2025-09-18'), owner: { name: 'Sarah Williams' }, isActive: true },
                { _id: 'mock_vehicle_7', chassisNumber: 'GYWBR32E779056478', brand: 'Audi', year: 2024, color: 'White', status: 'Available', marketValue: 48000, purchaseDate: new Date('2025-10-18'), bondExpiryDate: new Date('2025-09-18'), owner: { name: 'Tech Solutions Tanzania' }, isActive: true }
            ];
            
            let filteredVehicles = [...allVehicles];
            
            // Apply search filter
            if (params.search || params.q) {
                const searchTerm = (params.search || params.q).toLowerCase();
                filteredVehicles = filteredVehicles.filter(vehicle => {
                    const nameMatch = vehicle.chassisNumber.toLowerCase().includes(searchTerm);
                    const brandMatch = vehicle.brand.toLowerCase().includes(searchTerm);
                    const colorMatch = vehicle.color.toLowerCase().includes(searchTerm);
                    
                    return nameMatch || brandMatch || colorMatch;
                });
            }
            
            // Apply brand filter
            if (params.brand) {
                filteredVehicles = filteredVehicles.filter(v => 
                    v.brand.toLowerCase() === params.brand.toLowerCase()
                );
            }
            
            // Apply status filter
            if (params.status) {
                filteredVehicles = filteredVehicles.filter(v => 
                    v.status.toLowerCase() === params.status.toLowerCase()
                );
            }
            
            // Apply pagination
            const page = parseInt(params.page) || 1;
            const limit = parseInt(params.limit) || 10;
            const skip = (page - 1) * limit;
            const paginatedVehicles = filteredVehicles.slice(skip, skip + limit);
            
            return {
                success: true,
                data: paginatedVehicles,
                pagination: {
                    page,
                    limit,
                    total: filteredVehicles.length,
                    pages: Math.ceil(filteredVehicles.length / limit),
                    hasNext: page < Math.ceil(filteredVehicles.length / limit),
                    hasPrev: page > 1
                }
            };
        }

        return this.request('/vehicles', { 
            method: 'GET',
            params
        });
    }

    /**
     * Get single vehicle by ID
     * @param {string} id - Vehicle ID
     * @returns {Promise<Object>} Vehicle data
     */
    async getVehicle(id) {
        if (this.mockMode) {
            await new Promise(r => setTimeout(r, 300));
            return {
                success: true,
                data: {
                    _id: id,
                    chassisNumber: 'GYWBR32E779056478',
                    brand: 'Audi',
                    year: 2023,
                    color: 'Black',
                    status: 'Available',
                    marketValue: 45000,
                    owner: { _id: '123', name: 'Test Client' },
                    isActive: true
                }
            };
        }

        return this.request(`/vehicles/${id}`, { method: 'GET' });
    }

    /**
     * Dashboard overview (stats + chart + recent vehicles)
     */
    async getDashboardOverview() {
        return this.request('/dashboard/overview', { method: 'GET' });
    }

    /**
     * Billing - List monthly (optionally lazy-generate)
     */
    async getMonthlyBilling(month) {
        const params = {};
        if (month) params.month = month;
        return this.request('/billing/list', { method: 'GET', params });
    }

    /**
     * Create new vehicle
     * @param {Object} vehicleData - Vehicle data
     * @returns {Promise<Object>} Created vehicle
     */
    async createVehicle(vehicleData) {
        console.log('Creating vehicle:', vehicleData);
        
        if (this.mockMode) {
            await new Promise(r => setTimeout(r, 500));
            return {
                success: true,
                data: {
                    _id: 'mock_vehicle_' + Date.now(),
                    ...vehicleData,
                    createdAt: new Date().toISOString()
                },
                message: 'Vehicle created successfully'
            };
        }

        return this.request('/vehicles', {
            method: 'POST',
            body: vehicleData
        });
    }

    /**
     * Update vehicle
     * @param {string} id - Vehicle ID
     * @param {Object} updates - Update data
     * @returns {Promise<Object>} Updated vehicle
     */
    async updateVehicle(id, updates) {
        if (this.mockMode) {
            await new Promise(r => setTimeout(r, 500));
            return {
                success: true,
                data: {
                    _id: id,
                    ...updates,
                    updatedAt: new Date().toISOString()
                }
            };
        }

        return this.request(`/vehicles/${id}`, {
            method: 'PUT',
            body: updates
        });
    }

    /**
     * Delete vehicle
     * @param {string} id - Vehicle ID
     * @returns {Promise<Object>} Deletion confirmation
     */
    async deleteVehicle(id) {
        if (this.mockMode) {
            await new Promise(r => setTimeout(r, 500));
            return {
                success: true,
                message: 'Vehicle deleted successfully'
            };
        }

        return this.request(`/vehicles/${id}`, {
            method: 'DELETE'
        });
    }

    /**
     * Search vehicles
     * @param {Object} params - Search parameters
     * @returns {Promise<Object>} Search results
     */
    async searchVehicles(params) {
        console.log('searchVehicles called with params:', params);
        
        if (this.mockMode) {
            // Use same mock data as getVehicles
            return this.getVehicles(params);
        }

        return this.request('/vehicles/search', {
            method: 'GET',
            params
        });
    }

    /**
     * Get vehicle statistics
     * @returns {Promise<Object>} Vehicle stats
     */
    async getVehicleStats() {
        if (this.mockMode) {
            await new Promise(r => setTimeout(r, 300));
            return {
                success: true,
                data: {
                    byStatus: [
                        { _id: 'Available', count: 4, totalValue: 180000 },
                        { _id: 'Sold', count: 3, totalValue: 153000 }
                    ],
                    byBrand: [
                        { _id: 'Audi', count: 2 },
                        { _id: 'Toyota', count: 2 },
                        { _id: 'Nissan', count: 2 },
                        { _id: 'Benz', count: 1 }
                    ],
                    overall: {
                        total: 7,
                        totalValue: 333000,
                        avgValue: 47571
                    }
                }
            };
        }

        return this.request('/vehicles/stats', { method: 'GET' });
    }

    /**
     * Add Vehicle (legacy method - kept for compatibility)
     * @param {Object} vehicle - Vehicle payload fields
     * @param {FileList|File[]} pictures - Up to 5 image files
     * @returns {Promise<Object>} API response
     */
    async addVehicle(vehicle, pictures = []) {
        // Support mock mode minimal response
        if (this.mockMode) {
            await new Promise(r => setTimeout(r, 500));
            return {
                success: true,
                data: {
                    id: 'mock_vehicle_' + Date.now(),
                    ...vehicle,
                    pictures: Array.from(pictures).slice(0, 5).map((_, i) => `mock_image_${i}.jpg`)
                }
            };
        }

        const form = new FormData();
        Object.keys(vehicle || {}).forEach(key => {
            const value = vehicle[key];
            if (value !== undefined && value !== null) {
                form.append(key, String(value));
            }
        });

        const files = Array.from(pictures || []).slice(0, 5);
        files.forEach(file => {
            form.append('pictures', file);
            form.append('images', file); // compatibility alias
        });

        return this.request('/vehicles', {
            method: 'POST',
            body: form
        });
    }

    /**
     * Update Vehicle by ID (supports image additions up to 5 total on server)
     * @param {string} vehicleId - Vehicle identifier
     * @param {Object} updates - Updatable fields
     * @param {FileList|File[]} newPictures - Optional new images (max 5 per request)
     * @returns {Promise<Object>} API response
     */
    async updateVehicle(vehicleId, updates = {}, newPictures = []) {
        if (this.mockMode) {
            await new Promise(r => setTimeout(r, 500));
            return {
                success: true,
                data: { id: vehicleId, ...updates }
            };
        }

        const form = new FormData();
        Object.keys(updates || {}).forEach(key => {
            const value = updates[key];
            if (value !== undefined && value !== null) {
                form.append(key, String(value));
            }
        });
        const files = Array.from(newPictures || []).slice(0, 5);
        files.forEach(file => {
            form.append('pictures', file);
            form.append('images', file); // compatibility alias
        });

        return this.request(`/vehicles/${vehicleId}`, {
            method: 'PUT',
            body: form
        });
    }

    /**
     * Get Vehicle by ID
     * @param {string} vehicleId
     * @returns {Promise<Object>} Vehicle
     */
    async getVehicle(vehicleId) {
        if (this.mockMode) {
            await new Promise(r => setTimeout(r, 300));
            return {
                success: true,
                data: { id: vehicleId }
            };
        }
        return this.request(`/vehicles/${vehicleId}`, { method: 'GET' });
    }

    /**
     * Search Vehicles
     * @param {Object} params - { query, page, limit, filters }
     * @returns {Promise<Object>} Paged list
     */
    async searchVehicles(params = {}) {
        if (this.mockMode) {
            await new Promise(r => setTimeout(r, 300));
            return {
                success: true,
                data: { items: [], total: 0, page: params.page || 1, limit: params.limit || 10 }
            };
        }

        const query = new URLSearchParams();
        Object.entries(params || {}).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
        });
        const qp = query.toString();
        return this.request(`/vehicles/search${qp ? `?${qp}` : ''}`, { method: 'GET' });
    }

    /**
     * Step 1: Register User
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} Registration response
     */
    async registerUser(userData) {
        try {
            // Check if in mock mode for testing without backend
            if (this.mockMode) {
                console.log('🧪 Mock mode: Simulating API response');
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
                
                const mockResponse = {
                    success: true,
                    data: {
                        userId: 'mock_user_' + Date.now(),
                        phone: userData.phone,
                        otpSent: true,
                        nextStep: 'verify-otp'
                    }
                };
                
                // Store registration data for next steps
                this.registrationData = {
                    phone: userData.phone,
                    ownerManagerName: userData.ownerManagerName,
                    warehouseName: userData.warehouseName,
                    userId: mockResponse.data.userId
                };
                
                // Persist token for demo mode as well
                this.setToken(mockResponse.data.token);
                return mockResponse;
            }

            const response = await this.request('/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    ownerManagerName: userData.ownerManagerName,
                    warehouseName: userData.warehouseName,
                    phone: userData.phone
                })
            });

            // Store registration data for next steps
            this.registrationData = {
                phone: userData.phone,
                ownerManagerName: userData.ownerManagerName,
                warehouseName: userData.warehouseName,
                userId: response.data?.userId
            };

            return response;
        } catch (error) {
            console.error('Registration error:', error);
            
            // Auto-enable mock mode if backend is not available
            if (error.status === 0 || error.message.includes('Network error')) {
                console.log('🔄 Backend not available, enabling mock mode for testing...');
                this.mockMode = true;
                NotificationManager.warning('Backend server not available. Running in demo mode.');
                return this.registerUser(userData); // Retry with mock mode
            }
            
            throw error;
        }
    }

    /**
     * Step 2: Verify OTP
     * @param {string} phone - Phone number
     * @param {string} otp - OTP code
     * @returns {Promise<Object>} Verification response
     */
    async verifyOTP(phone, otp) {
        try {
            // Check if in mock mode for testing without backend
            if (this.mockMode) {
                console.log('🧪 Mock mode: Simulating OTP verification');
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
                
                // Accept only 1234 OTP in mock mode
                if (otp === '1234') {
                    return {
                        success: true,
                        data: {
                            user: {
                                status: 'otp-verified',
                                isOtpVerified: true,
                                isPhoneVerified: true
                            },
                            nextStep: 'create-password'
                        }
                    };
                } else {
                    throw new APIError('Invalid OTP. Please use 1234 for demo mode.', 400);
                }
            }

            const response = await this.request('/auth/verify-otp', {
                method: 'POST',
                body: JSON.stringify({
                    phone: phone,
                    otp: otp
                })
            });

            return response;
        } catch (error) {
            console.error('OTP verification error:', error);
            
            // Auto-enable mock mode if backend is not available
            if (error.status === 0 || error.message.includes('Network error')) {
                console.log('🔄 Backend not available for OTP verification, using mock mode...');
                this.mockMode = true;
                return this.verifyOTP(phone, otp); // Retry with mock mode
            }
            
            throw error;
        }
    }

    /**
     * Step 3: Complete Registration (Create Password)
     * @param {string} phone - Phone number
     * @param {string} password - User password
     * @returns {Promise<Object>} Completion response
     */
    async completeRegistration(phone, password) {
        try {
            // Check if in mock mode for testing without backend
            if (this.mockMode) {
                console.log('🧪 Mock mode: Simulating registration completion');
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
                
                const mockResponse = {
                    success: true,
                    data: {
                        token: 'mock_jwt_token_' + Date.now(),
                        user: {
                            status: 'active',
                            isPhoneVerified: true,
                            isOtpVerified: true,
                            ownerManagerName: this.registrationData.ownerManagerName,
                            warehouseName: this.registrationData.warehouseName,
                            phone: phone,
                            id: 'mock_user_' + Date.now()
                        }
                    }
                };
                
                // Clear registration data on success
                this.registrationData = {};
                return mockResponse;
            }

            const response = await this.request('/auth/complete-registration', {
                method: 'POST',
                body: JSON.stringify({
                    phone: phone,
                    password: password
                })
            });

            // Clear registration data on success
            if (response.success) {
                this.registrationData = {};
                if (response.data?.token) {
                    this.setToken(response.data.token);
                }
            }

            return response;
        } catch (error) {
            console.error('Registration completion error:', error);
            
            // Auto-enable mock mode if backend is not available
            if (error.status === 0 || error.message.includes('Network error')) {
                console.log('🔄 Backend not available for registration completion, using mock mode...');
                this.mockMode = true;
                return this.completeRegistration(phone, password); // Retry with mock mode
            }
            
            throw error;
        }
    }

    /**
     * Login User
     * @param {string} phone - Phone number
     * @param {string} password - Password
     * @returns {Promise<Object>} Login response
     */
    async login(phone, password) {
        try {
            // Check if in mock mode for testing without backend
            if (this.mockMode) {
                console.log('🧪 Mock mode: Simulating login');
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
                
                // Simple mock validation
                if (password && password.length >= 6) {
                    const mock = {
                        success: true,
                        data: {
                            token: 'mock_login_token_' + Date.now(),
                            user: {
                                id: 'mock_user_login',
                                phone: phone,
                                ownerManagerName: 'Mock User',
                                warehouseName: 'Mock Warehouse',
                                status: 'active'
                            }
                        }
                    };
                    this.setToken(mock.data.token);
                    return mock;
                } else {
                    throw new APIError('Invalid password', 401);
                }
            }

            const response = await this.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    phone: phone,
                    password: password
                })
            });

            if (response?.data?.token) {
                this.setToken(response.data.token);
            }
            return response;
        } catch (error) {
            console.error('Login error:', error);
            
            // Auto-enable mock mode if backend is not available
            if (error.status === 0 || error.message.includes('Network error')) {
                console.log('🔄 Backend not available for login, using mock mode...');
                this.mockMode = true;
                NotificationManager.warning('Backend server not available. Running in demo mode.');
                return this.login(phone, password); // Retry with mock mode
            }
            
            throw error;
        }
    }

    /**
     * Logout user: clear token and optionally notify backend (if endpoint exists)
     */
    async logout() {
        this.clearToken();
        try {
            // If backend has an auth logout endpoint, call it but ignore failures
            await this.request('/auth/logout', { method: 'POST' }).catch(() => {});
        } catch (_) {}
    }

    /**
     * Forgot Password - Send OTP
     * @param {string} phone - Phone number
     * @returns {Promise<Object>} Forgot password response
     */
    async forgotPassword(phone) {
        try {
            // Check if in mock mode for testing without backend
            if (this.mockMode) {
                console.log('🧪 Mock mode: Simulating forgot password');
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
                
                return {
                    success: true,
                    data: {
                        phone: phone,
                        otpSent: true,
                        message: 'OTP sent to your phone number'
                    }
                };
            }

            const response = await this.request('/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({
                    phone: phone
                })
            });

            return response;
        } catch (error) {
            console.error('Forgot password error:', error);
            
            // Auto-enable mock mode if backend is not available
            if (error.status === 0 || error.message.includes('Network error')) {
                console.log('🔄 Backend not available for forgot password, using mock mode...');
                this.mockMode = true;
                return this.forgotPassword(phone); // Retry with mock mode
            }
            
            throw error;
        }
    }

    /**
     * Verify Recovery OTP
     * @param {string} phone - Phone number
     * @param {string} otp - OTP code
     * @returns {Promise<Object>} Verification response
     */
    async verifyRecoveryOTP(phone, otp) {
        try {
            // Check if in mock mode for testing without backend
            if (this.mockMode) {
                console.log('🧪 Mock mode: Simulating recovery OTP verification');
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
                
                // Accept only 1234 OTP in mock mode
                if (otp === '1234') {
                    return {
                        success: true,
                        data: {
                            phone: phone,
                            otpVerified: true,
                            resetToken: 'mock_reset_token_' + Date.now()
                        }
                    };
                } else {
                    throw new APIError('Invalid recovery code. Please use 1234 for demo mode.', 400);
                }
            }

            const response = await this.request('/auth/verify-recovery-otp', {
                method: 'POST',
                body: JSON.stringify({
                    phone: phone,
                    otp: otp
                })
            });

            return response;
        } catch (error) {
            console.error('Recovery OTP verification error:', error);
            
            // Auto-enable mock mode if backend is not available
            if (error.status === 0 || error.message.includes('Network error')) {
                console.log('🔄 Backend not available for recovery OTP verification, using mock mode...');
                this.mockMode = true;
                return this.verifyRecoveryOTP(phone, otp); // Retry with mock mode
            }
            
            throw error;
        }
    }

    /**
     * Reset Password
     * @param {string} phone - Phone number
     * @param {string} otp - OTP code
     * @param {string} newPassword - New password
     * @returns {Promise<Object>} Reset response
     */
    async resetPassword(phone, otp, newPassword) {
        try {
            // Check if in mock mode for testing without backend
            if (this.mockMode) {
                console.log('🧪 Mock mode: Simulating password reset');
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
                
                return {
                    success: true,
                    data: {
                        message: 'Password reset successfully',
                        phone: phone
                    }
                };
            }

            const response = await this.request('/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({
                    phone: phone,
                    otp: otp,
                    newPassword: newPassword
                })
            });

            return response;
        } catch (error) {
            console.error('Password reset error:', error);
            
            // Auto-enable mock mode if backend is not available
            if (error.status === 0 || error.message.includes('Network error')) {
                console.log('🔄 Backend not available for password reset, using mock mode...');
                this.mockMode = true;
                return this.resetPassword(phone, otp, newPassword); // Retry with mock mode
            }
            
            throw error;
        }
    }

    /**
     * Resend OTP
     * @param {string} phone - Phone number
     * @returns {Promise<Object>} Resend response
     */
    async resendOTP(phone) {
        try {
            // Using the register endpoint to resend OTP
            const response = await this.request('/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    ownerManagerName: this.registrationData.ownerManagerName,
                    warehouseName: this.registrationData.warehouseName,
                    phone: phone
                })
            });

            return response;
        } catch (error) {
            console.error('Resend OTP error:', error);
            throw error;
        }
    }

    /**
     * Get stored registration data
     * @returns {Object} Registration data
     */
    getRegistrationData() {
        return this.registrationData;
    }

    /**
     * Clear registration data
     */
    clearRegistrationData() {
        this.registrationData = {};
    }

    /**
     * Format Tanzania phone number
     * @param {string} phone - Input phone number
     * @returns {string} Formatted phone number
     */
    formatTanzaniaPhone(phone) {
        if (!phone || typeof phone !== 'string') return phone;
        
        // Remove all non-digit characters except +
        const cleaned = phone.replace(/[\s-()]/g, '');
        
        // Handle different input formats
        if (cleaned.startsWith('+255')) {
            return cleaned; // Already in international format
        } else if (cleaned.startsWith('255')) {
            return '+' + cleaned; // Add + prefix
        } else if (cleaned.startsWith('0')) {
            return '+255' + cleaned.substring(1); // Replace 0 with +255
        } else if (/^[678]\d{8}$/.test(cleaned)) {
            return '+255' + cleaned; // Mobile number without country code
        } else if (/^(2[2-8]|23|24|25|26|27|28)\d{7}$/.test(cleaned)) {
            return '+255' + cleaned; // Landline without country code
        }
        
        return phone; // Return original if no pattern matches
    }

    /**
     * Validate Tanzania phone number
     * @param {string} phone - Phone number to validate
     * @returns {boolean} Is valid
     */
    validateTanzaniaPhone(phone) {
        if (!phone || typeof phone !== 'string') return false;
        
        // Remove all non-digit characters except +
        const cleanPhone = phone.replace(/[\s-()]/g, '');
        
        // Tanzania phone number patterns:
        // Mobile: +255 6XX XXX XXX, +255 7XX XXX XXX, +255 8XX XXX XXX (9 digits after +255)
        // Landline: +255 22 XXX XXXX, +255 24 XXX XXXX, etc. (8 digits after +255)
        
        // International format patterns
        const mobilePattern = /^\+255[678]\d{8}$/; // +255 + 6/7/8 + 8 digits = 12 total
        const landlinePattern = /^\+255(2[2-8]|23|24|25|26|27|28)\d{7}$/; // +255 + 22-28 + 7 digits = 12 total
        
        // Local format patterns (without +255)
        const localMobilePattern = /^0[678]\d{8}$/; // 0 + 6/7/8 + 8 digits = 10 total
        const localLandlinePattern = /^0(2[2-8]|23|24|25|26|27|28)\d{7}$/; // 0 + 22-28 + 7 digits = 10 total
        
        // Mobile without leading 0
        const mobileNoZeroPattern = /^[678]\d{8}$/; // 6/7/8 + 8 digits = 9 total
        const landlineNoZeroPattern = /^(2[2-8]|23|24|25|26|27|28)\d{7}$/; // 22-28 + 7 digits = 9 total
        
        return mobilePattern.test(cleanPhone) || 
               landlinePattern.test(cleanPhone) ||
               localMobilePattern.test(cleanPhone) ||
               localLandlinePattern.test(cleanPhone) ||
               mobileNoZeroPattern.test(cleanPhone) ||
               landlineNoZeroPattern.test(cleanPhone);
    }
}

/**
 * Custom API Error class
 */
class APIError extends Error {
    constructor(message, status = 0, data = {}) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
    }

    /**
     * Get user-friendly error message
     * @returns {string} User-friendly error message
     */
    getUserMessage() {
        switch (this.status) {
            case 400:
                return this.data.message || 'Please check your input and try again.';
            case 401:
                return 'Authentication failed. Please try again.';
            case 403:
                return 'Access denied. Please contact support.';
            case 404:
                return 'Service not found. Please try again later.';
            case 408:
                return 'Request timeout. Please check your connection.';
            case 422:
                return this.data.message || 'Invalid data provided. Please check your input.';
            case 429:
                return 'Too many requests. Please wait a moment before trying again.';
            case 500:
                return 'Server error. Please try again later.';
            case 503:
                return 'Service temporarily unavailable. Please try again later.';
            default:
                return this.message || 'An unexpected error occurred. Please try again.';
        }
    }

    /**
     * Check if error is retryable
     * @returns {boolean} Whether the error can be retried
     */
    isRetryable() {
        return [408, 429, 500, 502, 503, 504].includes(this.status);
    }
}

/**
 * Loading Manager for API calls
 */
class LoadingManager {
    constructor() {
        this.activeLoaders = new Set();
    }

    /**
     * Show loading state
     * @param {string} id - Unique loader ID
     * @param {string} message - Loading message
     */
    show(id, message = 'Loading...') {
        this.activeLoaders.add(id);
        
        // Create or update loader element
        let loader = document.getElementById(`loader-${id}`);
        if (!loader) {
            loader = this.createLoader(id, message);
            document.body.appendChild(loader);
        }
        
        loader.querySelector('.loader__message').textContent = message;
        loader.classList.add('show');
        
        // Disable form interactions
        this.disableInteractions();
    }

    /**
     * Hide loading state
     * @param {string} id - Loader ID to hide
     */
    hide(id) {
        this.activeLoaders.delete(id);
        
        const loader = document.getElementById(`loader-${id}`);
        if (loader) {
            loader.classList.remove('show');
            setTimeout(() => {
                if (loader.parentNode) {
                    loader.remove();
                }
            }, 300);
        }
        
        // Re-enable form interactions if no active loaders
        if (this.activeLoaders.size === 0) {
            this.enableInteractions();
        }
    }

    /**
     * Create loader element
     * @param {string} id - Loader ID
     * @param {string} message - Loading message
     * @returns {HTMLElement} Loader element
     */
    createLoader(id, message) {
        const loader = document.createElement('div');
        loader.id = `loader-${id}`;
        loader.className = 'velaa-loader';
        loader.innerHTML = `
            <div class="loader__backdrop"></div>
            <div class="loader__content">
                <div class="loader__spinner">
                    <div class="spinner"></div>
                </div>
                <div class="loader__message">${message}</div>
            </div>
        `;
        return loader;
    }

    /**
     * Disable form interactions
     */
    disableInteractions() {
        document.body.style.pointerEvents = 'none';
        document.body.style.userSelect = 'none';
        
        // Keep loaders interactive
        document.querySelectorAll('.velaa-loader').forEach(loader => {
            loader.style.pointerEvents = 'auto';
        });
    }

    /**
     * Enable form interactions
     */
    enableInteractions() {
        document.body.style.pointerEvents = '';
        document.body.style.userSelect = '';
    }

    /**
     * Hide all loaders
     */
    hideAll() {
        Array.from(this.activeLoaders).forEach(id => this.hide(id));
    }
}

/**
 * Notification Manager
 */
class NotificationManager {
    /**
     * Show success notification
     * @param {string} message - Success message
     * @param {number} duration - Display duration in ms
     */
    static success(message, duration = 4000) {
        this.show(message, 'success', duration);
    }

    /**
     * Show error notification
     * @param {string} message - Error message
     * @param {number} duration - Display duration in ms
     */
    static error(message, duration = 6000) {
        this.show(message, 'error', duration);
    }

    /**
     * Show warning notification
     * @param {string} message - Warning message
     * @param {number} duration - Display duration in ms
     */
    static warning(message, duration = 5000) {
        this.show(message, 'warning', duration);
    }

    /**
     * Show info notification
     * @param {string} message - Info message
     * @param {number} duration - Display duration in ms
     */
    static info(message, duration = 4000) {
        this.show(message, 'info', duration);
    }

    /**
     * Show notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type
     * @param {number} duration - Display duration in ms
     */
    static show(message, type = 'info', duration = 4000) {
        const notification = document.createElement('div');
        notification.className = `velaa-notification velaa-notification--${type}`;
        notification.innerHTML = `
            <div class="notification__content">
                <div class="notification__icon">
                    ${this.getIcon(type)}
                </div>
                <div class="notification__message">${message}</div>
                <button class="notification__close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Add to DOM
        document.body.appendChild(notification);

        // Show with animation
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Auto remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, duration);
    }

    /**
     * Get icon for notification type
     * @param {string} type - Notification type
     * @returns {string} Icon HTML
     */
    static getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }
}

// Initialize global instances
window.velaaAPI = new VelaaAPI();
window.loadingManager = new LoadingManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VelaaAPI, APIError, LoadingManager, NotificationManager };
}
