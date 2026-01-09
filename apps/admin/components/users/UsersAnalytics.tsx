"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { BarChart3, TrendingUp, Users, Calendar } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string | null;
  roles: string[];
  created_at: string;
  last_sign_in_at: string | null;
  email_verified: boolean;
  is_active: boolean;
}

interface UsersAnalyticsProps {
  users: User[];
}

const COLORS = ['#9FE870', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

export function UsersAnalytics({ users }: UsersAnalyticsProps) {
  // Calculate registration trends (last 12 months)
  const registrationTrend = useMemo(() => {
    const months: Record<string, number> = {};
    const now = new Date();
    
    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months[key] = 0;
    }
    
    // Count registrations per month
    users.forEach((user) => {
      const date = new Date(user.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (months[key] !== undefined) {
        months[key]++;
      }
    });
    
    return Object.entries(months).map(([month, count]) => ({
      month: new Date(month + '-01').toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' }),
      count,
    }));
  }, [users]);

  // Role distribution
  const roleDistribution = useMemo(() => {
    const roleCounts: Record<string, number> = {};
    users.forEach((user) => {
      if (user.roles && user.roles.length > 0) {
        user.roles.forEach((role) => {
          roleCounts[role] = (roleCounts[role] || 0) + 1;
        });
      } else {
        roleCounts['user'] = (roleCounts['user'] || 0) + 1;
      }
    });
    
    return Object.entries(roleCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [users]);

  // Activity status
  const activityStatus = useMemo(() => {
    const active = users.filter((u) => u.is_active).length;
    const inactive = users.filter((u) => !u.is_active).length;
    const verified = users.filter((u) => u.email_verified).length;
    const unverified = users.filter((u) => !u.email_verified).length;
    
    return [
      { name: 'Aktif', value: active, color: '#9FE870' },
      { name: 'Pasif', value: inactive, color: '#ef4444' },
      { name: 'Doğrulanmış', value: verified, color: '#3b82f6' },
      { name: 'Doğrulanmamış', value: unverified, color: '#f59e0b' },
    ];
  }, [users]);

  // Last sign-in distribution (last 30 days)
  const recentActivity = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const days: Record<number, number> = {};
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      days[date.getDate()] = 0;
    }
    
    users.forEach((user) => {
      if (user.last_sign_in_at) {
        const signInDate = new Date(user.last_sign_in_at);
        if (signInDate >= thirtyDaysAgo) {
          const day = signInDate.getDate();
          if (days[day] !== undefined) {
            days[day]++;
          }
        }
      }
    });
    
    return Object.entries(days).map(([day, count]) => ({
      day: `Gün ${day}`,
      count,
    }));
  }, [users]);

  return (
    <div className="space-y-6">
      {/* Registration Trend Chart */}
      <Card className="card-professional">
        <CardHeader className="pb-4 px-5 pt-5">
          <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-design-light" />
            Kayıt Trendi (Son 12 Ay)
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={registrationTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E7E7E7" />
              <XAxis dataKey="month" stroke="#7B7B7B" fontSize={12} />
              <YAxis stroke="#7B7B7B" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E7E7E7",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#9FE870"
                strokeWidth={2}
                name="Kayıt Sayısı"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Distribution */}
        <Card className="card-professional">
          <CardHeader className="pb-4 px-5 pt-5">
            <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-design-light" />
              Rol Dağılımı
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity Status */}
        <Card className="card-professional">
          <CardHeader className="pb-4 px-5 pt-5">
            <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-design-light" />
              Aktivite Durumu
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E7E7" />
                <XAxis dataKey="name" stroke="#7B7B7B" fontSize={12} />
                <YAxis stroke="#7B7B7B" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #E7E7E7",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" fill="#9FE870" radius={[4, 4, 0, 0]}>
                  {activityStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Chart */}
      <Card className="card-professional">
        <CardHeader className="pb-4 px-5 pt-5">
          <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-design-light" />
            Son 30 Gün Aktivite
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={recentActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E7E7E7" />
              <XAxis dataKey="day" stroke="#7B7B7B" fontSize={12} />
              <YAxis stroke="#7B7B7B" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E7E7E7",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

