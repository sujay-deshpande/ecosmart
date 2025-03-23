'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Leaf, BarChart3, Award } from 'lucide-react';
import Link from 'next/link';
import * as THREE from 'three';
import { motion } from 'framer-motion';

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [alreadyUser,setAlreadyUser] = useState(false);

  useEffect(()=>{

    if (typeof window !== 'undefined') {
      const value = localStorage.getItem('token');
      if( value !== null){
        setAlreadyUser(true);
      }
    }
  },[])
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const geometry = new THREE.SphereGeometry(5, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('/earth-texture.jpg');
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      bumpMap: texture,
      bumpScale: 0.1,
      opacity: 0.3,
      transparent: true
    });

    const earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    camera.position.z = 10;

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);

      earth.rotation.y += 0.001;
      earth.rotation.x += mouseY * 0.001;
      earth.rotation.y += mouseX * 0.001;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-blue-50">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full -z-10"
      />
      
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-6xl font-bold text-gray-800 mb-4 font-['Davison'] tracking-wide"
              style={{
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                fontFamily: 'Davison Brush, cursive'
              }}
            >
              Shopping towards Sustainability
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-gray-600 mb-8"
            >
              Analyze products, detect greenwashing, and earn rewards while making eco-conscious choices
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex justify-center gap-4"
            >
              <Link href="/analyze">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  Analyze Product
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                  View Dashboard
                </Button>
              </Link>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid md:grid-cols-3 gap-8 mb-16"
          >
            <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <Leaf className="h-8 w-8 text-green-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-800">Scan Product</h3>
              </div>
              <p className="text-gray-600">
                Upload an image or link to analyze a product's environmental impact
              </p>
            </Card>

            <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <BarChart3 className="h-8 w-8 text-green-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-800">View Impact</h3>
              </div>
              <p className="text-gray-600">
                Get detailed insights about the product's carbon footprint
              </p>
            </Card>

            <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <Award className="h-8 w-8 text-green-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-800">Eco Rewards</h3>
              </div>
              <p className="text-gray-600">
                Earn points and rewards for making sustainable choices
              </p>
            </Card>
          </motion.div>
{/* 
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Card className="p-8 bg-white shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                Community Impact
              </h2>
              <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                  <div className="flex justify-between mb-2 text-gray-800">
                    <span>Carbon Saved</span>
                    <span className="font-semibold">1,500kg</span>
                  </div>
                  <Progress value={75} className="h-2 bg-gray-100" />
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">167</div>
                    <div className="text-sm text-gray-600">Plastic Items Saved</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">12</div>
                    <div className="text-sm text-gray-600">Trees Planted</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">2.5</div>
                    <div className="text-sm text-gray-600">Tons CO2 Offset</div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div> */}
        </div>
      </div>
    </div>
  );
}