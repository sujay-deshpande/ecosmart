'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';

const COLORS = ['#00C49F', '#0088FE', '#FFBB28', '#FF8042'];

export default function AdminPage() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    trends: [],
    forecast: [],
    leaderboard: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const headers = { Authorization: `Bearer ${token}` };
        
        const [statsRes, trendsRes, forecastRes, leaderRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/analysis/environment/stats', { headers }),
          fetch('http://127.0.0.1:8000/analysis/environment/trends', { headers }),
          fetch('http://127.0.0.1:8000/analysis/environment/forecast', { headers }),
          fetch('http://127.0.0.1:8000/analysis/environment/leaderboard', { headers })
        ]);

        setDashboardData({
          stats: await statsRes.json(),
          trends: await trendsRes.json(),
          forecast: await forecastRes.json(),
          leaderboard: await leaderRes.json()
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        router.push('/auth/login');
      }
    };

    const userRole = localStorage.getItem('userRole');
    if (userRole === 'admin') fetchData();
    else router.push('/auth/login');
  }, [router]);

  if (loading) return <div className="text-center p-8">Loading dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Environmental Analytics Dashboard</h1>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">CO2 Reduced</h3>
          <p className="text-3xl font-bold">
            {dashboardData.stats?.total_co2_tons?.toFixed(1)} Kg
          </p>
          <Progress value={(dashboardData.stats?.total_co2_tons / 5000) * 100} />
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Plastic Saved</h3>
          <p className="text-3xl font-bold">
            {dashboardData.stats?.total_plastic_kg?.toFixed(0)} kg
          </p>
          <Progress value={(dashboardData.stats?.total_plastic_kg / 10000) * 100} />
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Trees Protected</h3>
          <p className="text-3xl font-bold">{dashboardData.stats?.total_trees_saved}</p>
          <Progress value={(dashboardData.stats?.total_trees_saved / 500) * 100} />
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Avg Points</h3>
          <p className="text-3xl font-bold">
            {dashboardData.stats?.average_points?.toFixed(0)}
          </p>
          <Progress value={dashboardData.stats?.average_points} />
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-6">Monthly Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="co2" stroke="#00C49F" />
              <Line type="monotone" dataKey="plastic" stroke="#0088FE" />
              <Line type="monotone" dataKey="trees" stroke="#FF8042" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-6">Top Contributors</h3>
          <div className="space-y-4 h-[300px] overflow-y-auto">
            {dashboardData.leaderboard.map((user, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-muted rounded">
                <div>
                  <span className="font-medium">{user.name}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    CO2: {user.carbon_offset?.toFixed(1)}kg
                  </span>
                </div>
                <div className="flex gap-4">
                  <span className="text-sm">♻️{user.plastic_saved}kg</span>
                  <span className="text-sm">🌳{user.tree_saved}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Forecast */}
      <Card className="p-6 mb-8">
        <h3 className="text-xl font-semibold mb-6">CO2 Forecast</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={dashboardData.forecast}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="ds" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="yhat" 
              fill="#00C49F" 
              stroke="#00C49F" 
              name="Predicted CO2"
            />
            <Area 
              type="monotone" 
              dataKey="yhat_lower" 
              fill="#0088FE" 
              stroke="#0088FE" 
              name="Lower Bound"
            />
            <Area 
              type="monotone" 
              dataKey="yhat_upper" 
              fill="#FF8042" 
              stroke="#FF8042" 
              name="Upper Bound"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}