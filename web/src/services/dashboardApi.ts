const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class DashboardApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Admin Analytics
  async getAdminAnalytics(timeRange: '7d' | '30d' | '90d' = '30d') {
    return this.request<{
      stats: {
        totalUsers: number;
        totalClients: number;
        totalTrainers: number;
        activeSubscriptions: number;
        monthlyRevenue: number;
        sessionsThisMonth: number;
        coursesEnrolled: number;
        gdprRequests: number;
      };
      metrics: {
        dailyActiveUsers: { date: string; count: number }[];
        popularFeatures: { feature: string; usage: number }[];
        userGrowth: { month: string; users: number }[];
      };
    }>(`/api/dashboard/admin/analytics-test?timeRange=${timeRange}`);
  }

  // Trainer Overview
  async getTrainerOverview() {
    return this.request<{
      stats: {
        totalClients: number;
        activeWorkoutPlans: number;
        upcomingSessions: number;
        monthlyRevenue: number;
        completedSessions: number;
        activeCourses: number;
      };
      activities: {
        id: string;
        type: string;
        title: string;
        description: string;
        timestamp: string;
        clientName?: string;
      }[];
    }>('/api/dashboard/trainer/overview');
  }

  // Client Management
  async getClients(params: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const searchParams = new URLSearchParams();
    
    if (params.search) searchParams.append('search', params.search);
    if (params.status) searchParams.append('status', params.status);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    return this.request<{
      clients: {
        id: string;
        name: string;
        email: string;
        joinDate: string;
        status: string;
        currentPrograms: {
          workout: string;
          nutrition: string;
        };
        nextSession: string | null;
        progress: {
          workoutsCompleted: number;
          adherenceRate: number;
        };
      }[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/api/dashboard/admin/clients${queryString ? `?${queryString}` : ''}`);
  }

  // Client Overview
  async getClientOverview() {
    return this.request<{
      currentPrograms: {
        id: string;
        type: string;
        title: string;
        description: string;
        progress: number;
        trainer: string;
      }[];
      upcomingSessions: {
        id: string;
        type: string;
        title: string;
        date: string;
        trainer: string;
        location: string;
      }[];
      achievements: {
        id: string;
        title: string;
        description: string;
        date: string;
        type: string;
      }[];
    }>('/api/dashboard/client/overview');
  }

  // System Settings
  async getSystemSettings() {
    return this.request<{
      platformName: string;
      maintenanceMode: boolean;
      registrationEnabled: boolean;
      maxUsers: number;
      sessionTimeout: number;
      gdprCompliance: boolean;
    }>('/api/dashboard/admin/settings');
  }

  // Update System Settings
  async updateSystemSettings(settings: {
    platformName?: string;
    maintenanceMode?: boolean;
    registrationEnabled?: boolean;
    maxUsers?: number;
    sessionTimeout?: number;
    gdprCompliance?: boolean;
  }) {
    return this.request<{ message: string }>('/api/dashboard/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }
}

export const dashboardApi = new DashboardApiService();
