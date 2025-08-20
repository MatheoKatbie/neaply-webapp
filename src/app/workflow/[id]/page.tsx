"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Download, Heart, Eye, Zap, Clock, DollarSign, ArrowLeft, Shield, Users, CheckCircle } from "lucide-react";
import { WorkflowPreview } from "@/components/ui/workflow-preview";

interface WorkflowDetail {
    id: string;
    title: string;
    shortDesc: string;
    longDescMd?: string;
    price: number;
    currency: string;
    seller: {
        displayName: string;
        storeName?: string;
        slug?: string;
    };
    rating: number;
    ratingCount: number;
    salesCount: number;
    heroImage?: string;
    categories: string[];
    tags: string[];
    isNew?: boolean;
    isTrending?: boolean;
    slug: string;
    createdAt: string;
    updatedAt: string;
    version: {
        semver: string;
        changelog?: string;
        n8nMinVersion?: string;
        n8nMaxVersion?: string;
        jsonContent?: any;
    };
}

export default function WorkflowDetailPage() {
    const params = useParams();
    const router = useRouter();
    const workflowId = params.id as string;

    const [workflow, setWorkflow] = useState<WorkflowDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFavorite, setIsFavorite] = useState(false);

    // Fetch workflow details
    useEffect(() => {
        const fetchWorkflow = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/marketplace/workflows/${workflowId}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        setError('Workflow not found');
                    } else {
                        setError('Failed to load workflow');
                    }
                    return;
                }

                const data = await response.json();
                setWorkflow(data.data);
            } catch (err) {
                console.error('Error fetching workflow:', err);
                setError('Failed to load workflow');
            } finally {
                setLoading(false);
            }
        };

        if (workflowId) {
            fetchWorkflow();
        }
    }, [workflowId]);

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(price / 100);
    };

    const handleFavoriteClick = () => {
        setIsFavorite(!isFavorite);
        // TODO: Implement favorite API call
    };

    const handlePurchase = () => {
        // TODO: Implement purchase flow
        console.log('Purchase workflow:', workflowId);
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gray-50 pt-20 md:pt-24">
                    <div className="max-w-7xl mx-auto px-4 py-8">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2">
                                    <div className="h-96 bg-gray-200 rounded-lg mb-6"></div>
                                    <div className="h-32 bg-gray-200 rounded-lg"></div>
                                </div>
                                <div className="h-96 bg-gray-200 rounded-lg"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (error || !workflow) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gray-50 pt-20 md:pt-24">
                    <div className="max-w-7xl mx-auto px-4 py-8">
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Zap className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {error || 'Workflow not found'}
                            </h3>
                            <p className="text-gray-600 max-w-md mx-auto mb-6">
                                The workflow you're looking for doesn't exist or may have been removed.
                            </p>
                            <Button onClick={() => router.push('/marketplace')}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Marketplace
                            </Button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 pt-20 md:pt-24">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Breadcrumb */}
                    <div className="mb-6">
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/marketplace')}
                            className="mb-4"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Marketplace
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Hero Image and Title */}
                            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                                <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 relative">
                                    {workflow.heroImage ? (
                                        <img
                                            src={workflow.heroImage}
                                            alt={workflow.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div
                                            className="w-full h-full flex items-center justify-center"
                                            style={{
                                                background: `linear-gradient(135deg, 
                                                    hsl(${parseInt(workflow.id) * 137.5 % 360}, 60%, 70%), 
                                                    hsl(${(parseInt(workflow.id) * 137.5 + 60) % 360}, 60%, 80%))`
                                            }}
                                        >
                                            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
                                                <Zap className="w-10 h-10 text-white" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Status badges */}
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        {workflow.isNew && (
                                            <Badge variant="destructive" className="text-xs">
                                                New
                                            </Badge>
                                        )}
                                        {workflow.isTrending && (
                                            <Badge className="text-xs bg-orange-500 hover:bg-orange-600">
                                                <Zap className="w-3 h-3 mr-1" />
                                                Trending
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                                {workflow.title}
                                            </h1>
                                            <p className="text-gray-600 text-lg">
                                                {workflow.shortDesc}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleFavoriteClick}
                                            className="ml-4"
                                        >
                                            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                                        </Button>
                                    </div>

                                    {/* Categories and Tags */}
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap gap-2">
                                            {workflow.categories.map((category) => (
                                                <Badge key={category} variant="secondary">
                                                    {category}
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {workflow.tags.map((tag) => (
                                                <Badge key={tag} variant="outline" className="text-gray-500">
                                                    #{tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-6 mt-6 pt-4 border-t">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            <span className="font-medium">{workflow.rating.toFixed(1)}</span>
                                            <span className="text-sm text-gray-500">({workflow.ratingCount} reviews)</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                            <Download className="w-4 h-4" />
                                            <span>{workflow.salesCount} sales</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                            <Eye className="w-4 h-4" />
                                            <span>Version {workflow.version.semver}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs for Details */}
                            <Card>
                                <Tabs defaultValue="overview" className="p-0">
                                    <div className="border-b">
                                        <TabsList className="grid w-full grid-cols-3 bg-transparent h-auto p-0">
                                            <TabsTrigger
                                                value="overview"
                                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent py-4"
                                            >
                                                Overview
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="preview"
                                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent py-4"
                                            >
                                                Preview
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="reviews"
                                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent py-4"
                                            >
                                                Reviews
                                            </TabsTrigger>
                                        </TabsList>
                                    </div>

                                    <TabsContent value="overview" className="p-6">
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-lg font-semibold mb-3">Description</h3>
                                                <div className="prose prose-gray max-w-none">
                                                    {workflow.longDescMd ? (
                                                        <div dangerouslySetInnerHTML={{ __html: workflow.longDescMd }} />
                                                    ) : (
                                                        <p>{workflow.shortDesc}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <Separator />

                                            <div>
                                                <h3 className="text-lg font-semibold mb-3">Version Information</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-500">Current Version</span>
                                                        <p className="text-lg">{workflow.version.semver}</p>
                                                    </div>
                                                    {workflow.version.n8nMinVersion && (
                                                        <div>
                                                            <span className="text-sm font-medium text-gray-500">Minimum n8n Version</span>
                                                            <p className="text-lg">{workflow.version.n8nMinVersion}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                {workflow.version.changelog && (
                                                    <div className="mt-4">
                                                        <span className="text-sm font-medium text-gray-500">Changelog</span>
                                                        <p className="mt-1">{workflow.version.changelog}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="preview" className="p-6">
                                        {workflow.version.jsonContent ? (
                                            <WorkflowPreview
                                                workflow={workflow.version.jsonContent}
                                            />
                                        ) : (
                                            <div className="text-center py-8">
                                                <p className="text-gray-500">No preview available for this workflow</p>
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="reviews" className="p-6">
                                        <div className="text-center py-8">
                                            <p className="text-gray-500">Reviews will be implemented soon</p>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Purchase Card */}
                            <Card>
                                <CardHeader>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-green-600 mb-2">
                                            {formatPrice(workflow.price, workflow.currency)}
                                        </div>
                                        <p className="text-gray-600">One-time purchase</p>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Button
                                        size="lg"
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                        onClick={handlePurchase}
                                    >
                                        <DollarSign className="w-4 h-4 mr-2" />
                                        Purchase Workflow
                                    </Button>

                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <span>Instant download</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <span>Lifetime access</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <span>Free updates</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-green-500" />
                                            <span>30-day money-back guarantee</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Seller Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Seller Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="font-medium">{workflow.seller.storeName || workflow.seller.displayName}</p>
                                            <p className="text-sm text-gray-600">n8n Workflow Expert</p>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                <span>{workflow.rating.toFixed(1)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="w-4 h-4 text-gray-400" />
                                                <span>{workflow.salesCount} sales</span>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" className="w-full">
                                            View Store
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Related Workflows */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Related Workflows</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600">
                                        Related workflows will be shown here
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
