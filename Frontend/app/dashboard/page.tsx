'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Leaf, TreePine, Globe, Upload, UploadCloud } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Input } from '@/components/ui/input';
import { Link as LinkIcon, Loader2 } from 'lucide-react';


const levels = [
  { name: "Sprout Starter", points: 0 },
  { name: "Green Explorer", points: 500 },
  { name: "Eco Hustler", points: 1000 },
  { name: "Carbon Conqueror", points: 2000 },
  { name: "Planet Protector", points: 3000 },
  { name: "Sustainability Sensei", points: 4000 },
  { name: "Earth Guardian", points: 5000 },
  { name: "Eco Legend", points: 7000 },
  { name: "Green Warrior Supreme", points: 10000 }
];
const getCurrentLevel = (points: number) => {
  return levels.reduce((prev, curr) => (points >= curr.points ? curr : prev), levels[0]);
};
const rewardMilestones = [
  {
    title: "Tree Planter",
    description: "5 trees planted in your name",
    points: 1000,
    message: "Rooting for you! You've planted your first trees! 🌱"
  },
  {
    title: "Carbon Crusher",
    description: "Offset 100kg CO2",
    points: 2000,
    message: "You're crushing carbon like a boss! Keep it up! 💨🔥"
  },
  {
    title: "Eco Warrior",
    description: "15% off eco-friendly products",
    points: 3000,
    message: "Sustainability slayer! Discounts unlocked! 🛍️♻️"
  },
  {
    title: "Planet Savior",
    description: "Free reusable product kit",
    points: 5000,
    message: "You're basically Captain Planet now! 🌍🦸‍♂️"
  }
];
export default function DashboardPage() {
  // const [defToken,setDefToken]=useState(String|null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [billImage, setBillImage] = useState(null);
  const [productUrl, setProductUrl] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    // setDefToken(token);

    if (!token) {
      router.push('/auth/login');
      return;
    }

    async function fetchUserProfile() {
      try {
        const response = await fetch('http://localhost:8000/auth/getProfile', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response)
        if (!response.ok) {
          localStorage.removeItem('token');
          router.push('/auth/login');
          return;
        }

        const data = await response.json();
        console.log("data: ", data)

        setUser(data);
        console.log(user)
      } catch (error) {
        console.error('Error fetching profile:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, [router]);


  const currentLevel = getCurrentLevel(user?.points_collected);
  const nextLevel = levels.find(l => l.points > user?.points_collected) || levels[levels.length - 1];
  const progressToNextLevel = (user?.points_collected / nextLevel.points) * 100;


  useEffect(() => { console.log("user is:", user) }, [user])
  if (loading) {
    return <p className="text-center py-10 text-lg">Loading...</p>;
  }


  const handleImageUpload = (event) => {

    const file = event.target.files[0];
    if (file) {
      setBillImage(file);
    }
  };

  const handleRewardSubmit = async () => {
    if (!billImage || !productUrl) {
      alert("Please upload a bill and enter a product URL.");
      return;
    }
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append("billImage", billImage);
    formData.append("productUrl", productUrl);

    try {
      const response = await fetch("http://localhost:8000/product/extract-text/", {
        method: "POST",
        body: formData,
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      });
      
      const data = await response.json();
      console.log(data)
      alert(`You have earned ${data.points} reward points!`);
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("Failed to process rewards. Please try again.");
    }
  };


  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Welcome, {user?.name || 'User'}</h1>
      <p className="text-gray-600">Track your environmental impact</p>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="getRwards">Get Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Leaf className="h-6 w-6 text-green-500 mr-2" />
                <h3 className="text-lg font-semibold">Plastic Saved</h3>
              </div>
              <p className="text-3xl font-bold mb-2">{user?.plastic_saved}</p>
              <p className="text-sm text-gray-600">Items this month</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center mb-4">
                <TreePine className="h-6 w-6 text-green-500 mr-2" />
                <h3 className="text-lg font-semibold">Trees Saved</h3>
              </div>
              <p className="text-3xl font-bold mb-2">{user?.tree_saved}</p>
              <p className="text-sm text-gray-600">Trees this year</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Globe className="h-6 w-6 text-green-500 mr-2" />
                <h3 className="text-lg font-semibold">Carbon Offset</h3>
              </div>
              <p className="text-3xl font-bold mb-2">{user?.carbon_offset}</p>
              <p className="text-sm text-gray-600">Tons of CO2</p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rewards">
          <Card className="p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Your Rewards</h3>
              <div className="flex items-center">
                <Leaf className="h-5 w-5 text-green-500 mr-2" />
                <span className="font-semibold">{user?.points_collected} Points</span>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <div>
                  <h4 className="font-semibold">{currentLevel.name}</h4>
                  <p className="text-sm text-gray-600">Next: {nextLevel.name}</p>
                </div>
                <p className="text-sm text-gray-600">{Math.max(0, nextLevel.points - user?.points_collected)} points needed</p>
              </div>
              <Progress value={progressToNextLevel} className="h-2" />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {rewardMilestones.map((reward, index) => {
                const progressValue = Math.min(100, (user?.points_collected / reward.points) * 100);
                return (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold">{reward.title}</h4>
                        <p className="text-sm text-gray-600">{reward.description}</p>
                      </div>
                      {user?.points_collected >= reward.points && <Button>Claim</Button>}
                    </div>
                    <Progress value={progressValue} className="h-1" />
                    <p className="text-sm text-gray-600 mt-2">{reward.points} points</p>
                    {user?.points_collected >= reward.points && (
                      <p className="text-green-500 text-sm font-semibold mt-2">{reward.message}</p>
                    )}
                  </Card>
                );
              })}
            </div>
          </Card>
        </TabsContent>
         <TabsContent value="getRwards">
         <Card className="p-4 w-full max-w-md mx-auto">
      <CardContent>
        <h2 className="text-xl font-bold mb-4">Get Rewards</h2>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">Upload your bill:</label>
          <Input type="file" accept="image/*" onChange={handleImageUpload} />
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">Product URL:</label>
          <Input type="text" value={productUrl} onChange={(e) => setProductUrl(e.target.value)} placeholder="Enter product URL" />
        </div>
        <Button onClick={handleRewardSubmit} className="w-full flex items-center justify-center">
          <UploadCloud className="mr-2" /> Submit for Rewards
        </Button>
      </CardContent>
    </Card>
    </TabsContent>
      </Tabs>
    </div>
  );
}
