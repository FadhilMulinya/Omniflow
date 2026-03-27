'use client';
import { useState } from 'react';
import { Badge, Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, Input, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';

import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Play,
  Pause,
  Copy,
  Trash2,
  Edit,
  MessageSquare,
  FileText,
  Database,
  Mail,
} from 'lucide-react';

// Sample data for agents
const agentTemplates = [
  {
    id: 1,
    name: 'Customer Service Bot',
    description: 'Automate customer inquiries and support requests',
    category: 'Customer Service',
    icon: <MessageSquare className="h-8 w-8 text-blue-500" />,
    popularity: 'Popular',
  },
  {
    id: 2,
    name: 'Data Analysis Agent',
    description: 'Process and analyze data from multiple sources',
    category: 'Data',
    icon: <Database className="h-8 w-8 text-green-500" />,
    popularity: 'New',
  },
  {
    id: 3,
    name: 'Content Generator',
    description: 'Create engaging content for social media and blogs',
    category: 'Content',
    icon: <FileText className="h-8 w-8 text-purple-500" />,
    popularity: '',
  },
  {
    id: 4,
    name: 'Email Automation',
    description: 'Automate email responses and follow-ups',
    category: 'Communication',
    icon: <Mail className="h-8 w-8 text-yellow-500" />,
    popularity: 'Popular',
  },
];

const myAgents = [
  {
    id: 1,
    name: 'Support Ticket Classifier',
    description: 'Classifies incoming support tickets by priority and department',
    status: 'Active',
    lastModified: '2 days ago',
    category: 'Customer Service',
  },
  {
    id: 2,
    name: 'Weekly Report Generator',
    description: 'Generates weekly performance reports from sales data',
    status: 'Active',
    lastModified: '1 week ago',
    category: 'Data',
  },
  {
    id: 3,
    name: 'Social Media Content Planner',
    description: 'Creates and schedules social media content based on trending topics',
    status: 'Inactive',
    lastModified: '3 weeks ago',
    category: 'Content',
  },
];

export default function AppPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('my-agents');

  // Filter agents based on search term
  const filteredAgents = myAgents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Agents</h1>
          <p className="text-muted-foreground">Create and manage your AI agents</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Button onClick={() => setActiveTab('create-new')}>
            <Plus className="mr-2 h-4 w-4" /> Create New Agent
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-agents">My Agents</TabsTrigger>
          <TabsTrigger value="create-new">Create New</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* My Agents Tab */}
        <TabsContent value="my-agents" className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search agents..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {filteredAgents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No agents found</h3>
              <p className="mt-2 mb-4 max-w-md">
                We couldn't find any agents matching your search. Try a different search term or
                create a new agent.
              </p>
              <Button onClick={() => setActiveTab('create-new')}>
                <Plus className="mr-2 h-4 w-4" /> Create New Agent
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAgents.map((agent) => (
                <Card key={agent.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{agent.name}</CardTitle>
                        <CardDescription className="mt-1">{agent.description}</CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center justify-between text-sm">
                      <Badge variant={agent.status === 'Active' ? 'default' : 'secondary'}>
                        {agent.status}
                      </Badge>
                      <span className="text-muted-foreground">Modified {agent.lastModified}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="flex justify-between w-full">
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </Button>
                      {agent.status === 'Active' ? (
                        <Button variant="outline" size="sm">
                          <Pause className="mr-2 h-4 w-4" /> Pause
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm">
                          <Play className="mr-2 h-4 w-4" /> Activate
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Create New Tab */}
        <TabsContent value="create-new" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create a New AI Agent</CardTitle>
              <CardDescription>
                Start from scratch or use a template to create your AI agent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Start from scratch</h3>
                <p className="text-muted-foreground">
                  Build a custom AI agent with our drag-and-drop interface
                </p>
                <Button className="mt-2">
                  <Plus className="mr-2 h-4 w-4" /> Create Blank Agent
                </Button>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or choose a template
                  </span>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {agentTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-4">
                          <div className="mt-1">{template.icon}</div>
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <CardDescription className="mt-1">
                              {template.description}
                            </CardDescription>
                          </div>
                        </div>
                        {template.popularity && (
                          <Badge variant={template.popularity === 'New' ? 'secondary' : 'default'}>
                            {template.popularity}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardFooter className="pt-2">
                      <Button variant="outline" className="w-full">
                        Use Template
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search templates..." className="pl-8" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agentTemplates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-4">
                      <div className="mt-1">{template.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="mt-1">{template.description}</CardDescription>
                      </div>
                    </div>
                    {template.popularity && (
                      <Badge variant={template.popularity === 'New' ? 'secondary' : 'default'}>
                        {template.popularity}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center text-sm">
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button className="w-full">Use Template</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
