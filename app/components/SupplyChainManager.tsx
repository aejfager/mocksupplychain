"use client"

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, Save, Trash2, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

const RouteSegmentVisualization = ({ segments }) => {
    return (
        <div className="relative py-4">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-200" />
            {segments.map((segment, index) => (
                <div key={segment.id || index} className="flex items-center mb-4 last:mb-0">
                    <div className="w-4 h-4 rounded-full bg-blue-500 mr-4 relative z-10" />
                    <div className="flex-1 bg-white p-3 rounded-lg border shadow-sm">
                        <div className="flex justify-between items-center">
                            <div>
                                <span className="font-medium">{segment.from}</span>
                                <ArrowRight className="inline-block w-4 h-4 mx-2 text-gray-400" />
                                <span className="font-medium">{segment.to}</span>
                            </div>
                            <div className="text-sm text-gray-500">
                                {segment.leadTime} days
                                {segment.type === 'existing' && (
                                    <span className="ml-2 text-blue-500 text-xs">(Existing Route)</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const SupplyChainManager = () => {
    const [routes, setRoutes] = useState([
        { id: 1, from: 'Shanghai', to: 'Singapore', leadTime: 5 },
        { id: 2, from: 'Singapore', to: 'Dubai', leadTime: 7 },
        { id: 3, from: 'Dubai', to: 'Rotterdam', leadTime: 12 },
    ]);

    const [selectedRoutes, setSelectedRoutes] = useState([]);
    const [combinedRoute, setCombinedRoute] = useState(null);
    const [routeSegments, setRouteSegments] = useState([]);
    const [newSegment, setNewSegment] = useState({ type: 'manual', from: '', to: '', leadTime: '' });
    const [expandedRoutes, setExpandedRoutes] = useState(new Set());

    const toggleRouteDetails = (routeId) => {
        const newExpanded = new Set(expandedRoutes);
        if (newExpanded.has(routeId)) {
            newExpanded.delete(routeId);
        } else {
            newExpanded.add(routeId);
        }
        setExpandedRoutes(newExpanded);
    };

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
                segments: routeSegments,
                totalDistance: routeSegments.length,
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
                    {/* Current route segments visualization */}
                    {routeSegments.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <h3 className="font-medium">Current Route Segments:</h3>
                            <RouteSegmentVisualization segments={routeSegments} />
                            <div className="text-sm text-gray-500 mt-4">
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
                                <TableHead>Details</TableHead>
                                <TableHead>From</TableHead>
                                <TableHead>To</TableHead>
                                <TableHead className="w-32">Lead Time</TableHead>
                                <TableHead className="w-32">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {routes.map((route) => (
                                <React.Fragment key={route.id}>
                                    <TableRow className="cursor-pointer">
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => toggleRouteDetails(route.id)}
                                            >
                                                {expandedRoutes.has(route.id) ? (
                                                    <ChevronUp className="w-4 h-4" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </TableCell>
                                        <TableCell>{route.from}</TableCell>
                                        <TableCell>{route.to}</TableCell>
                                        <TableCell className="text-right">
                                            {route.leadTime} days
                                            {route.isComposite && (
                                                <span className="ml-2 text-xs text-blue-500">(Composite)</span>
                                            )}
                                        </TableCell>
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
                                    {expandedRoutes.has(route.id) && route.isComposite && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="bg-gray-50">
                                                <div className="p-4">
                                                    <h4 className="font-medium mb-2">Route Details:</h4>
                                                    <RouteSegmentVisualization segments={route.segments} />
                                                    <div className="mt-2 text-sm text-gray-500">
                                                        <div>Number of Segments: {route.segments.length}</div>
                                                        <div>Via: {route.via.join(' → ')}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default SupplyChainManager;