
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, Link as LinkIcon, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useSearchParams } from 'next/navigation';

interface AnalysisResult {
  analysis: {
    "Product Analysis": {
      name: string;
      price: string;
      reviews: number;
      rating: number;
      carbon_offset: {
        value: string;
        calculation_basis: string;
      };
      co2_footprint: {
        level: string;
        key_factors: string[];
      };
      environmental_impact: {
        resource_use: string[];
        pollution: string[];
        waste_generation: string;
      };
      eco_score: {
        score: string;
        breakdown: {
          materials: string;
          production: string;
          transport: string;
          disposal: string;
        };
      };
    };
    "Sustainability Recommendations": {
      improvement_suggestions: string[];
      eco_alternatives?: Array<{
        name: string;
        description: string;
        comparison_metrics: {
          co2_reduction: string;
          resource_savings: string[];
          waste_reduction: string;
        };
        source: string;
      }>;
    };
  };
}

export default function AnalyzePage() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [url, setUrl] = useState('');
  const searchParams = useSearchParams();
  useEffect(() => {
    const dataParam = searchParams.get('data');
    console.log("dataParam: ",dataParam)
    if (dataParam) {
      try {
        
        const parsedData = JSON.parse(dataParam);
        // const data = parsedData.json();
        console.log("parsed data:",parsedData)
        setResult(parsedData);
      } catch (error) {
        console.error('Error parsing query parameter:', error);
      }
    }
  }, [searchParams]);


  const handleAnalyze = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setAnalyzing(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/product/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      console.log(data)
      setResult(data);
    } catch (error) {
      console.error('Error analyzing the URL:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      <h1 className="text-3xl font-bold mb-8">Analyze Product</h1>

      <div className="grid  gap-8 mb-8">
      
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Product URL</h2>
          
          <form onSubmit={handleAnalyze} className="w-full space-y-4">
        <Input
          placeholder="Enter product URL"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full"
          required
        />
        <Button type="submit" className="w-full">
          <LinkIcon className="mr-2 h-4 w-4" />
          Analyze URL
        </Button>
      </form>
        </Card>
      </div>

      {analyzing && (
        <Card className="p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Analyzing product environmental impact...</p>
        </Card>
      )}

      {result && (
        <div className="space-y-6">
          {/* Eco Score */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Eco Score</h2>
            <div className="flex items-center gap-8">
              <div className="relative w-32 h-32">
                <Progress
                  value={Number(result.analysis["Product Analysis"].eco_score.score)}
                  className="h-32 w-32 [&>div]:bg-green-500"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold">
                    {result.analysis["Product Analysis"].eco_score.score}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 flex-1">
                {Object.entries(result.analysis["Product Analysis"].eco_score.breakdown).map(([key, value]) => (
                  <div key={key}>
                    <p className="font-semibold capitalize">{key}:</p>
                    <p>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Product Analysis</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Name:</p>
                <p>{result.analysis["Product Analysis"].name}</p>
              </div>
              <div>
                <p className="font-semibold">Price:</p>
                <p>{result.analysis["Product Analysis"].price}</p>
              </div>
              <div>
                <p className="font-semibold">Carbon Offset:</p>
                <p>{result.analysis["Product Analysis"].carbon_offset.value} kg CO₂</p>
                <p className="text-sm text-gray-500 mt-1">
                  {result.analysis["Product Analysis"].carbon_offset.calculation_basis}
                </p>
              </div>
              <div>
                <p className="font-semibold">CO₂ Footprint:</p>
                <p className="capitalize">{result.analysis["Product Analysis"].co2_footprint.level}</p>
                <ul className="list-disc pl-4 mt-1">
                  {result.analysis["Product Analysis"].co2_footprint.key_factors.map((factor, i) => (
                    <li key={i} className="text-sm">{factor}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          
         
          <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Sustainability Recommendations</h2>
      <ul className="space-y-3 mb-6">
        {result.analysis["Sustainability Recommendations"].improvement_suggestions.map((suggestion, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-green-500">•</span>
            <p>{suggestion}</p>
          </li>
        ))}
      </ul>

      {result.analysis["Sustainability Recommendations"].eco_alternatives?.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Eco-Friendly Alternatives</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.analysis["Sustainability Recommendations"].eco_alternatives.map((alt, index) => (
              <Card key={index} className="p-4 bg-green-50 border-green-100">
                <div className="space-y-3">
                  <h3 className="font-bold text-lg text-green-700">{alt.name}</h3>
                  <p className="text-sm text-gray-600">{alt.description}</p>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">CO₂ Reduction:</span>
                      <span className="text-green-600">{alt.comparison_metrics.co2_reduction}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Resources Saved:</span>
                      <span className="text-green-600">
                        {alt.comparison_metrics.resource_savings.join(', ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Waste Reduction:</span>
                      <span className="text-green-600">{alt.comparison_metrics.waste_reduction}</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-2 bg-green-600 hover:bg-green-700"
                    onClick={() => window.open(alt.source, '_blank')}
                  >
                    View Eco Alternative
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </Card>

         
        </div>
      )}
    </div>
  );
}