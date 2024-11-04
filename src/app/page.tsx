"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartLegend } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, PieChart, Pie, Cell } from "recharts"
import { getEntries } from "@/actions/get-entries"
import { useEffect, useState } from "react"
import { type Entry } from "@/db/schema"
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns"
import { TrendingUp, Clock, Calendar, Brain, RefreshCw } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

const chartConfig = {
  count: {
    label: "Count",
    color: "#8884d8"
  },
  value: {
    label: "Value",
    color: "#82ca9d"
  },
  happy: {
    label: "Happy",
    color: "#22c55e", // green-500
  },
  neutral: {
    label: "Neutral",
    color: "#eab308", // yellow-500
  },
  sad: {
    label: "Sad",
    color: "#ef4444", // red-500
  },
  morning: {
    label: "Morning",
    color: "#8884d8"
  },
  afternoon: {
    label: "Afternoon",
    color: "#82ca9d"
  },
  evening: {
    label: "Evening",
    color: "#ffc658"
  }
}

const COLORS = ['#22c55e', '#eab308', '#ef4444']

export default function OverviewPage() {
  const [thoughts, setThoughts] = useState<Entry[]>([])
  const [activities, setActivities] = useState<Entry[]>([])

  useEffect(() => {
    async function fetchData() {
      const [thoughtsResult, activitiesResult] = await Promise.all([
        getEntries('thoughts'),
        getEntries('activity')
      ])
      
      setThoughts(thoughtsResult)
      setActivities(activitiesResult)
    }
    
    fetchData()
  }, [])

  // Helper functions for data processing
  const getMoodData = (entries: Entry[]) => {
    const moodCounts = entries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return [
      { name: "Happy", value: moodCounts.happy || 0 },
      { name: "Neutral", value: moodCounts.neutral || 0 },
      { name: "Sad", value: moodCounts.sad || 0 },
    ]
  }

  const getWeeklyTrends = (entries: Entry[]) => {
    const now = new Date()
    const start = startOfWeek(now)
    const end = endOfWeek(now)
    const days = eachDayOfInterval({ start, end })

    return days.map(day => {
      const dayEntries = entries.filter(entry => 
        format(parseISO(entry.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      )
      
      return {
        date: format(day, 'EEE'),
        count: dayEntries.length,
        happy: dayEntries.filter(e => e.mood === 'happy').length,
        neutral: dayEntries.filter(e => e.mood === 'neutral').length,
        sad: dayEntries.filter(e => e.mood === 'sad').length,
      }
    })
  }

  const getTimeDistribution = (entries: Entry[]) => {
    if (!entries.length) return []
    
    const timeSlots = entries.reduce((acc, entry) => {
      const hour = parseInt(entry.time.split(':')[0])
      const slot = hour < 12 ? 'morning' : 
                  hour < 17 ? 'afternoon' : 'evening'
      acc[slot] = (acc[slot] || 0) + 1
      return acc
    }, { morning: 0, afternoon: 0, evening: 0 } as Record<string, number>)

    return Object.entries(timeSlots).map(([name, value]) => ({ 
      name: name.charAt(0).toUpperCase() + name.slice(1), 
      value 
    }))
  }

  const getStats = (entries: Entry[]) => ({
    total: entries.length,
    happy: entries.filter(e => e.mood === 'happy').length,
    neutral: entries.filter(e => e.mood === 'neutral').length,
    sad: entries.filter(e => e.mood === 'sad').length,
    avgPerDay: entries.length / 7, // Assuming weekly view
  })

  const thoughtsStats = getStats(thoughts)
  const activitiesStats = getStats(activities)
  const weeklyThoughtTrends = getWeeklyTrends(thoughts)
  const weeklyActivityTrends = getWeeklyTrends(activities)
  const thoughtTimeDistribution = getTimeDistribution(thoughts)
  const activityTimeDistribution = getTimeDistribution(activities)

  // Add safe checks for calculations
  const totalEntries = thoughts.length + activities.length
  const happinessRate = totalEntries > 0 
    ? Math.round((thoughtsStats.happy + activitiesStats.happy) / totalEntries * 100)
    : 0

  const mostActiveTime = [...thoughtTimeDistribution, ...activityTimeDistribution]
    .reduce((acc, curr) => acc.value > curr.value ? acc : curr, { name: 'No data', value: 0 })

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <h1 className="text-3xl font-bold mb-8">Overview</h1>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Move all existing content here */}
          <div className="grid gap-6 md:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{thoughts.length + activities.length}</div>
                <p className="text-xs text-muted-foreground">
                  {thoughts.length} thoughts, {activities.length} activities
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Happiness Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {happinessRate}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Overall positive mood rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((thoughtsStats.avgPerDay + activitiesStats.avgPerDay) * 10) / 10}
                </div>
                <p className="text-xs text-muted-foreground">
                  Entries per day
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Most Active Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mostActiveTime.name}
                </div>
                <p className="text-xs text-muted-foreground">
                  Peak activity period
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Thoughts Mood Distribution</CardTitle>
                <CardDescription>Distribution of moods across your thoughts</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[300px]" config={chartConfig}>
                  <div>
                    <PieChart width={400} height={300}>
                      <Pie
                        data={getMoodData(thoughts)}
                        cx={200}
                        cy={150}
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {getMoodData(thoughts).map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={chartConfig[entry.name.toLowerCase() as keyof typeof chartConfig].color} 
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                    <ChartLegend />
                  </div>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activities Mood Distribution</CardTitle>
                <CardDescription>Distribution of moods across your activities</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[300px]" config={chartConfig}>
                  <div>
                    <PieChart width={400} height={300}>
                      <Pie
                        data={getMoodData(activities)}
                        cx={200}
                        cy={150}
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {getMoodData(activities).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                    <ChartLegend />
                  </div>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Thought Trends</CardTitle>
                <CardDescription>Number of thoughts recorded per day</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[300px]" config={chartConfig}>
                  <LineChart data={weeklyThoughtTrends}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke={chartConfig.count.color} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity Trends</CardTitle>
                <CardDescription>Number of activities recorded per day</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[300px]" config={chartConfig}>
                  <LineChart data={weeklyActivityTrends}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#82ca9d" />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Thought Time Distribution</CardTitle>
                <CardDescription>When you typically record thoughts</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[300px]" config={chartConfig}>
                  <BarChart data={thoughtTimeDistribution}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill={chartConfig.value.color} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity Time Distribution</CardTitle>
                <CardDescription>When you typically record activities</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[300px]" config={chartConfig}>
                  <BarChart data={activityTimeDistribution}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai-insights">
          <Card>
            <CardHeader>
              <CardTitle>AI Analysis & Insights</CardTitle>
              <CardDescription>
                AI-powered analysis of your activities and patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AIFeedbackSection />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AIFeedbackSection() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activity Insights</CardTitle>
            <CardDescription>AI analysis of your activities and patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityFeedback />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thoughts Insights</CardTitle>
            <CardDescription>AI analysis of your thoughts and emotions</CardDescription>
          </CardHeader>
          <CardContent>
            <ThoughtsFeedback />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Achievements</CardTitle>
          <CardDescription>AI analysis of your accomplishments and progress today</CardDescription>
        </CardHeader>
        <CardContent>
          <DailyAchievements />
        </CardContent>
      </Card>
    </div>
  );
}

function ActivityFeedback() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['activityAiFeedback'],
    queryFn: async () => {
      const response = await fetch('/api/ai/get-ai-activity-feedback');
      if (!response.ok) throw new Error('Failed to fetch AI feedback');
      const data = await response.json();
      return data.feedback;
    },
    enabled: false, // Don't run automatically
    staleTime: Infinity, // Keep the data fresh indefinitely
    gcTime: Infinity, // Never remove from cache (formerly cacheTime)
  });

  // Show initial fetch button if no data
  if (!data && !isLoading && !isError) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <p className="text-muted-foreground text-sm">No analysis generated yet</p>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Generate Analysis
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <ErrorMessage />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Regenerating...' : 'Regenerate'}
        </button>
      </div>

      {isFetching ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Activity Patterns and Mood</h3>
            <p className="text-muted-foreground">{data.activityPatterns}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Time Management</h3>
            <p className="text-muted-foreground">{data.timeManagement}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Suggestions for Improvement</h3>
            <p className="text-muted-foreground">{data.suggestions}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Notable Trends</h3>
            <p className="text-muted-foreground">{data.trends}</p>
          </div>
        </>
      )}
    </div>
  );
}

function ThoughtsFeedback() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['thoughtsAiFeedback'],
    queryFn: async () => {
      const response = await fetch('/api/ai/get-thoughts-ai-feedback');
      if (!response.ok) throw new Error('Failed to fetch AI feedback');
      const data = await response.json();
      return data.feedback;
    },
    enabled: false, // Don't run automatically
    staleTime: Infinity, // Keep the data fresh indefinitely
    gcTime: Infinity, // Never remove from cache (formerly cacheTime)
  });

  // Show initial fetch button if no data
  if (!data && !isLoading && !isError) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <p className="text-muted-foreground text-sm">No analysis generated yet</p>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Generate Analysis
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <ErrorMessage />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Regenerating...' : 'Regenerate'}
        </button>
      </div>

      {isFetching ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Thought Patterns</h3>
            <p className="text-muted-foreground">{data.thoughtPatterns}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Emotional Insights</h3>
            <p className="text-muted-foreground">{data.emotionalInsights}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Suggestions</h3>
            <p className="text-muted-foreground">{data.suggestions}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Notable Trends</h3>
            <p className="text-muted-foreground">{data.trends}</p>
          </div>
        </>
      )}
    </div>
  );
}

function DailyAchievements() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['dailyAchievements'],
    queryFn: async () => {
      const response = await fetch('/api/ai/get-daily-achievements');
      if (!response.ok) throw new Error('Failed to fetch achievements');
      return response.json();
    },
    enabled: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  // Show initial fetch button if no data
  if (!data && !isLoading && !isError) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <p className="text-muted-foreground text-sm">No achievements analyzed yet</p>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Generate Analysis
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <ErrorMessage />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Regenerating...' : 'Regenerate'}
        </button>
      </div>

      {isFetching ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Realizări Importante</h3>
            <p className="text-muted-foreground">{data.majorAchievements}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Micile Victorii</h3>
            <p className="text-muted-foreground">{data.smallWins}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Creștere Personală</h3>
            <p className="text-muted-foreground">{data.personalGrowth}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tipare Pozitive</h3>
            <p className="text-muted-foreground">{data.positivePatterns}</p>
          </div>
        </>
      )}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

function ErrorMessage() {
  return (
    <div className="text-destructive py-8 text-center">
      Failed to load AI insights. Please try again later.
    </div>
  );
} 