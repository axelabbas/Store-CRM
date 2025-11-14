import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Users, UserPlus, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { t } from '../lib/translations';

interface Stats {
  totalCustomers: number;
  upcomingBirthdays: number;
  recentCustomers: number;
}

export default function Home() {
  const [stats, setStats] = useState<Stats>({
    totalCustomers: 0,
    upcomingBirthdays: 0,
    recentCustomers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const customersSnapshot = await getDocs(collection(db, 'customers'));
        const totalCustomers = customersSnapshot.size;

        // Calculate upcoming birthdays (next 30 days)
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);

        let upcomingBirthdays = 0;
        customersSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.birthday) {
            const birthday = new Date(data.birthday);
            const thisYearBirthday = new Date(
              now.getFullYear(),
              birthday.getMonth(),
              birthday.getDate()
            );
            if (thisYearBirthday >= now && thisYearBirthday <= thirtyDaysFromNow) {
              upcomingBirthdays++;
            }
          }
        });

        // Get recent customers (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        let recentCustomers = 0;

        customersSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.createdAt) {
            const createdAt = data.createdAt.toDate();
            if (createdAt >= sevenDaysAgo) {
              recentCustomers++;
            }
          }
        });

        setStats({
          totalCustomers,
          upcomingBirthdays,
          recentCustomers,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="space-y-6">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">{t('Customer Relationship Management')}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {t('Manage your customers with elegance and simplicity')}
          </p>
        </div>
        <div className="flex gap-4 pt-2">
          <Button asChild size="lg">
            <Link to="/add-customer">
              <UserPlus className="ml-2 h-5 w-5" />
              {t('Add Customer Button')}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/customers">
              <Users className="ml-2 h-5 w-5" />
              {t('View All Customers')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('Total Customers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.totalCustomers}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('All registered customers')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('Upcoming Birthdays')}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.upcomingBirthdays}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('In the next 30 days')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('New This Week')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.recentCustomers}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('Added in the last 7 days')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>{t('Ready to grow your business?')}</CardTitle>
          <CardDescription>
            {t('Start building meaningful relationships with your customers today')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/add-customer">
              <UserPlus className="ml-2 h-4 w-4" />
              {t('Add Your First Customer')}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}