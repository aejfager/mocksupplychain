"use client"

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, Save, Trash2, ArrowRight } from 'lucide-react';

const SupplyChainManager = () => {
    const [routes, setRoutes] = useState([
        { id: 1, from: 'Shanghai', to: 'Singapore', leadTime: 5 },
        { id: 2, from: 'Singapore', to: 'Dubai', leadTime: 7 },
        { id: 3, from: 'Dubai', to: 'Rotterdam', leadTime: 12 },
    ]);

    const [selectedRoutes, setSelectedRoutes] = useState([]);
    const [combinedRoute, setCombinedRoute] = useState(null);

    // State for route building
    const [routeSegments, setRouteSegments] = useState([]);
    const [newSegment, setNewSegment] = useState({ type: 'manual', from: '', to: '', leadTime: '' });

    const addSegment = () => {
        if (newSegment.type === 'manual' && newSegment.from && newSegment.to && newSegment.leadTime) {
            const lastSegment = routeSegments[routeSegments.length - 1];
            if (!lastSegment || lastSegment.to === newSegment.from) {
                setRouteSegments([...routeSegments, { ...newSegment, id: `manual-${Date.now()}` }]);
                setNewSegment({ type: 'manual', from: '', to: '', leadTime: '' });
            } else {
                alert('The new segment must start from the previous segment\'s destination');
            }
        }
    };

    const addExistingRoute = (route) => {
        const lastSegment = routeSegments[routeSegments.length - 1];
        if (!lastSegment || lastSegment.to === route.from) {
            setRouteSegments([...routeSegments, { ...route, type: 'existing' }]);
        } else {
            alert('The selected route must start from the previous segment\'s destination');
        }
    };

    const removeSegment = (index) => {
        setRouteSegments(routeSegments.filter((_, i) => i !== index));
    };

    const saveCompositeRoute = () => {
        if (routeSegments.length > 0) {
            const newRoute = {
                id: routes.length + 1,
                from: routeSegments[0].from,
                to: routeSegments[routeSegments.length - 1].to,
                leadTime: routeSegments.reduce((sum, segment) => sum + Number(segment.leadTime), 0),
                via: routeSegments.slice(0, -1).map(segment => segment.to),
                isComposite: true,
                segments: routeSegments
            };
            setRoutes([...routes, newRoute]);
            setRouteSegments([]);
            setNewSegment({ type: 'manual', from: '', to: '', leadTime: '' });
        }
    };

    const deleteRoute = (id) => {
        setRoutes(routes.filter(route => route.id !== id));
        setSelectedRoutes(selectedRoutes.filter(routeId => routeId !== id));
    };

    return (
        <div className="space-y-8 p-4 max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Build New Route</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Current route segments */}
                    {routeSegments.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <h3 className="font-medium">Current Route Segments:</h3>
                            <div className="flex flex-wrap gap-2 items-center">
                                {routeSegments.map((segment, index) => (
                                    <div key={segment.id || index} className="flex items-center">
                                        <div className="bg-white px-3 py-1 rounded border flex items-center gap-2">
                                            <span>{segment.from} → {segment.to}</span>
                                            <span className="text-sm text-gray-500">({segment.leadTime}d)</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => removeSegment(index)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        {index < routeSegments.length - 1 && (
                                            <ArrowRight className="w-4 h-4 mx-2 text-gray-400" />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm text-gray-500">
                                Total Lead Time: {routeSegments.reduce((sum, segment) => sum + Number(segment.leadTime), 0)} days
                            </div>
                        </div>
                    )}

                    {/* Add new segment form */}
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <Input
                                placeholder="Origin"
                                value={newSegment.from}
                                onChange={(e) => setNewSegment({ ...newSegment, from: e.target.value })}
                                className="flex-1"
                            />
                            <Input
                                placeholder="Destination"
                                value={newSegment.to}
                                onChange={(e) => setNewSegment({ ...newSegment, to: e.target.value })}
                                className="flex-1"
                            />
                            <Input
                                placeholder="Lead Time (days)"
                                type="number"
                                value={newSegment.leadTime}
                                onChange={(e) => setNewSegment({ ...newSegment, leadTime: e.target.value })}
                                className="flex-1"
                            />
                            <Button onClick={addSegment} className="whitespace-nowrap">
                                <Plus className="w-4 h-4 mr-2" /> Add Segment
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <Button
                            onClick={saveCompositeRoute}
                            disabled={routeSegments.length === 0}
                            variant="default"
                        >
                            Save Complete Route
                        </Button>
                        {routeSegments.length > 0 && (
                            <Button
                                variant="outline"
                                onClick={() => setRouteSegments([])}
                            >
                                Clear All Segments
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Available Routes</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>From</TableHead>
                                <TableHead>To</TableHead>
                                <TableHead className="w-32">Lead Time (days)</TableHead>
                                <TableHead className="w-32">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {routes.map((route) => (
                                <TableRow key={route.id}>
                                    <TableCell>{route.from}</TableCell>
                                    <TableCell>{route.to}</TableCell>
                                    <TableCell className="text-right">{route.leadTime}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => deleteRoute(route.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => addExistingRoute(route)}
                                            >
                                                Use in Route
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default SupplyChainManager;